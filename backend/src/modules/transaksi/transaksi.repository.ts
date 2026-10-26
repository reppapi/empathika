import type { PrismaClient } from '@prisma/client'

export class TransaksiRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(_params?: { clientId?: string; status?: string }) {
    return this.prisma.transaksi.findMany()
  }

  async findById(id: string) {
    return this.prisma.transaksi.findUnique({
      where: { id },
    })
  }

  async findByClientId(id_client: string) {
    return this.prisma.transaksi.findMany({
      where: { id_client },
    })
  }

  // Alias untuk kompatibilitas jika ada yang memanggil findByUserId
  async findByUserId(id_client: string) {
    return this.findByClientId(id_client)
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
    return this.prisma.$transaction(async (tx) => {
      const updatedTransaksi = await tx.transaksi.update({
        where: { id },
        data: {
          status_pembayaran: status as any,
          ...(status === 'PAID' && { tanggal_bayar: new Date() }),
          ...(paymentData && { data_pembayaran: JSON.stringify(paymentData) }),
        } as any,
      })

      // Sinkronkan status BookingKonsultasi terkait
      const booking = await tx.bookingKonsultasi.findFirst({
        where: { id_transaksi: id },
        include: { jadwal: true },
      })

      if (booking) {
        if (status === 'PAID') {
          await tx.bookingKonsultasi.update({
            where: { id: booking.id },
            data: { status: 'CONFIRMED' },
          })
        } else if (status === 'FAILED') {
          await tx.bookingKonsultasi.update({
            where: { id: booking.id },
            data: { status: 'CANCELLED' },
          })
          if (booking.id_jadwal) {
            await tx.jadwalSlot.update({
              where: { id: booking.id_jadwal },
              data: { status: 'TERSEDIA' },
            }).catch(() => {})
          }
          if (booking.jadwal?.id_psikolog) {
            await tx.psikolog.update({
              where: { id: booking.jadwal.id_psikolog },
              data: { jumlah_sesi: { decrement: 1 } },
            }).catch(() => {})
          }
        }
      }

      return updatedTransaksi
    })
  }
}
