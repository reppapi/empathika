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

  /**
   * Menghitung metrik ringkasan operasional admin (5 kartu metrik)
   */
  async getOperationalMetricsData(
    monthStart: Date,
    monthEnd: Date,
    lastMonthStart: Date,
    lastMonthEnd: Date,
    yesterdayEnd: Date
  ) {
    // 1. Pendapatan Bulan Ini (Transaksi Berstatus PAID)
    const paidTransactionsThisMonth = await this.prisma.transaksi.findMany({
      where: {
        status_pembayaran: 'PAID',
        OR: [
          { tanggal_bayar: { gte: monthStart, lte: monthEnd } },
          {
            tanggal_bayar: null,
            createdAt: { gte: monthStart, lte: monthEnd },
          },
        ],
      },
      select: { total: true },
    })

    const paidTransactionsLastMonth = await this.prisma.transaksi.findMany({
      where: {
        status_pembayaran: 'PAID',
        OR: [
          { tanggal_bayar: { gte: lastMonthStart, lte: lastMonthEnd } },
          {
            tanggal_bayar: null,
            createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
          },
        ],
      },
      select: { total: true },
    })

    const totalIncomeThisMonth = paidTransactionsThisMonth.reduce(
      (acc, t) => acc + Number(t.total || 0),
      0
    )
    const totalIncomeLastMonth = paidTransactionsLastMonth.reduce(
      (acc, t) => acc + Number(t.total || 0),
      0
    )

    // 2. Total Klien Aktif
    const totalClients = await this.prisma.client.count()
    const clientsBeforeYesterday = await this.prisma.client.count({
      where: {
        createdAt: { lte: yesterdayEnd },
      },
    })
    const newClientsSinceYesterday = totalClients - clientsBeforeYesterday

    // 3. Sesi Konseling Selesai (Akumulasi Bulan Ini)
    const completedSessionsThisMonth = await this.prisma.bookingKonsultasi.count({
      where: {
        status: 'COMPLETED',
        NOT: { status: 'CANCELLED' },
        OR: [
          { jadwal: { tanggal: { gte: monthStart, lte: monthEnd } } },
          { updatedAt: { gte: monthStart, lte: monthEnd } },
        ],
      },
    })

    // 4. Pendaftar Workshop & Event Aktif
    const activeEventsCount = await this.prisma.event.count({
      where: {
        status: { in: ['UPCOMING', 'ONGOING'] },
      },
    })

    const bookingEvents = await this.prisma.bookingEvent.findMany({
      where: {
        event: {
          status: { in: ['UPCOMING', 'ONGOING'] },
        },
        NOT: { status: 'CANCELLED' },
      },
      select: { jumlah_peserta: true },
    })
    const totalEventParticipants = bookingEvents.reduce(
      (acc, b) => acc + (b.jumlah_peserta || 1),
      0
    )

    // 5. Menunggu Pembayaran
    const pendingPaymentCount = await this.prisma.transaksi.count({
      where: {
        status_pembayaran: 'PENDING',
      },
    })

    return {
      totalIncomeThisMonth,
      totalIncomeLastMonth,
      totalClients,
      newClientsSinceYesterday,
      completedSessionsThisMonth,
      activeEventsCount,
      totalEventParticipants,
      pendingPaymentCount,
    }
  }
}
