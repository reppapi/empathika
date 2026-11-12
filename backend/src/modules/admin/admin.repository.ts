import type { PrismaClient, Prisma } from '@prisma/client'

export class AdminRepository {
  constructor(private prisma: PrismaClient) {}

  async findAdminUtama(id?: string) {
    if (id) {
      return this.prisma.account.findUnique({
        where: { id },
      })
    }
    return this.prisma.account.findFirst({
      where: { role: 'ADMIN', aktif: true },
      orderBy: { createdAt: 'asc' },
    })
  }

  async findAccountByEmail(email: string) {
    return this.prisma.account.findUnique({
      where: { email },
    })
  }

  async updateAdminProfile(id: string, data: Prisma.AccountUpdateInput) {
    return this.prisma.account.update({
      where: { id },
      data,
    })
  }

  /**
   * Mengambil seluruh sesi konsultasi/asesmen terkonfirmasi dalam rentang tanggal jadwal tertentu
   */
  async getConfirmedSessionsBetween(startDate: Date, endDate: Date) {
    return this.prisma.bookingKonsultasi.findMany({
      where: {
        jadwal: {
          tanggal: {
            gte: startDate,
            lte: endDate,
          },
        },
        OR: [
          { status: { in: ['CONFIRMED', 'COMPLETED'] } },
          { transaksi: { status_pembayaran: 'PAID' } },
        ],
        NOT: {
          status: 'CANCELLED',
        },
      },
      include: {
        jadwal: true,
      },
    })
  }
}
