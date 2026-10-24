import type { PrismaClient } from '@prisma/client'

export class TransaksiRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(_params?: { clientId?: string; status?: string }) {
    return this.prisma.transaksi.findMany({
      include: {
        client: true,
        booking_konsultasi: {
          include: {
            layanan: true,
            jadwal: {
              include: {
                psikolog: {
                  include: { account: true },
                },
              },
            },
          },
        },
        invoice: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findById(id: string) {
    return this.prisma.transaksi.findUnique({
      where: { id },
      include: {
        client: true,
        booking_konsultasi: {
          include: {
            layanan: true,
            jadwal: {
              include: {
                psikolog: {
                  include: { account: true },
                },
              },
            },
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
        invoice: true,
      },
    })
  }

  // Alias untuk kompatibilitas jika ada yang memanggil findByUserId
  async findByUserId(id_client: string) {
    return this.findByClientId(id_client)
  }

  async refundTransaksi(params: {
    transaksiId: string
    adminName: string
    alasan: string
  }) {
    return this.prisma.$transaction(async (tx) => {
      const transaksi = await tx.transaksi.findUnique({
        where: { id: params.transaksiId },
        include: {
          client: true,
          booking_konsultasi: {
            include: {
              layanan: true,
              jadwal: true,
            },
          },
        },
      })

      if (!transaksi) {
        throw Object.assign(new Error('Transaksi tidak ditemukan'), { statusCode: 404 })
      }

      // Validasi: hanya transaksi PAID yang bisa direfund
      if (transaksi.status_pembayaran === 'REFUNDED') {
        throw Object.assign(new Error('Transaksi ini sudah pernah direfund sebelumnya'), { statusCode: 409 })
      }
      if (transaksi.status_pembayaran !== 'PAID') {
        throw Object.assign(new Error('Hanya transaksi dengan status lunas (PAID) yang dapat direfund'), { statusCode: 422 })
      }

      const booking = transaksi.booking_konsultasi

      // Jika terhubung dengan booking konsultasi, validasi batas H-1
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

      const refundAmount = Number(transaksi.total)

      // 1. Update status transaksi menjadi REFUNDED dan catat audit refund
      const updatedTransaksi = await tx.transaksi.update({
        where: { id: transaksi.id },
        data: {
          status_pembayaran: 'REFUNDED',
          refund_at: new Date(),
          refund_reason: params.alasan,
          refund_by_admin: params.adminName,
          refund_amount: refundAmount,
        },
      })

      // 2. Jika ada booking terkait, batalkan sesi dan bebaskan slot jadwal psikolog
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
          })
        }
      }

      return {
        transaksi: updatedTransaksi,
        booking: updatedBooking,
        nominalRefund: refundAmount,
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
  }) {
    const total = data.jumlah
    return this.prisma.transaksi.create({
      data: {
        id_client: data.id_client,
        tipe_transaksi: (data.tipe_transaksi ?? 'KONSULTASI') as any,
        subtotal: data.jumlah,
        biaya_admin: 0,
        total: total,
        metode_pembayaran: (data.metode_pembayaran?.toUpperCase() === 'TRANSFER_BANK'
          ? 'TRANSFER_BANK'
          : data.metode_pembayaran?.toUpperCase() === 'E_WALLET'
          ? 'E_WALLET'
          : 'QRIS') as any,
        channel_pembayaran: data.channel_pembayaran ?? data.metode_pembayaran,
        ...(data.kode_transaksi && { kode_transaksi: data.kode_transaksi }),
      },
    })
  }

  async updateStatus(id: string, status: string, paymentData?: Record<string, unknown>) {
    return this.prisma.transaksi.update({
      where: { id },
      data: {
        status_pembayaran: status as any,
        ...(status === 'PAID' && { tanggal_bayar: new Date() }),
        ...(paymentData && { data_pembayaran: JSON.stringify(paymentData) }),
      } as any,
    })
  }
}
