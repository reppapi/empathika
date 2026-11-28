import type { PrismaClient } from '@prisma/client'
import type { AdminTransaksiQueryInput } from './transaksi.schema'

export class TransaksiRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Hitung summary aggregate langsung dari DB — tidak tergantung pagination list.
   * Dipakai untuk kartu ringkasan di dashboard admin transaksi.
   */
  async getSummary(params?: { bulan?: number; tahun?: number; tanggal?: string; biroId?: string }) {
    const now = new Date()
    const tahun = params?.tahun ?? now.getFullYear()

    const baseWhere: any = {
      OR: [
        { booking_konsultasi: { isNot: null } },
        { booking_psikotes: { isNot: null } },
        { booking_event: { isNot: null } },
      ],
    }

    if (params?.biroId) {
      baseWhere.AND = [
        {
          OR: [
            { id_biro_tenant: params.biroId },
            { client: { id_biro: params.biroId } },
          ],
        },
      ]
    }

    // Filter periode (konsisten WIB / UTC+7)
    let periodeWhere: any = {}
    if (params?.tanggal) {
      // Filter hari tertentu (WIB)
      const start = new Date(`${params.tanggal}T00:00:00.000+07:00`)
      const end = new Date(`${params.tanggal}T23:59:59.999+07:00`)
      periodeWhere = { tanggal_bayar: { gte: start, lte: end } }
    } else if (params?.bulan) {
      const mStr = String(params.bulan).padStart(2, '0')
      const lastDay = new Date(Date.UTC(tahun, params.bulan, 0)).getUTCDate()
      const start = new Date(`${tahun}-${mStr}-01T00:00:00.000+07:00`)
      const end = new Date(`${tahun}-${mStr}-${String(lastDay).padStart(2, '0')}T23:59:59.999+07:00`)
      periodeWhere = { tanggal_bayar: { gte: start, lte: end } }
    } else {
      // Default: tahun berjalan (WIB)
      const start = new Date(`${tahun}-01-01T00:00:00.000+07:00`)
      const end = new Date(`${tahun}-12-31T23:59:59.999+07:00`)
      periodeWhere = { tanggal_bayar: { gte: start, lte: end } }
    }

    const paidWhere = { ...baseWhere, status_pembayaran: 'PAID', ...periodeWhere }
    const menungguWhere = { ...baseWhere, status_pembayaran: 'PENDING' }

    const [paidAgg, transaksiBerhasil, menungguBayar] = await Promise.all([
      this.prisma.transaksi.aggregate({ _sum: { total: true }, where: paidWhere }),
      this.prisma.transaksi.count({ where: paidWhere }),
      this.prisma.transaksi.count({ where: menungguWhere }),
    ])

    return {
      totalPendapatan: Number(paidAgg._sum.total ?? 0),
      transaksiBerhasil,
      menungguBayar,
    }
  }

  async findAll(_params?: AdminTransaksiQueryInput & { clientId?: string }) {
    const page = _params?.page ?? 1
    const limit = _params?.limit ?? 20
    const isAll = _params?.all === true
    const skip = (page - 1) * limit

    const where: any = {
      OR: [
        { booking_konsultasi: { isNot: null } },
        { booking_psikotes: { isNot: null } },
        { booking_event: { isNot: null } },
      ],
    }

    if (_params?.clientId) {
      where.id_client = _params.clientId
    }

    if (_params?.biroId) {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
        {
          OR: [
            { id_biro_tenant: _params.biroId },
            { client: { id_biro: _params.biroId } },
          ],
        },
      ]
    }

    if (_params?.status) {
      where.status_pembayaran = _params.status as any
    }

    if (_params?.search?.trim()) {
      const term = _params.search.trim()
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { kode_transaksi: { contains: term, mode: 'insensitive' } },
            { client: { nama: { contains: term, mode: 'insensitive' } } },
            { client: { email: { contains: term, mode: 'insensitive' } } },
          ],
        },
      ]
    }

    const include = {
      client: {
        include: {
          biro: {
            select: {
              id: true,
              nama_biro: true,
              slug: true,
            },
          },
        },
      },
      biro_tenant: {
        select: {
          id: true,
          nama_biro: true,
          slug: true,
        },
      },
      booking_konsultasi: {
        include: {
          layanan: true,
          jadwal: {
            include: {
              psikolog: {
                include: {
                  account: {
                    select: {
                      id: true,
                      nama: true,
                      email: true,
                      no_telepon: true,
                      foto: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      booking_psikotes: {
        include: {
          paket: {
            select: {
              id: true,
              judul: true,
              jenis_akses: true,
              harga: true,
            },
          },
          client: true,
        },
      },
      booking_event: {
        include: {
          event: true,
          client: true,
        },
      },
      invoice: true,
    }

    if (isAll) {
      const [data, total] = await Promise.all([
        this.prisma.transaksi.findMany({
          where,
          include,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.transaksi.count({ where }),
      ])

      return {
        data,
        pagination: {
          total,
          page: 1,
          limit: total,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.transaksi.findMany({
        where,
        include,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.transaksi.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit) || 1

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
  }

  async findById(id: string) {
    return this.prisma.transaksi.findFirst({
      where: {
        OR: [{ id }, { kode_transaksi: id }],
      },
      include: {
        client: {
          include: {
            biro: {
              select: {
                id: true,
                nama_biro: true,
                slug: true,
              },
            },
          },
        },
        biro_tenant: {
          select: {
            id: true,
            nama_biro: true,
            slug: true,
          },
        },
        booking_konsultasi: {
          include: {
            layanan: true,
            jadwal: {
              include: {
                psikolog: {
                  include: {
                    account: {
                      select: {
                        id: true,
                        nama: true,
                        email: true,
                        no_telepon: true,
                        foto: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        booking_psikotes: {
          include: {
            paket: true,
            client: true,
            hasil_tes: {
              include: {
                interpretasi: true,
              },
            },
          },
        },
        booking_event: {
          include: {
            event: true,
            client: true,
          },
        },
        invoice: true,
      },
    })
  }

  async findByClientId(id_client: string) {
    return this.prisma.transaksi.findMany({
      where: { id_client },
      include: {
        booking_konsultasi: {
          include: {
            layanan: true,
            jadwal: {
              include: { psikolog: true },
            },
          },
        },
        booking_psikotes: {
          include: {
            paket: true,
            hasil_tes: {
              include: {
                interpretasi: true,
              },
            },
          },
        },
        booking_event: {
          include: {
            event: true,
          },
        },
        invoice: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findByUserId(id_client: string) {
    return this.findByClientId(id_client)
  }

  async refundTransaksi(params: {
    transaksiId: string
    adminName: string
    alasan: string
    biroId?: string
  }) {
    return this.prisma.$transaction(async (tx) => {
      const transaksi = await tx.transaksi.findFirst({
        where: { OR: [{ id: params.transaksiId }, { kode_transaksi: params.transaksiId }] },
        include: {
          client: true,
          booking_konsultasi: {
            include: {
              layanan: true,
              jadwal: true,
            },
          },
          booking_event: {
            include: { event: true },
          },
          booking_psikotes: {
            include: { paket: true },
          },
        },
      })

      if (!transaksi) {
        throw Object.assign(new Error('Transaksi tidak ditemukan'), { statusCode: 404 })
      }

      if (params.biroId) {
        const isOwner =
          transaksi.id_biro_tenant === params.biroId ||
          transaksi.client?.id_biro === params.biroId
        if (!isOwner) {
          throw Object.assign(new Error('Anda tidak memiliki akses untuk merefund transaksi biro lain'), { statusCode: 403 })
        }
      }

      if (transaksi.status_pembayaran === 'REFUNDED') {
        throw Object.assign(new Error('Transaksi ini sudah pernah direfund sebelumnya'), { statusCode: 409 })
      }
      if (transaksi.status_pembayaran !== 'PAID') {
        throw Object.assign(new Error('Hanya transaksi dengan status lunas (PAID) yang dapat direfund'), { statusCode: 422 })
      }

      // Validasi: Hanya Konsultasi & Asesmen Offline (BookingKonsultasi) yang dapat direfund
      // Event, Psikotes Online, dan Webinar bersifat final dan tidak dapat direfund
      if (transaksi.tipe_transaksi === 'EVENT' || transaksi.booking_event) {
        throw Object.assign(new Error('Pendaftaran Event / Workshop bersifat final dan tidak dapat di-refund'), { statusCode: 422 })
      }
      if (transaksi.tipe_transaksi === 'PSIKOTES' || transaksi.booking_psikotes) {
        throw Object.assign(new Error('Pembelian Paket Tes Psikotes Online bersifat final dan tidak dapat di-refund'), { statusCode: 422 })
      }

      const booking = transaksi.booking_konsultasi
      if (!booking) {
        throw Object.assign(new Error('Refund hanya berlaku untuk layanan Konsultasi dan Asesmen Offline'), { statusCode: 422 })
      }

      // Validasi sesi konsultasi
      if (booking?.jadwal) {
        if (booking.status === 'COMPLETED') {
          throw Object.assign(new Error('Sesi yang sudah selesai tidak dapat direfund'), { statusCode: 422 })
        }
        if (booking.status === 'CANCELLED') {
          throw Object.assign(new Error('Sesi konsultasi sudah dibatalkan sebelumnya'), { statusCode: 409 })
        }
      }

      // ── Validasi Batas Waktu Refund Sesuai Aturan Baru ──
      // - > H-3 (> 72 jam): Refund 100% penuh
      // - Antara H-3 sampai > 3 jam: Refund 70% (potongan 30%)
      // - <= 3 jam: Refund ditolak oleh sistem
      let persenRefund = 100
      let persenPotongan = 0
      let kategoriRefund: 'FULL_REFUND' | 'POTONGAN_30' = 'FULL_REFUND'

      if (booking?.jadwal) {
        const { evaluateRefundEligibility } = await import('../../utils/date-time.js')
        const evaluasi = evaluateRefundEligibility(booking.jadwal.tanggal, booking.jadwal.jam_mulai)

        if (evaluasi.kategori === 'DITOLAK') {
          throw Object.assign(
            new Error(evaluasi.alasanPenolakan || 'Refund ditolak karena batas waktu pengajuan telah terlewati'),
            {
              statusCode: 422,
              details: {
                batasRefund3Jam: evaluasi.refundDeadline3Jam.toISOString(),
              },
            }
          )
        }

        persenRefund = evaluasi.persenRefund
        persenPotongan = evaluasi.persenPotongan
        kategoriRefund = evaluasi.kategori
      }

      const totalTransaksi = Number(transaksi.total)
      const tipeSesi = (booking?.metode || 'ONLINE').toUpperCase() === 'OFFLINE' ? 'OFFLINE' : 'ONLINE'
      const persenPsikolog = tipeSesi === 'OFFLINE' ? 60 : 50

      const nominalRefund = Math.floor((totalTransaksi * persenRefund) / 100)
      const nominalDitahan = totalTransaksi - nominalRefund // potongan (0 atau 30%)

      // Pembagian potongan (bila ada potongan 30%):
      // Jika refund 100%: nominalDitahan = 0, porsi potongan psikolog = 0
      const porsiPsikologPotongan = Math.floor((nominalDitahan * persenPsikolog) / 100)
      const porsiEmpathikaPotongan = nominalDitahan - porsiPsikologPotongan

      const catatanAlokasi = [
        `[Refund ${persenRefund}% - Potongan ${persenPotongan}%]`,
        `Kategori: ${kategoriRefund}`,
        `Total dibayar: Rp ${totalTransaksi.toLocaleString('id-ID')}`,
        `Dikembalikan ke klien: Rp ${nominalRefund.toLocaleString('id-ID')} (${persenRefund}%)`,
        `Potongan ditahan: Rp ${nominalDitahan.toLocaleString('id-ID')} (${persenPotongan}%)`,
        nominalDitahan > 0
          ? `(Hak Psikolog: Rp ${porsiPsikologPotongan.toLocaleString('id-ID')}, Empathika: Rp ${porsiEmpathikaPotongan.toLocaleString('id-ID')})`
          : '',
        `Alasan: ${params.alasan}`,
      ].filter(Boolean).join(' | ')

      // 1. Update status transaksi menjadi REFUNDED
      const updatedTransaksi = await tx.transaksi.update({
        where: { id: transaksi.id },
        data: {
          status_pembayaran: 'REFUNDED',
          refund_at: new Date(),
          refund_reason: catatanAlokasi,
          refund_amount: nominalRefund,
          nominal_ditahan: nominalDitahan,
          nominal_dikembalikan: nominalRefund,
          alasan_penahanan: params.alasan,
        },
      })

      // 1b. Update / hapus ledger pembagian transaksi:
      // Jika refund penuh 100%, bagian psikolog menjadi 0
      // Jika potongan 30%, bagian psikolog dihitung dari nominal setelah potongan
      const idPsikolog = booking?.jadwal?.id_psikolog ?? null
      if (kategoriRefund === 'FULL_REFUND') {
        // Hapus atau nolkan ledger pembagian
        await tx.pembagianTransaksi.updateMany({
          where: { id_transaksi: transaksi.id, penerima_tipe: 'PSIKOLOG' },
          data: {
            jumlah: 0,
            status: 'BERHASIL',
            catatan_pembayaran: 'Refund penuh 100% (tidak ada honor yang dibayarkan)',
          },
        })
      } else {
        // Potongan 30%: porsi psikolog dihitung dari nominal potongan
        await tx.pembagianTransaksi.updateMany({
          where: { id_transaksi: transaksi.id, penerima_tipe: 'PSIKOLOG' },
          data: {
            jumlah: porsiPsikologPotongan,
            alasan: 'REFUND_POTONGAN_30',
            catatan_pembayaran: `Refund 70% (potongan 30% sebesar Rp ${nominalDitahan.toLocaleString('id-ID')})`,
          },
        })
      }

      // 2. Jika Konsultasi: batalkan sesi & bebaskan slot
      let updatedBooking = null
      if (booking) {
        updatedBooking = await tx.bookingKonsultasi.update({
          where: { id: booking.id },
          data: {
            status: 'CANCELLED',
          },
          include: {
            client: true,
            layanan: true,
            jadwal: {
              include: { psikolog: true },
            },
          },
        })

        if (booking.id_jadwal) {
          await tx.jadwalSlot.update({
            where: { id: booking.id_jadwal },
            data: { status: 'TERSEDIA' },
          }).catch(() => {})
        }
      }

      return {
        transaksi: updatedTransaksi,
        booking: updatedBooking,
        totalTransaksi,
        nominalRefund,
        nominalDitahan,
        persenRefund,
        persenPotongan,
        porsiPsikologPotongan,
        porsiEmpathikaPotongan,
        tipeSesi,
      }
    })
  }

  async create(data: {
    id_booking?: string
    id_client: string
    jumlah: number
    metode_pembayaran: string
    tipe_transaksi?: 'KONSULTASI' | 'EVENT' | 'PSIKOTES'
    channel_pembayaran?: string
    kode_transaksi?: string
    data_pembayaran?: string
  }) {
    const total = data.jumlah
    const rawMetode = (data.metode_pembayaran || 'QRIS').toUpperCase()
    const mappedMetode =
      rawMetode === 'TRANSFER_BANK' || rawMetode === 'BANK'
        ? 'TRANSFER_BANK'
        : rawMetode === 'E_WALLET' || rawMetode === 'EWALLET'
        ? 'E_WALLET'
        : 'QRIS'

    return this.prisma.transaksi.create({
      data: {
        id_client: data.id_client,
        tipe_transaksi: (data.tipe_transaksi ?? 'KONSULTASI') as any,
        subtotal: data.jumlah,
        biaya_admin: 0,
        total: total,
        metode_pembayaran: mappedMetode as any,
        channel_pembayaran: data.channel_pembayaran ?? data.metode_pembayaran,
        ...(data.kode_transaksi && { kode_transaksi: data.kode_transaksi }),
        ...(data.data_pembayaran && { data_pembayaran: data.data_pembayaran }),
      },
    })
  }

  async updateStatus(identifier: string, status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED', paymentData?: Record<string, unknown>) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.transaksi.findFirst({
        where: {
          OR: [{ id: identifier }, { kode_transaksi: identifier }],
        },
        include: {
          booking_konsultasi: { include: { jadwal: true } },
          booking_event: true,
          booking_psikotes: true,
        },
      })

      if (!existing) {
        console.warn(`[TransaksiRepo] Transaksi dengan ID / kode '${identifier}' tidak ditemukan saat update status.`)
        return null
      }

      // Persiapkan data pembayaran tersimpan (merge dengan data sebelumnya jika JSON)
      let mergedDataStr: string | undefined = undefined
      if (paymentData) {
        try {
          const oldData = existing.data_pembayaran ? JSON.parse(existing.data_pembayaran) : {}
          mergedDataStr = JSON.stringify({ ...oldData, ...paymentData })
        } catch {
          mergedDataStr = JSON.stringify(paymentData)
        }
      }

      const updatedTransaksi = await tx.transaksi.update({
        where: { id: existing.id },
        data: {
          status_pembayaran: status,
          ...(status === 'PAID' && !existing.tanggal_bayar && { tanggal_bayar: new Date() }),
          ...(mergedDataStr && { data_pembayaran: mergedDataStr }),
        },
      })

      // ── SINKRONISASI 1: Booking Konsultasi ──
      const bookingKonsul = existing.booking_konsultasi
      if (bookingKonsul) {
        if (status === 'PAID') {
          await tx.bookingKonsultasi.update({
            where: { id: bookingKonsul.id },
            data: { status: 'CONFIRMED' },
          })
        } else if (status === 'FAILED') {
          await tx.bookingKonsultasi.update({
            where: { id: bookingKonsul.id },
            data: { status: 'CANCELLED' },
          })
          if (bookingKonsul.id_jadwal) {
            await tx.jadwalSlot.update({
              where: { id: bookingKonsul.id_jadwal },
              data: { status: 'TERSEDIA' },
            }).catch(() => {})
          }
          if (bookingKonsul.jadwal?.id_psikolog) {
            await tx.psikolog.update({
              where: { id: bookingKonsul.jadwal.id_psikolog },
              data: { jumlah_sesi: { decrement: 1 } },
            }).catch(() => {})
          }
        }
      }

      // ── SINKRONISASI 2: Booking Event ──
      const bookingEvent = existing.booking_event
      if (bookingEvent) {
        if (status === 'PAID') {
          await tx.bookingEvent.update({
            where: { id: bookingEvent.id },
            data: { status: 'CONFIRMED' },
          })
        } else if (status === 'FAILED') {
          await tx.bookingEvent.update({
            where: { id: bookingEvent.id },
            data: { status: 'CANCELLED' },
          })
        }
      }

      return updatedTransaksi
    })
  }

  // ── REKAP PEMBAGIAN PENDAPATAN PSIKOLOG ──
  async getRekapPembagianPsikolog(params: {
    id_psikolog?: string
    status?: 'BELUM_DICAIRKAN' | 'BERHASIL' | 'ALL'
    search?: string
    bulan?: number
    tahun?: number
    tanggal?: string
  }) {
    const where: any = {
      penerima_tipe: 'PSIKOLOG',
    }

    if (params.id_psikolog) {
      where.penerima_id = params.id_psikolog
    }

    if (params.status && params.status !== 'ALL') {
      where.status = params.status
    }

    // Filter berdasarkan tanggal spesifik atau bulan & tahun (createdAt, konsisten WIB / UTC+7)
    if (params.tanggal) {
      const startOfDay = new Date(`${params.tanggal}T00:00:00.000+07:00`)
      const endOfDay = new Date(`${params.tanggal}T23:59:59.999+07:00`)
      where.createdAt = { gte: startOfDay, lte: endOfDay }
    } else if (params.bulan && params.tahun) {
      const mStr = String(params.bulan).padStart(2, '0')
      const lastDay = new Date(Date.UTC(params.tahun, params.bulan, 0)).getUTCDate()
      const startOfMonth = new Date(`${params.tahun}-${mStr}-01T00:00:00.000+07:00`)
      const endOfMonth = new Date(`${params.tahun}-${mStr}-${String(lastDay).padStart(2, '0')}T23:59:59.999+07:00`)
      where.createdAt = { gte: startOfMonth, lte: endOfMonth }
    } else if (params.tahun) {
      const startOfYear = new Date(`${params.tahun}-01-01T00:00:00.000+07:00`)
      const endOfYear = new Date(`${params.tahun}-12-31T23:59:59.999+07:00`)
      where.createdAt = { gte: startOfYear, lte: endOfYear }
    }

    const pembagianList = await this.prisma.pembagianTransaksi.findMany({
      where,
      include: {
        transaksi: {
          include: {
            client: true,
            booking_konsultasi: {
              include: {
                layanan: true,
                jadwal: {
                  include: {
                    psikolog: {
                      include: {
                        account: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Fetch fallback data psikolog jika item.transaksi?.booking_konsultasi?.jadwal?.psikolog null
    const missingPsikologIds = Array.from(
      new Set(
        pembagianList
          .filter((it: any) => !it.transaksi?.booking_konsultasi?.jadwal?.psikolog && it.penerima_id)
          .map((it: any) => it.penerima_id as string)
      )
    )
    const fallbackPsikologMap = new Map<string, any>()
    if (missingPsikologIds.length > 0) {
      const listFallback = await this.prisma.psikolog.findMany({
        where: { id: { in: missingPsikologIds } },
        include: { account: true },
      })
      listFallback.forEach((p: any) => fallbackPsikologMap.set(p.id, p))
    }

    // Kelompokkan per psikolog
    const mapPsikolog = new Map<string, any>()

    for (const item of pembagianList) {
      const psikologFromBooking = item.transaksi?.booking_konsultasi?.jadwal?.psikolog
      const psikolog = psikologFromBooking || (item.penerima_id ? fallbackPsikologMap.get(item.penerima_id) : null)
      const account = psikolog?.account
      const idPsikolog = item.penerima_id || psikolog?.id || 'unknown'
      const namaPsikolog = account?.nama || psikolog?.nama_gelar || 'Psikolog'

      if (params.search) {
        const query = params.search.toLowerCase()
        if (!namaPsikolog.toLowerCase().includes(query)) {
          continue
        }
      }

      if (!mapPsikolog.has(idPsikolog)) {
        mapPsikolog.set(idPsikolog, {
          idPsikolog,
          namaPsikolog,
          rekeningBank: psikolog?.bank_code ? `${psikolog.bank_code} - ${psikolog.nomor_rekening} (a.n ${psikolog.nama_pemilik_rek || namaPsikolog})` : '-',
          jumlahSesi: 0,
          totalPendapatan: 0,
          totalBagianPsikolog: 0,
          totalBelumDibayarkan: 0,
          totalSudahDibayarkan: 0,
          status: 'BELUM_DICAIRKAN', // jika masih ada yang belum dicairkan
          items: [],
        })
      }

      const entry = mapPsikolog.get(idPsikolog)!
      const nominalPorsi = Number(item.jumlah)
      const totalTransaksi = Number(item.transaksi?.total || 0)

      entry.jumlahSesi += 1
      entry.totalPendapatan += totalTransaksi
      entry.totalBagianPsikolog += nominalPorsi

      if (item.status === 'BERHASIL') {
        entry.totalSudahDibayarkan += nominalPorsi
      } else {
        entry.totalBelumDibayarkan += nominalPorsi
      }

      entry.items.push({
        id: item.id,
        idTransaksi: item.id_transaksi,
        kodeTransaksi: item.transaksi?.kode_transaksi,
        tanggal: item.createdAt,
        layanan: item.transaksi?.booking_konsultasi?.layanan?.nama || 'Konseling',
        namaKlien: item.transaksi?.client?.nama || '-',
        totalTransaksi,
        bagianPsikolog: nominalPorsi,
        alasan: item.alasan,
        status: item.status,
        tanggalDibayarkan: item.tanggal_dibayarkan,
        dibayarkanOleh: item.dibayarkan_oleh,
        catatanPembayaran: item.catatan_pembayaran,
      })
    }

    const rekap = Array.from(mapPsikolog.values()).map((p) => ({
      ...p,
      status: p.totalBelumDibayarkan === 0 ? 'BERHASIL' : 'BELUM_DICAIRKAN',
    }))

    return rekap
  }

  // ── TANDAI SUDAH DIBAYARKAN OLEH DIREKTUR / ADMIN ──
  async markPembagianDibayarkan(params: {
    idPembagian?: string
    idPsikolog?: string
    tanggalDibayarkan?: Date
    dibayarkanOleh?: string
    catatan?: string
  }) {
    const tanggalBayar = params.tanggalDibayarkan || new Date()

    if (params.idPembagian) {
      return this.prisma.pembagianTransaksi.update({
        where: { id: params.idPembagian },
        data: {
          status: 'BERHASIL',
          tanggal_dibayarkan: tanggalBayar,
          dibayarkan_oleh: params.dibayarkanOleh || 'Direktur',
          catatan_pembayaran: params.catatan || 'Ditransfer manual oleh Direktur',
        },
      })
    }

    if (params.idPsikolog) {
      return this.prisma.pembagianTransaksi.updateMany({
        where: {
          penerima_id: params.idPsikolog,
          penerima_tipe: 'PSIKOLOG',
          status: 'BELUM_DICAIRKAN',
        },
        data: {
          status: 'BERHASIL',
          tanggal_dibayarkan: tanggalBayar,
          dibayarkan_oleh: params.dibayarkanOleh || 'Direktur',
          catatan_pembayaran: params.catatan || 'Ditransfer manual oleh Direktur',
        },
      })
    }

    throw new Error('idPembagian atau idPsikolog wajib disertakan')
  }
}