import type { PrismaClient, Prisma } from '@prisma/client'

export class AdminRepository {
  constructor(private prisma: PrismaClient) {}

  async findAdminUtama(id?: string) {
    if (id && id !== 'admin-dev') {
      const account = await this.prisma.account.findUnique({
        where: { id },
      })
      if (account) return account
    }
    return this.prisma.account.findFirst({
      where: { role: 'ADMIN' },
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
  async getConfirmedSessionsBetween(startDate: Date, endDate: Date, biroId?: string) {
    return this.prisma.bookingKonsultasi.findMany({
      where: {
        jadwal: {
          tanggal: {
            gte: startDate,
            lte: endDate,
          },
        },
        status: {
          in: ['CONFIRMED', 'COMPLETED'],
        },
        NOT: {
          status: 'CANCELLED',
        },
        ...(biroId
          ? {
              OR: [
                { transaksi: { id_biro_tenant: biroId } },
                { client: { id_biro: biroId } },
              ],
            }
          : {}),
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
    yesterdayEnd: Date,
    biroId?: string
  ) {
    // 1. Pendapatan Bulan Ini (Transaksi Berstatus PAID & Memiliki Booking Layanan Riil)
    const validBookingFilter = {
      OR: [
        { booking_konsultasi: { isNot: null } },
        { booking_psikotes: { isNot: null } },
        { booking_event: { isNot: null } },
      ],
    }

    const biroFilter = biroId
      ? {
          OR: [
            { id_biro_tenant: biroId },
            { client: { id_biro: biroId } },
          ],
        }
      : {}

    // 2. Total Klien Aktif
    const activeClientWhere: Prisma.ClientWhereInput = {
      ...(biroId
        ? {
            OR: [
              {
                transaksi: {
                  some: {
                    id_biro_tenant: biroId,
                    status_pembayaran: 'PAID',
                  },
                },
              },
              { id_biro: biroId },
            ],
          }
        : {
            OR: [
              { transaksi: { some: { status_pembayaran: 'PAID' } } },
              { booking_konsultasi: { some: { NOT: { status: 'CANCELLED' } } } },
              { booking_psikotes: { some: {} } },
              { booking_event: { some: { NOT: { status: 'CANCELLED' } } } },
            ],
          }),
    }

    // Jalankan semua query secara paralel untuk menghindari timeout
    const [
      aggThisMonth,
      aggLastMonth,
      totalClients,
      clientsBeforeYesterday,
      completedSessionsThisMonth,
      bookingEventsAgg,
      activeEventsCountRaw,
      pendingPaymentCount,
    ] = await Promise.all([
      // 1a. Pendapatan bulan ini — aggregate sum lebih cepat dari findMany+reduce
      this.prisma.transaksi.aggregate({
        _sum: { total: true },
        where: {
          status_pembayaran: 'PAID',
          ...validBookingFilter,
          ...biroFilter,
          AND: [
            {
              OR: [
                { tanggal_bayar: { gte: monthStart, lte: monthEnd } },
                {
                  tanggal_bayar: null,
                  createdAt: { gte: monthStart, lte: monthEnd },
                },
              ],
            },
          ],
        },
      }),
      // 1b. Pendapatan bulan lalu
      this.prisma.transaksi.aggregate({
        _sum: { total: true },
        where: {
          status_pembayaran: 'PAID',
          ...validBookingFilter,
          ...biroFilter,
          AND: [
            {
              OR: [
                { tanggal_bayar: { gte: lastMonthStart, lte: lastMonthEnd } },
                {
                  tanggal_bayar: null,
                  createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
                },
              ],
            },
          ],
        },
      }),
      // 2a. Total klien aktif
      this.prisma.client.count({ where: activeClientWhere }),
      // 2b. Klien aktif sebelum kemarin (untuk hitung new clients)
      this.prisma.client.count({
        where: { ...activeClientWhere, createdAt: { lte: yesterdayEnd } },
      }),
      // 3. Sesi konseling selesai bulan ini
      this.prisma.bookingKonsultasi.count({
        where: {
          status: 'COMPLETED',
          NOT: { status: 'CANCELLED' },
          ...(biroId
            ? {
                OR: [
                  { transaksi: { id_biro_tenant: biroId } },
                  { client: { id_biro: biroId } },
                ],
              }
            : {}),
          AND: [
            {
              OR: [
                { jadwal: { tanggal: { gte: monthStart, lte: monthEnd } } },
                { updatedAt: { gte: monthStart, lte: monthEnd } },
              ],
            },
          ],
        },
      }),
      // 4a. Peserta event aktif — aggregate sum lebih cepat dari findMany+reduce
      this.prisma.bookingEvent.aggregate({
        _sum: { jumlah_peserta: true },
        where: {
          event: { status: { in: ['UPCOMING', 'ONGOING'] } },
          NOT: { status: 'CANCELLED' },
          ...(biroId
            ? {
                OR: [
                  { transaksi: { id_biro_tenant: biroId } },
                  { client: { id_biro: biroId } },
                ],
              }
            : {}),
        },
      }),
      // 4b. Jumlah event aktif (hanya jika bukan biro-scoped)
      biroId
        ? Promise.resolve(0 as number)
        : this.prisma.event.count({
            where: { status: { in: ['UPCOMING', 'ONGOING'] } },
          }),
      // 5. Transaksi menunggu pembayaran
      this.prisma.transaksi.count({
        where: {
          status_pembayaran: 'PENDING',
          ...(biroId ? { id_biro_tenant: biroId } : {}),
          OR: [
            { booking_konsultasi: { isNot: null } },
            { booking_psikotes: { isNot: null } },
            { booking_event: { isNot: null } },
          ],
        },
      }),
    ])

    const totalIncomeThisMonth = Number(aggThisMonth._sum.total ?? 0)
    const totalIncomeLastMonth = Number(aggLastMonth._sum.total ?? 0)
    const totalEventParticipants = Number(bookingEventsAgg._sum.jumlah_peserta ?? 0)
    const activeEventsCount = biroId
      ? (totalEventParticipants > 0 ? 1 : 0)
      : (activeEventsCountRaw as number)
    const newClientsSinceYesterday = totalClients - clientsBeforeYesterday

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

  /**
   * Mengambil sesi konseling hari ini khusus widget dashboard (dibatasi limit teratas)
   */
  async findDashboardTodaySessions(date: Date, limit: number = 5, biroId?: string) {
    const startOfDay = new Date(date)
    startOfDay.setUTCHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setUTCHours(23, 59, 59, 999)

    const where: Prisma.BookingKonsultasiWhereInput = {
      jadwal: {
        tanggal: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      NOT: {
        status: 'CANCELLED',
      },
      ...(biroId
        ? {
            OR: [
              { transaksi: { id_biro_tenant: biroId } },
              { client: { id_biro: biroId } },
            ],
          }
        : {}),
    }

    const [totalCount, rawSessions] = await Promise.all([
      this.prisma.bookingKonsultasi.count({ where }),
      this.prisma.bookingKonsultasi.findMany({
        where,
        include: {
          client: true,
          layanan: true,
          transaksi: true,
          jadwal: {
            include: {
              psikolog: {
                include: {
                  account: {
                    select: {
                      id: true,
                      nama: true,
                      foto: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          jadwal: {
            jam_mulai: 'asc',
          },
        },
        take: limit,
      }),
    ])

    return { totalCount, rawSessions }
  }

  /**
   * Mengambil transaksi pembayaran terbaru khusus widget ringkasan operasional dashboard
   */
  async findDashboardRecentTransactions(limit: number = 5, biroId?: string) {
    const where: Prisma.TransaksiWhereInput = {
      ...(biroId
        ? {
            AND: [
              {
                OR: [
                  { id_biro_tenant: biroId },
                  { client: { id_biro: biroId } },
                ],
              },
              {
                OR: [
                  { booking_konsultasi: { isNot: null } },
                  { booking_psikotes: { isNot: null } },
                  { booking_event: { isNot: null } },
                ],
              },
            ],
          }
        : {
            OR: [
              { booking_konsultasi: { isNot: null } },
              { booking_psikotes: { isNot: null } },
              { booking_event: { isNot: null } },
            ],
          }),
    }

    const [totalCount, rawTransactions] = await Promise.all([
      this.prisma.transaksi.count({ where }),
      this.prisma.transaksi.findMany({
        where,
        include: {
          client: true,
          booking_konsultasi: {
            include: {
              layanan: true,
            },
          },
          booking_psikotes: {
            include: {
              paket: true,
            },
          },
          booking_event: {
            include: {
              event: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
    ])

    return { totalCount, rawTransactions }
  }

  /**
   * Mengambil agenda dan peringatan operasional mendatang langsung dari Database
   */
  async findDashboardAgenda(_limit: number = 6, biroId?: string) {
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    const [upcomingEvents, upcomingSessions, pendingPayments] = await Promise.all([
      biroId
        ? Promise.resolve([])
        : this.prisma.event.findMany({
            where: {
              status: { in: ['UPCOMING', 'ONGOING'] },
            },
            orderBy: [{ tanggal: 'asc' }, { jam_mulai: 'asc' }],
            take: 3,
          }),
      this.prisma.bookingKonsultasi.findMany({
        where: {
          NOT: { status: 'CANCELLED' },
          jadwal: {
            tanggal: { gte: today },
          },
          ...(biroId
            ? {
                OR: [
                  { transaksi: { id_biro_tenant: biroId } },
                  { client: { id_biro: biroId } },
                ],
              }
            : {}),
        },
        include: {
          client: true,
          layanan: true,
          jadwal: true,
        },
        orderBy: {
          jadwal: {
            tanggal: 'asc',
          },
        },
        take: 3,
      }),
      this.prisma.transaksi.findMany({
        where: {
          status_pembayaran: 'PENDING',
          ...(biroId
            ? {
                OR: [
                  { id_biro_tenant: biroId },
                  { client: { id_biro: biroId } },
                ],
              }
            : {}),
          OR: [
            { booking_konsultasi: { isNot: null } },
            { booking_psikotes: { isNot: null } },
            { booking_event: { isNot: null } },
          ],
        },
        include: {
          client: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 2,
      }),
    ])

    return { upcomingEvents, upcomingSessions, pendingPayments }
  }

  // ── Site Settings (Pengaturan Sistem Dinamis) ────────────────────

  async getSiteSetting(key: string) {
    if ((this.prisma as any).siteSetting) {
      return (this.prisma as any).siteSetting.findUnique({
        where: { key },
      })
    }
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT "id", "key", "value", "createdAt", "updatedAt" FROM "site_settings" WHERE "key" = $1 LIMIT 1`,
      key
    )
    return rows[0] || null
  }

  async upsertSiteSetting(key: string, value: any) {
    if ((this.prisma as any).siteSetting) {
      return (this.prisma as any).siteSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      })
    }
    const jsonStr = typeof value === 'string' ? value : JSON.stringify(value)
    return this.prisma.$executeRawUnsafe(
      `INSERT INTO "site_settings" ("id", "key", "value", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2::jsonb, NOW(), NOW())
       ON CONFLICT ("key") DO UPDATE
       SET "value" = EXCLUDED."value", "updatedAt" = NOW()`,
      key,
      jsonStr
    )
  }
}
