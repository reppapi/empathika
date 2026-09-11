import type { PrismaClient } from '@prisma/client'

export class TransaksiRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(params?: { userId?: string; status?: string }) {
    return this.prisma.transaksi.findMany({
      where: { ...(params?.userId && { userId: params.userId }) },
      include: { booking: true },
    })
  }

  async findById(id: string) {
    return this.prisma.transaksi.findUnique({
      where: { id },
      include: { booking: { include: { psikolog: true } } },
    })
  }

  async findByUserId(userId: string) {
    return this.prisma.transaksi.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(data: { bookingId: string; userId: string; amount: number; paymentMethod: string }) {
    return this.prisma.transaksi.create({ data })
  }

  async updateStatus(id: string, status: string, paymentData?: Record<string, unknown>) {
    return this.prisma.transaksi.update({
      where: { id },
      data: { status, ...(paymentData && { paymentData: JSON.stringify(paymentData) }) },
    })
  }
}
