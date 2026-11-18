import type { FastifyInstance } from 'fastify'
import { TransaksiRepository } from './transaksi.repository'
import type {
  CreateTransaksiInput,
  CreateCheckoutTransaksiInput,
  AdminTransaksiQueryInput,
} from './transaksi.schema'
import { paymentService } from './payment/payment.service'
import { env } from '../../config/env'
import { generateOrderId, generateTrxId, normalizePhoneNumber } from '../../utils'
import { hitungTransaksi } from './transaksi.calc'

export class TransaksiService {
  private repo: TransaksiRepository
  private prisma: any

  constructor(fastify: FastifyInstance) {
    this.repo = new TransaksiRepository(fastify.prisma)
    this.prisma = fastify.prisma
  }

  async getAll(params?: AdminTransaksiQueryInput & { clientId?: string }) {
    return this.repo.findAll(params)
  }

  async getMyTransaksi(clientId: string) {
    return this.repo.findByClientId(clientId)
  }

  async getById(id: string) {
    const transaksi = await this.repo.findById(id)
    if (!transaksi) {
      throw Object.assign(new Error('Transaksi tidak ditemukan'), { statusCode: 404 })
    }
    return transaksi
  }

  async processRefund(params: {
    transaksiId: string
    adminName: string
    alasan: string
  }) {
    const result = await this.repo.refundTransaksi(params)
    return {
      success: true,
      message: `Refund transaksi berhasil diproses. Rp${result.nominalDitahan?.toLocaleString('id-ID') ?? '150.000'} ditahan (DP hangus); Rp${result.nominalRefund?.toLocaleString('id-ID') ?? '0'} dikembalikan ke klien.`,
      transaksiId: result.transaksi.id,
      kodeTransaksi: result.transaksi.kode_transaksi,
      totalTransaksi: result.totalTransaksi,
      nominalDitahan: result.nominalDitahan,     // Rp150.000 yang ditahan
      nominalRefund: result.nominalRefund,        // Sisa yang dikembalikan ke client
      porsiPsikologDP: result.porsiPsikologDP,   // Bagian psikolog dari nominal ditahan
      porsiEmpathikaDP: result.porsiEmpathikaDP, // Bagian Empathika dari nominal ditahan
      tipeSesi: result.tipeSesi,
      statusPembayaran: result.transaksi.status_pembayaran,
      refundAt: result.transaksi.refund_at,
      refundReason: result.transaksi.refund_reason,
      booking: result.booking
        ? {
            id: result.booking.id,
            kodePesanan: result.booking.kode_pesanan,
            statusBooking: result.booking.status,
            namaKlien: result.booking.client?.nama,
          }
        : null,
    }
  }

