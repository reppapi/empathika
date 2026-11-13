import type { PrismaClient } from '@prisma/client'

export class TransaksiRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(_params?: { clientId?: string; status?: string }) {
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

    if (_params?.status) {
      where.status_pembayaran = _params.status as any
    }

    return this.prisma.transaksi.findMany({
      where,
      include: {
        client: true,
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
      orderBy: { createdAt: 'desc' },
    })
  }

  async findById(id: string) {
    return this.prisma.transaksi.findFirst({
      where: {
        OR: [{ id }, { kode_transaksi: id }],
      },
      include: {
        client: true,
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

      // Validasi H-1 untuk konsultasi
      if (booking?.jadwal) {
        if (booking.status === 'COMPLETED') {
          throw Object.assign(new Error('Sesi yang sudah selesai tidak dapat direfund'), { statusCode: 422 })
        }
        if (booking.status === 'CANCELLED') {
          throw Object.assign(new Error('Sesi konsultasi sudah dibatalkan sebelumnya'), { statusCode: 409 })
        }

        const sessionDate = new Date(booking.jadwal.tanggal)
        const sessionTime = new Date(booking.jadwal.jam_mulai)
        const sessionDateTime = new Date(
          Date.UTC(
            sessionDate.getUTCFullYear(),
            sessionDate.getUTCMonth(),
            sessionDate.getUTCDate(),
            sessionTime.getUTCHours(),
            sessionTime.getUTCMinutes(),
            0,
            0
          )
        )
        const refundDeadline = new Date(sessionDateTime.getTime() - 24 * 60 * 60 * 1000)

        if (Date.now() > refundDeadline.getTime()) {
          const deadlineStr = refundDeadline.toLocaleString('id-ID', {
            timeZone: 'Asia/Jakarta',
            dateStyle: 'medium',
            timeStyle: 'short',
          })
          throw Object.assign(
            new Error(`Refund ditolak. Batas waktu pengajuan refund maksimal H-1 (24 jam sebelum sesi) telah terlewati pada ${deadlineStr} WIB`),
            {
              statusCode: 422,
              details: {
                batasRefund: refundDeadline.toISOString(),
                batasRefundStr: `${deadlineStr} WIB`,
              },
            }
          )
        }
      }

      const totalTransaksi = Number(transaksi.total)
      // Skema Refund: 70% dikembalikan ke Klien, 30% ditahan (15% Psikolog, 15% Empathika)
      const refundClientPercentage = 0.70
      const refundAmount = Math.round(totalTransaksi * refundClientPercentage)
      const potonganEmpathika = Math.round(totalTransaksi * 0.15)
      const potonganPsikolog = totalTransaksi - refundAmount - potonganEmpathika // sisa pas 15%

      // Keterangan rincian disimpan di alasan refund
      const catatanAlokasi = `[Refund 70%: Rp ${refundAmount.toLocaleString('id-ID')} | Empathika 15%: Rp ${potonganEmpathika.toLocaleString('id-ID')} | Psikolog 15%: Rp ${potonganPsikolog.toLocaleString('id-ID')}] - ${params.alasan}`

      // 1. Update status transaksi menjadi REFUNDED (refund_amount mencatat dana yang dikembalikan ke klien)
      const updatedTransaksi = await tx.transaksi.update({
        where: { id: transaksi.id },
        data: {
          status_pembayaran: 'REFUNDED',
          refund_at: new Date(),
          refund_reason: catatanAlokasi,
          refund_amount: refundAmount,
        },
      })

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
        nominalRefund: refundAmount,
        potonganEmpathika,
        potonganPsikolog,
        persentaseRefund: '70%',
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
}
