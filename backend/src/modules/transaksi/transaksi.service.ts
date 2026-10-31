import type { FastifyInstance } from 'fastify'
import { TransaksiRepository } from './transaksi.repository'
import type {
  CreateTransaksiInput,
  CreateCheckoutTransaksiInput,
} from './transaksi.schema'
import { paymentService } from './payment/payment.service'
import { env } from '../../config/env'

function generateRandomNumberString(length: number): string {
  let res = ''
  for (let i = 0; i < length; i++) {
    res += Math.floor(Math.random() * 10).toString()
  }
  return res
}

export class TransaksiService {
  private repo: TransaksiRepository
  private prisma: any

  constructor(fastify: FastifyInstance) {
    this.repo = new TransaksiRepository(fastify.prisma)
    this.prisma = fastify.prisma
  }

  async getAll(params?: { clientId?: string }) {
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
      message: 'Refund transaksi berhasil diproses. Status telah diperbarui ke REFUNDED.',
      transaksiId: result.transaksi.id,
      kodeTransaksi: result.transaksi.kode_transaksi,
      nominalRefund: result.nominalRefund,
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
      // 1. Dapatkan atau buat data Client
      const rawPhone = input.no_telepon.trim()
      const digitsOnly = rawPhone.replace(/\D/g, '')

      let client = null
      if (loggedInClientId) {
        client = await tx.client.findUnique({ where: { id: loggedInClientId } })
      }

      if (!client) {
        client = await tx.client.findFirst({
          where: {
            OR: [
              { no_telepon: rawPhone },
              ...(digitsOnly.length >= 8 ? [{ no_telepon: digitsOnly }] : []),
            ],
          },
        })
      }

      if (!client) {
        client = await tx.client.create({
          data: {
            nama: input.nama.trim(),
            no_telepon: rawPhone,
            usia: input.usia,
            jenis_kelamin: input.jenis_kelamin,
          },
        })
      } else {
        // Update nama jika belum ada
        if (input.nama.trim() && !client.nama) {
          await tx.client.update({
            where: { id: client.id },
            data: { nama: input.nama.trim() },
          }).catch(() => {})
        }
      }

      let nominal = 0
      let deskripsiTagihan = ''
      let kodePesanan = ''

      // ── TIPE 1: KONSELING ───────────────────────────────────────────
      if (input.tipe === 'KONSELING') {
        // Cari slot jadwal
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

        // Ambil info layanan
        const layanan = await tx.layanan.findFirst({ where: { aktif: true } })
        nominal = layanan?.harga_weekday ? Number(layanan.harga_weekday) : 200000
        kodePesanan = `W-${generateRandomNumberString(6)}`
        deskripsiTagihan = `Konseling Psikologi (${slot.psikolog?.nama_gelar || 'Psikolog'}) - ${kodePesanan}`

        // Update status slot
        await tx.jadwalSlot.update({
          where: { id: slot.id },
          data: { status: 'SUDAH_DIBOOKING' },
        })

        // Buat Transaksi
        const transaksi = await tx.transaksi.create({
          data: {
            id_client: client.id,
            kode_transaksi: kodePesanan,
            tipe_transaksi: 'KONSULTASI',
            subtotal: nominal,
            biaya_admin: 0,
            total: nominal,
            metode_pembayaran: (input.metode_pembayaran || 'QRIS').toUpperCase(),
            channel_pembayaran: input.channel_pembayaran || null,
            status_pembayaran: 'PENDING',
          },
        })

        // Buat BookingKonsultasi
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

        // Buat invoice Xendit
        const invoice = await paymentService.createInvoice({
          externalId: kodePesanan,
          amount: nominal,
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

        // Simpan data invoice di transaksi
        await tx.transaksi.update({
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
          booking: bookingKonsul,
          invoiceUrl: invoice.invoice_url,
          invoiceId: invoice.id,
        }
      }

      // ── TIPE 2: EVENT ───────────────────────────────────────────────
      if (input.tipe === 'EVENT') {
        const event = await tx.event.findUnique({
          where: { id: input.id_item },
          include: { _count: { select: { booking_event: true } } },
        })

        if (!event) {
          throw Object.assign(new Error('Event tidak ditemukan'), { statusCode: 404 })
        }

        const bookedCount = event._count.booking_event
        if (bookedCount >= event.kuota) {
          throw Object.assign(new Error('Kuota pendaftaran event ini sudah penuh'), { statusCode: 409 })
        }

        nominal = Number(event.harga)
        kodePesanan = `EVT-${generateRandomNumberString(6)}`
        deskripsiTagihan = `Pendaftaran Event: ${event.judul} - ${kodePesanan}`

        // Buat Transaksi
        const transaksi = await tx.transaksi.create({
          data: {
            id_client: client.id,
            kode_transaksi: kodePesanan,
            tipe_transaksi: 'EVENT',
            subtotal: nominal,
            biaya_admin: 0,
            total: nominal,
            metode_pembayaran: (input.metode_pembayaran || 'QRIS').toUpperCase(),
            channel_pembayaran: input.channel_pembayaran || null,
            status_pembayaran: 'PENDING',
          },
        })

        // Buat BookingEvent
        const bookingEvent = await tx.bookingEvent.create({
          data: {
            id_event: event.id,
            id_client: client.id,
            id_transaksi: transaksi.id,
            kode_tiket: `TIKET-${kodePesanan}`,
            status: 'PENDING',
          },
        })

        // Buat invoice Xendit
        const invoice = await paymentService.createInvoice({
          externalId: kodePesanan,
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

        // Jika gratis, cari versi berbayar jika ada
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
        kodePesanan = `PSI-${generateRandomNumberString(6)}`
        deskripsiTagihan = `Tes Psikotes Premium: ${paket.judul} - ${kodePesanan}`

        // Buat Transaksi
        const transaksi = await tx.transaksi.create({
          data: {
            id_client: client.id,
            kode_transaksi: kodePesanan,
            tipe_transaksi: 'PSIKOTES',
            subtotal: nominal,
            biaya_admin: 0,
            total: nominal,
            metode_pembayaran: (input.metode_pembayaran || 'QRIS').toUpperCase(),
            channel_pembayaran: input.channel_pembayaran || null,
            status_pembayaran: 'PENDING',
          },
        })

        // Buat BookingPsikotes
        const bookingPsikotes = await tx.bookingPsikotes.create({
          data: {
            id_paket: paket.id,
            id_client: client.id,
            id_transaksi: transaksi.id,
          },
        })

        // Buat invoice Xendit
        const invoice = await paymentService.createInvoice({
          externalId: kodePesanan,
          amount: nominal,
          payerEmail: input.email || undefined,
          description: deskripsiTagihan,
          customer: {
            given_names: input.nama,
            email: input.email || undefined,
            mobile_number: input.no_telepon,
          },
          successRedirectUrl: input.success_redirect_url || `${env.FRONTEND_URL}/psikotes/success?orderId=${kodePesanan}&testId=${paket.id}&status=success`,
          failureRedirectUrl: input.failure_redirect_url || `${env.FRONTEND_URL}/psikotes/checkout?orderId=${kodePesanan}&testId=${paket.id}&status=failed`,
        })

        await tx.transaksi.update({
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
    // Cari booking konsultasi yang bersangkutan
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
        kode_transaksi: booking.kode_pesanan,
      })

      await this.prisma.bookingKonsultasi.update({
        where: { id: booking.id },
        data: { id_transaksi: transaksi.id },
      })
    }

    // Inisiasi Xendit Invoice
    const invoice = await paymentService.createInvoice({
      externalId: transaksi.kode_transaksi || transaksi.id,
      amount: Number(transaksi.total),
      description: `Konseling Psikologi (${booking.jadwal?.psikolog?.nama_gelar || 'Psikolog'}) - ${transaksi.kode_transaksi}`,
      customer: {
        given_names: booking.client?.nama,
        mobile_number: booking.client?.no_telepon,
      },
      successRedirectUrl: `${env.FRONTEND_URL}/konseling/success?orderId=${transaksi.kode_transaksi}&status=success`,
      failureRedirectUrl: `${env.FRONTEND_URL}/konseling/bayar?orderId=${transaksi.kode_transaksi}&status=failed`,
    })

    // Simpan info invoice URL ke data pembayaran
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
      paymentUrl: invoice.invoice_url,
      invoiceId: invoice.id,
    }
  }

  /**
   * Menangani Callback Webhook dari Xendit (Invoice Callback)
   */
  async handleWebhook(payload: Record<string, unknown>) {
    // Format payload Xendit Invoice:
    // { id, external_id, status: 'PAID' | 'EXPIRED' | 'PENDING', payment_method, payment_channel, paid_amount, paid_at, ... }
    const externalId = (payload.external_id || payload.id || payload.transaction_id) as string
    const status = ((payload.status || payload.transaction_status) as string || '').toUpperCase()

    let mappedStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' = 'PENDING'
    if (status === 'PAID' || status === 'SETTLED' || status === 'COMPLETED') {
      mappedStatus = 'PAID'
    } else if (status === 'EXPIRED' || status === 'FAILED' || status === 'CANCELLED') {
      mappedStatus = 'FAILED'
    }

    console.log(`[Xendit Webhook] Menerima update status invoice '${externalId}' -> ${status} (mapped: ${mappedStatus})`)

    return this.repo.updateStatus(externalId, mappedStatus, payload)
  }
}