  /**
   * Universal Checkout: Konseling, Event, dan Psikotes
   * Membuat entri Client -> Transaksi -> Booking -> Xendit Invoice
   */
  async createUniversalCheckout(input: CreateCheckoutTransaksiInput, loggedInClientId?: string) {
    return this.prisma.$transaction(async (tx: any) => {
      // 1. Dapatkan atau buat data Client (kombinasi nomor telepon DAN nama case-insensitive)
      const inputName = (input.nama || '').trim()
      const rawPhone = (input.no_telepon || '').trim()
      const standardizedPhone = normalizePhoneNumber(rawPhone) || rawPhone
      const digitsOnly = rawPhone.replace(/\D/g, '')

      let client: any = null
      if (loggedInClientId) {
        client = await tx.client.findUnique({ where: { id: loggedInClientId } })
      }

      if (!client) {
        const phoneConditions = rawPhone ? [
          { no_telepon: standardizedPhone },
          { no_telepon: rawPhone },
          ...(digitsOnly.length >= 8 ? [
            { no_telepon: digitsOnly },
            { no_telepon: '0' + (standardizedPhone.startsWith('62') ? standardizedPhone.slice(2) : digitsOnly) },
          ] : []),
        ] : []

        if (inputName && phoneConditions.length > 0) {
          client = await tx.client.findFirst({
            where: {
              AND: [
                { OR: phoneConditions },
                { nama: { equals: inputName, mode: 'insensitive' } },
              ],
            },
          })
        } else if (phoneConditions.length > 0) {
          client = await tx.client.findFirst({
            where: { OR: phoneConditions },
          })
        } else if (inputName) {
          client = await tx.client.findFirst({
            where: { nama: { equals: inputName, mode: 'insensitive' } },
          })
        }
      }

      if (!client) {
        client = await tx.client.create({
          data: {
            nama: inputName || 'Klien',
            no_telepon: standardizedPhone || null,
            usia: input.usia,
            jenis_kelamin: input.jenis_kelamin,
          },
        })
      } else {
        const updateData: any = {}
        if (standardizedPhone && client.no_telepon !== standardizedPhone) {
          updateData.no_telepon = standardizedPhone
        }
        if (input.usia !== undefined && input.usia !== null && input.usia !== client.usia) {
          updateData.usia = input.usia
        }
        if (input.jenis_kelamin && input.jenis_kelamin !== client.jenis_kelamin) {
          updateData.jenis_kelamin = input.jenis_kelamin
        }
        if (Object.keys(updateData).length > 0) {
          await tx.client.update({
            where: { id: client.id },
            data: updateData,
          }).catch(() => {})
        }
      }

      let nominal = 0
      let deskripsiTagihan = ''
      let kodePesanan = ''
      const kodeTransaksi = generateTrxId()

      // ── TIPE 1: KONSELING ───────────────────────────────────────────
      if (input.tipe === 'KONSELING') {
        const slot = await tx.jadwalSlot.findUnique({
          where: { id: input.id_item },
          include: { psikolog: true },
        })

        if (!slot) {
          throw Object.assign(new Error('Slot jadwal konseling tidak ditemukan'), { statusCode: 404 })
        }
        if (slot.status === 'SUDAH_DIBOOKING') {
          throw Object.assign(new Error('Slot jadwal ini sudah dibooking. Silakan pilih slot lain.'), { statusCode: 409 })
        }

        const layanan = await tx.layanan.findFirst({ where: { aktif: true } })
        const hargaDasar = layanan?.harga_weekday ? Number(layanan.harga_weekday) : 200000
        kodePesanan = generateOrderId('KONS')
        deskripsiTagihan = `Konseling Psikologi (${slot.psikolog?.nama_gelar || 'Psikolog'}) - ${kodePesanan}`

        await tx.jadwalSlot.update({
          where: { id: slot.id },
          data: { status: 'SUDAH_DIBOOKING' },
        })

        // Hitung rincian biaya (harga dasar, komisi biro, biaya layanan/Xendit fee, total)
        const metodeBayar = (input.metode_pembayaran || 'QRIS').toUpperCase()
        const tipeSesi = (input.metode_layanan || 'ONLINE').toUpperCase() as 'ONLINE' | 'OFFLINE'
        const dariBiro = Boolean(input.id_biro)
        const rincian = hitungTransaksi(hargaDasar, tipeSesi, metodeBayar, dariBiro)

        const transaksi = await tx.transaksi.create({
          data: {
            id_client: client.id,
            id_biro_tenant: input.id_biro || null,
            kode_transaksi: kodeTransaksi,
            tipe_transaksi: 'KONSULTASI',
            harga_dasar: rincian.hargaDasar,
            biaya_layanan: rincian.biayaLayanan,
            komisi_biro: rincian.komisiBiro,
            subtotal: rincian.subtotalKlien,
            biaya_admin: rincian.biayaLayanan, // backward compatibility
            total: rincian.total,
            metode_pembayaran: metodeBayar,
            channel_pembayaran: input.channel_pembayaran || null,
            status_pembayaran: 'PENDING',
          },
        })

        const bookingKonsul = await tx.bookingKonsultasi.create({
          data: {
            kode_pesanan: kodePesanan,
            id_client: client.id,
            id_layanan: layanan?.id || (await tx.layanan.findFirst())?.id,
            id_jadwal: slot.id,
            id_transaksi: transaksi.id,
            metode: input.metode_layanan || 'ONLINE',
            deskripsi_trauma: input.catatan || null,
            status: 'PENDING',
          },
        })

        const invoice = await paymentService.createInvoice({
          externalId: kodeTransaksi,
          amount: rincian.total,
          payerEmail: input.email || undefined,
          description: deskripsiTagihan,
          customer: {
            given_names: input.nama,
            email: input.email || undefined,
            mobile_number: input.no_telepon,
          },
          successRedirectUrl: input.success_redirect_url || `${env.FRONTEND_URL}/konseling/success?orderId=${kodePesanan}&status=success`,
          failureRedirectUrl: input.failure_redirect_url || `${env.FRONTEND_URL}/konseling/bayar?orderId=${kodePesanan}&status=failed`,
        })

        await tx.transaksi.update({
          where: { id: transaksi.id },
          data: {
            data_pembayaran: JSON.stringify({
              nama_pemesan: input.nama ? input.nama.trim() : undefined,
              no_telepon_pemesan: input.no_telepon ? input.no_telepon.trim() : undefined,
              email_pemesan: input.email ? input.email.trim() : undefined,
              xendit_invoice_id: invoice.id,
              xendit_invoice_url: invoice.invoice_url,
              expiry_date: invoice.expiry_date,
            }),
          },
        })

        return {
          transaksi,
          booking: bookingKonsul,
          invoiceUrl: invoice.invoice_url,
          invoiceId: invoice.id,
        }
      }

      // ── TIPE 2: EVENT ───────────────────────────────────────────────
      if (input.tipe === 'EVENT') {
        const event = await tx.event.findUnique({
          where: { id: input.id_item },
        })

        if (!event) {
          throw Object.assign(new Error('Event tidak ditemukan'), { statusCode: 404 })
        }

        // Validasi status event: pendaftaran tidak bisa dilakukan jika event telah selesai, dibatalkan, atau masih draft
        if (event.status === 'COMPLETED') {
          throw Object.assign(new Error('Pendaftaran event ini telah selesai dan ditutup'), { statusCode: 409 })
        }
        if (event.status === 'CANCELLED') {
          throw Object.assign(new Error('Event ini telah dibatalkan'), { statusCode: 409 })
        }
        if (event.status === 'DRAFT') {
          throw Object.assign(new Error('Pendaftaran event ini sedang dinonaktifkan'), { statusCode: 409 })
        }

        const jumlahPesertaPendaftaran = input.kuota_bundling && input.kuota_bundling > 0 ? input.kuota_bundling : 1

        // Hitung total peserta yang sudah terdaftar (status PENDING atau CONFIRMED)
        const bookedAgg = await tx.bookingEvent.aggregate({
          where: {
            id_event: event.id,
            status: { in: ['PENDING', 'CONFIRMED'] },
          },
          _sum: {
            jumlah_peserta: true,
          },
        })
        const bookedPesertaCount = bookedAgg._sum.jumlah_peserta || 0

        if (bookedPesertaCount + jumlahPesertaPendaftaran > event.kuota) {
          throw Object.assign(new Error('Kuota pendaftaran event ini tidak mencukupi untuk jumlah tiket yang dipilih'), { statusCode: 409 })
        }

        // Tentukan harga: jika bundling, cari harga paket bundling yang sesuai
        if (jumlahPesertaPendaftaran > 1) {
          let bundlePriceFound: number | null = null
          if (Array.isArray(event.paket_bundling)) {
            const matchedPkg = (event.paket_bundling as any[]).find(
              (p) => p.kuota_tiket === jumlahPesertaPendaftaran
            )
            if (matchedPkg && matchedPkg.harga_paket) {
              bundlePriceFound = Number(matchedPkg.harga_paket)
            }
          }
          if (bundlePriceFound === null && event.harga_bundling) {
            bundlePriceFound = Number(event.harga_bundling)
          }
          nominal = bundlePriceFound !== null ? bundlePriceFound : Number(event.harga) * jumlahPesertaPendaftaran
        } else {
          nominal = Number(event.harga)
        }

        kodePesanan = generateOrderId('EVT')
        deskripsiTagihan = `Pendaftaran Event: ${event.judul} - ${kodePesanan}`

        const transaksi = await tx.transaksi.create({
          data: {
            id_client: client.id,
            kode_transaksi: kodeTransaksi,
            tipe_transaksi: 'EVENT',
            subtotal: nominal,
            biaya_admin: 0,
            total: nominal,
            metode_pembayaran: (input.metode_pembayaran || 'QRIS').toUpperCase(),
            channel_pembayaran: input.channel_pembayaran || null,
            status_pembayaran: 'PENDING',
          },
        })

        const bookingEvent = await tx.bookingEvent.create({
          data: {
            id_event: event.id,
            id_client: client.id,
            id_transaksi: transaksi.id,
            kode_tiket: kodePesanan,
            jumlah_peserta: jumlahPesertaPendaftaran,
            nama_peserta_tambahan: input.nama_peserta_tambahan ? (input.nama_peserta_tambahan as any) : undefined,
            status: 'PENDING',
          },
        })

        const invoice = await paymentService.createInvoice({
          externalId: kodeTransaksi,
          amount: nominal,
          payerEmail: input.email || undefined,
          description: deskripsiTagihan,
          customer: {
            given_names: input.nama,
            email: input.email || undefined,
            mobile_number: input.no_telepon,
          },
          successRedirectUrl: input.success_redirect_url || `${env.FRONTEND_URL}/event/success?orderId=${kodePesanan}&status=success`,
          failureRedirectUrl: input.failure_redirect_url || `${env.FRONTEND_URL}/event/checkout?orderId=${kodePesanan}&status=failed`,
        })

        await tx.transaksi.update({
          where: { id: transaksi.id },
          data: {
            data_pembayaran: JSON.stringify({
              nama_pemesan: input.nama ? input.nama.trim() : undefined,
              no_telepon_pemesan: input.no_telepon ? input.no_telepon.trim() : undefined,
              email_pemesan: input.email ? input.email.trim() : undefined,
              xendit_invoice_id: invoice.id,
              xendit_invoice_url: invoice.invoice_url,
              expiry_date: invoice.expiry_date,
            }),
          },
        })

        return {
          transaksi,
          booking: bookingEvent,
          invoiceUrl: invoice.invoice_url,
          invoiceId: invoice.id,
        }
      }

      // ── TIPE 3: PSIKOTES (PREMIUM / BERBAYAR) ─────────────────────────
      if (input.tipe === 'PSIKOTES') {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.id_item)
        let paket = await tx.paketPsikotes.findFirst({
          where: isUuid
            ? { id: input.id_item }
            : {
                OR: [
                  { judul: { equals: input.id_item, mode: 'insensitive' } },
                  { judul: { contains: input.id_item, mode: 'insensitive' } },
                ],
              },
        })

        if (!paket) {
          throw Object.assign(new Error(`Paket psikotes '${input.id_item}' tidak ditemukan`), { statusCode: 404 })
        }

        if (paket.jenis_akses === 'GRATIS') {
          const berbayar = await tx.paketPsikotes.findFirst({
            where: {
              judul: { equals: paket.judul.trim(), mode: 'insensitive' },
              jenis_akses: 'BERBAYAR',
            },
          })
          if (berbayar) paket = berbayar
        }

        nominal = Number(paket.harga) > 0 ? Number(paket.harga) : 50000
        kodePesanan = generateOrderId('PSI')
        deskripsiTagihan = `Tes Psikotes Premium: ${paket.judul} - ${kodePesanan}`

        const transaksi = await tx.transaksi.create({
          data: {
            id_client: client.id,
            kode_transaksi: kodeTransaksi,
            tipe_transaksi: 'PSIKOTES',
            subtotal: nominal,
            biaya_admin: 0,
            total: nominal,
            metode_pembayaran: (input.metode_pembayaran || 'QRIS').toUpperCase(),
            channel_pembayaran: input.channel_pembayaran || null,
            status_pembayaran: 'PENDING',
          },
        })

        const bookingPsikotes = await tx.bookingPsikotes.create({
          data: {
            id_paket: paket.id,
            id_client: client.id,
            id_transaksi: transaksi.id,
            kode_akses: kodePesanan,
            status_pengerjaan: 'BELUM_MULAI',
          },
        })

        const invoice = await paymentService.createInvoice({
          externalId: kodeTransaksi,
          amount: nominal,
          payerEmail: input.email || undefined,
          description: deskripsiTagihan,
          customer: {
            given_names: input.nama,
            email: input.email || undefined,
            mobile_number: input.no_telepon,
          },
          successRedirectUrl: input.success_redirect_url || `${env.FRONTEND_URL}/psikotes/success?orderId=${kodePesanan}&bookingId=${bookingPsikotes.id}&testId=${paket.id}&status=success`,
          failureRedirectUrl: input.failure_redirect_url || `${env.FRONTEND_URL}/psikotes/checkout?orderId=${kodePesanan}&testId=${paket.id}&status=failed`,
        })

        await tx.transaksi.update({
          where: { id: transaksi.id },
          data: {
            data_pembayaran: JSON.stringify({
              nama_pemesan: input.nama ? input.nama.trim() : undefined,
              no_telepon_pemesan: input.no_telepon ? input.no_telepon.trim() : undefined,
              email_pemesan: input.email ? input.email.trim() : undefined,
              xendit_invoice_id: invoice.id,
              xendit_invoice_url: invoice.invoice_url,
              expiry_date: invoice.expiry_date,
            }),
          },
        })

        return {
          transaksi,
          booking: bookingPsikotes,
          invoiceUrl: invoice.invoice_url,
          invoiceId: invoice.id,
        }
      }

      throw Object.assign(new Error('Tipe transaksi tidak valid'), { statusCode: 400 })
    })
  }

  /**
   * Endpoint legacy createPayment: buat invoice Xendit untuk booking konsultasi yang sudah ada
   */
  async createPayment(input: CreateTransaksiInput, clientId: string) {
    const booking = await this.prisma.bookingKonsultasi.findUnique({
      where: { id: input.bookingId },
      include: {
        layanan: true,
        jadwal: { include: { psikolog: true } },
        client: true,
      },
    })

    if (!booking) {
      throw Object.assign(new Error('Booking tidak ditemukan'), { statusCode: 404 })
    }

    const nominal = booking.layanan?.harga_weekday ? Number(booking.layanan.harga_weekday) : 150000

    let transaksi = null
    if (booking.id_transaksi) {
      transaksi = await this.prisma.transaksi.findUnique({ where: { id: booking.id_transaksi } })
    }

    if (!transaksi) {
      transaksi = await this.repo.create({
        id_booking: booking.id,
        id_client: clientId || booking.id_client,
        jumlah: nominal,
        metode_pembayaran: input.paymentMethod,
        tipe_transaksi: 'KONSULTASI',
        kode_transaksi: generateTrxId(),
      })

      await this.prisma.bookingKonsultasi.update({
        where: { id: booking.id },
        data: { id_transaksi: transaksi.id },
      })
    }

    const invoice = await paymentService.createInvoice({
      externalId: transaksi.kode_transaksi || transaksi.id,
      amount: Number(transaksi.total),
      description: `Konseling Psikologi (${booking.jadwal?.psikolog?.nama_gelar || 'Psikolog'}) - ${booking.kode_pesanan}`,
      customer: {
        given_names: booking.client?.nama,
        mobile_number: booking.client?.no_telepon,
      },
      successRedirectUrl: `${env.FRONTEND_URL}/konseling/success?orderId=${booking.kode_pesanan}&status=success`,
      failureRedirectUrl: `${env.FRONTEND_URL}/konseling/bayar?orderId=${booking.kode_pesanan}&status=failed`,
    })

    await this.prisma.transaksi.update({
      where: { id: transaksi.id },
      data: {
        data_pembayaran: JSON.stringify({
          xendit_invoice_id: invoice.id,
          xendit_invoice_url: invoice.invoice_url,
          expiry_date: invoice.expiry_date,
        }),
      },
    })

    return {
      transaksi,
      invoiceUrl: invoice.invoice_url,
      invoiceId: invoice.id,
    }
  }

  async handleWebhook(payload: any) {
    return this.prisma.$transaction(async (tx: any) => {
      const invoiceId = payload.id
      const externalId = payload.external_id
      const status = payload.status

      const transaksi = await tx.transaksi.findFirst({
        where: {
          OR: [
            { kode_transaksi: externalId },
            { id: externalId },
            { data_pembayaran: { contains: invoiceId } },
          ],
        },
        include: {
          booking_konsultasi: { include: { jadwal: true } },
          booking_event: true,
          booking_psikotes: true,
        },
      })

      if (!transaksi) {
        return
      }

      // Idempotency guard: jika sudah PAID sebelumnya, skip seluruh pemrosesan
      if (transaksi.status_pembayaran === 'PAID' && (status === 'PAID' || status === 'SETTLED')) {
        return
      }

      let newStatus: any = 'PENDING'
      if (status === 'PAID' || status === 'SETTLED') {
        newStatus = 'PAID'
      } else if (status === 'EXPIRED') {
        newStatus = 'FAILED'
      }

      await tx.transaksi.update({
        where: { id: transaksi.id },
        data: {
          status_pembayaran: newStatus,
          tanggal_bayar: newStatus === 'PAID' ? new Date() : undefined,
          channel_pembayaran: payload.payment_channel || transaksi.channel_pembayaran,
        },
      })

      if (transaksi.booking_konsultasi) {
        await tx.bookingKonsultasi.update({
          where: { id: transaksi.booking_konsultasi.id },
          data: {
            status: newStatus === 'PAID' ? 'CONFIRMED' : newStatus === 'FAILED' ? 'CANCELLED' : 'PENDING',
          },
        })
      }

      if (transaksi.booking_event) {
        await tx.bookingEvent.update({
          where: { id: transaksi.booking_event.id },
          data: {
            status: newStatus === 'PAID' ? 'CONFIRMED' : newStatus === 'FAILED' ? 'CANCELLED' : 'PENDING',
          },
        })
      }

      // ── Catat pembagian ke ledger PembagianTransaksi saat PAID ──────────────
      // Pembagian hanya berlaku untuk transaksi KONSULTASI (bukan event/psikotes
      // karena event/psikotes tidak ada payout ke psikolog tertentu).
      // Payout ke psikolog BELUM dikirim di sini — dipicu saat sesi SELESAI.
      if (newStatus === 'PAID' && transaksi.tipe_transaksi === 'KONSULTASI') {
        try {
          // Pastikan belum ada ledger untuk transaksi ini (idempotency)
          const existingPembagian = await tx.pembagianTransaksi.count({
            where: { id_transaksi: transaksi.id },
          })

          if (existingPembagian === 0) {
            const hargaDasar = transaksi.harga_dasar
              ? Number(transaksi.harga_dasar)
              : Number(transaksi.subtotal) // fallback ke subtotal untuk data lama

            const metode = (transaksi.metode_pembayaran as string) || 'QRIS'
            const tipeSesi = (transaksi.booking_konsultasi?.metode || 'ONLINE').toUpperCase() as 'OFFLINE' | 'ONLINE'
            const dariBiro = Boolean(transaksi.id_biro_tenant)

            const hasil = hitungTransaksi(hargaDasar, tipeSesi, metode, dariBiro)

            // Baris 1: Porsi psikolog
            // Mencari id psikolog dari booking -> jadwal
            const idPsikolog = transaksi.booking_konsultasi?.jadwal?.id_psikolog ?? null
            await tx.pembagianTransaksi.create({
              data: {
                id_transaksi: transaksi.id,
                penerima_tipe: 'PSIKOLOG',
                penerima_id: idPsikolog,
                jumlah: hasil.porsiPsikolog,
                alasan: 'SESI_NORMAL',
                status: 'BELUM_DICAIRKAN',
              },
            })

            // Baris 2: Porsi Empathika (tetap di saldo Xendit, tidak ada payout)
            await tx.pembagianTransaksi.create({
              data: {
                id_transaksi: transaksi.id,
                penerima_tipe: 'EMPATHIKA',
                penerima_id: null,
                jumlah: hasil.porsiEmpathika,
                alasan: 'SESI_NORMAL',
                status: 'BERHASIL', // Langsung BERHASIL — tidak perlu payout keluar
              },
            })

            // Baris 3: Porsi biro (jika ada)
            if (dariBiro && hasil.komisiBiro > 0) {
              await tx.pembagianTransaksi.create({
                data: {
                  id_transaksi: transaksi.id,
                  penerima_tipe: 'BIRO',
                  penerima_id: transaksi.id_biro_tenant,
                  jumlah: hasil.komisiBiro,
                  alasan: 'SESI_NORMAL',
                  status: 'BELUM_DICAIRKAN',
                },
              })
            }
          }
        } catch (ledgerErr: any) {
          // Gagal catat ledger tidak boleh menggagalkan webhook — log saja
          console.error('[Webhook] Gagal mencatat ledger pembagian transaksi:', ledgerErr?.message)
        }
      }
    })
  }

  /**
   * Simulasi konfirmasi pembayaran (development/testing frontend)
   */
  async confirmSimulation(identifier: string) {
    return this.prisma.$transaction(async (tx: any) => {
      const transaksi = await tx.transaksi.findFirst({
        where: {
          OR: [
            { id: identifier },
            { kode_transaksi: identifier },
            { booking_konsultasi: { id: identifier } },
            { booking_konsultasi: { kode_pesanan: identifier } },
            { booking_event: { id: identifier } },
            { booking_event: { kode_tiket: identifier } },
            { booking_psikotes: { id: identifier } },
          ],
        },
        include: {
          booking_konsultasi: true,
          booking_event: true,
          booking_psikotes: true,
        },
      })

      if (!transaksi) {
        throw Object.assign(new Error('Transaksi tidak ditemukan'), { statusCode: 404 })
      }

      if (transaksi.status_pembayaran === 'PAID') {
        return { message: 'Transaksi sudah dibayar sebelumnya', transaksi }
      }

      const updatedTrx = await tx.transaksi.update({
        where: { id: transaksi.id },
        data: {
          status_pembayaran: 'PAID',
          tanggal_bayar: new Date(),
        },
      })

      if (transaksi.booking_konsultasi) {
        await tx.bookingKonsultasi.update({
          where: { id: transaksi.booking_konsultasi.id },
          data: { status: 'CONFIRMED' },
        })
        if (transaksi.booking_konsultasi.id_jadwal) {
          await tx.jadwalSlot.update({
            where: { id: transaksi.booking_konsultasi.id_jadwal },
            data: { status: 'SUDAH_DIBOOKING' },
          }).catch(() => {})
        }
      }

      if (transaksi.booking_event) {
        await tx.bookingEvent.update({
          where: { id: transaksi.booking_event.id },
          data: { status: 'CONFIRMED' },
        })
      }

      return { transaksi: updatedTrx }
    })
  }
}
