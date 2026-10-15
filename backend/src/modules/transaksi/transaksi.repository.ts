import type { PrismaClient } from '@prisma/client'

export class TransaksiRepository {
  constructor(private prisma: PrismaClient) { }

  async findAll(_params?: { userId?: string; status?: string }) {
    return this.prisma.transaksi.findMany()
  }

  async findById(id: string) {
    return this.prisma.transaksi.findUnique({
      where: { id },
    })
  }

  async findByUserId(id_user: string) {
    return this.prisma.transaksi.findMany({
      where: { id_client: id_user },
    })
  }

  async findByClientId(id_client: string) {
    return this.prisma.transaksi.findMany({
      where: { id_client },
    })
  }

  async create(data: { id_booking?: string; id_user?: string; id_client?: string; jumlah: number; metode_pembayaran: string }) {
    return this.prisma.transaksi.create({
      data: {
        id_client: data.id_client || data.id_user || '',
        subtotal: data.jumlah,
        biaya_admin: 0,
        metode_pembayaran: (data.metode_pembayaran?.toUpperCase() === 'TRANSFER_BANK'
          ? 'TRANSFER_BANK'
          : data.metode_pembayaran?.toUpperCase() === 'E_WALLET'
            ? 'E_WALLET'
            : 'QRIS') as any,
      } as any,
    })
  }

  async updateStatus(id: string, status: string, paymentData?: Record<string, unknown>) {
    return this.prisma.transaksi.update({
      where: { id },
      data: {
        status_pembayaran: status as any,
        tanggal_bayar: status === 'PAID' ? new Date() : undefined,
        ...(paymentData && { data_pembayaran: JSON.stringify(paymentData) }),
      } as any,
    })
  }
}
