import type { PrismaClient } from '@prisma/client'

export class TransaksiRepository {
  constructor(private prisma: PrismaClient) {}

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
      where: { id_user },
    })
  }

  async create(data: { id_booking: string; id_user: string; jumlah: number; metode_pembayaran: string }) {
    return this.prisma.transaksi.create({ data: data as any })
  }

  async updateStatus(id: string, status: string, paymentData?: Record<string, unknown>) {
    return this.prisma.transaksi.update({
      where: { id },
      data: { status: status as any, ...(paymentData && { data_pembayaran: JSON.stringify(paymentData) }) } as any,
    })
  }
}
