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

  // ── Modul Internship (Program Magang & Karir) Database Queries ──

  async getInternshipPositions(onlyOpen = false) {
    const whereClause = onlyOpen ? 'WHERE "isOpen" = true' : ''
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT "id", "judul", "divisi", "durasi", "lokasi", "workMode", "kompensasi", "deadline", "deskripsi", "responsibilities", "qualifications", "questions", "applyUrl", "isOpen", "createdAt", "updatedAt"
       FROM "internship_positions"
       ${whereClause}
       ORDER BY "createdAt" DESC;`
    )
    return rows.map((r) => ({
      ...r,
      responsibilities: Array.isArray(r.responsibilities)
        ? r.responsibilities
        : typeof r.responsibilities === 'string'
        ? JSON.parse(r.responsibilities)
        : [],
      qualifications: Array.isArray(r.qualifications)
        ? r.qualifications
        : typeof r.qualifications === 'string'
        ? JSON.parse(r.qualifications)
        : [],
      questions: Array.isArray(r.questions)
        ? r.questions
        : typeof r.questions === 'string'
        ? JSON.parse(r.questions)
        : [],
    }))
  }

  async getInternshipPositionById(id: string) {
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT "id", "judul", "divisi", "durasi", "lokasi", "workMode", "kompensasi", "deadline", "deskripsi", "responsibilities", "qualifications", "questions", "applyUrl", "isOpen", "createdAt", "updatedAt"
       FROM "internship_positions"
       WHERE "id" = $1
       LIMIT 1;`,
      id
    )
    if (!rows[0]) return null
    const r = rows[0]
    return {
      ...r,
      responsibilities: Array.isArray(r.responsibilities)
        ? r.responsibilities
        : typeof r.responsibilities === 'string'
        ? JSON.parse(r.responsibilities)
        : [],
      qualifications: Array.isArray(r.qualifications)
        ? r.qualifications
        : typeof r.qualifications === 'string'
        ? JSON.parse(r.qualifications)
        : [],
      questions: Array.isArray(r.questions)
        ? r.questions
        : typeof r.questions === 'string'
        ? JSON.parse(r.questions)
        : [],
    }
  }

  async createInternshipPosition(data: {
    id?: string
    judul: string
    divisi?: string | null
    durasi: string
    lokasi: string
    workMode: string
    kompensasi: string
    deadline: string
    deskripsi?: string | null
    responsibilities: string[]
    qualifications: string[]
    questions?: any[]
    applyUrl: string
    isOpen?: boolean
  }) {
    const id = data.id || `intern-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const respJson = JSON.stringify(data.responsibilities || [])
    const qualJson = JSON.stringify(data.qualifications || [])
    const questionsJson = JSON.stringify(data.questions || [])
    const isOpen = data.isOpen !== undefined ? Boolean(data.isOpen) : true

    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `INSERT INTO "internship_positions" (
        "id", "judul", "divisi", "durasi", "lokasi", "workMode", "kompensasi", "deadline", "deskripsi", "responsibilities", "qualifications", "questions", "applyUrl", "isOpen", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb, $12::jsonb, $13, $14, NOW(), NOW()
      )
      RETURNING *;`,
      id,
      data.judul,
      data.divisi || null,
      data.durasi,
      data.lokasi,
      data.workMode,
      data.kompensasi,
      data.deadline,
      data.deskripsi || null,
      respJson,
      qualJson,
      questionsJson,
      data.applyUrl,
      isOpen
    )
    const r = rows[0]
    return {
      ...r,
      responsibilities: Array.isArray(r?.responsibilities)
        ? r.responsibilities
        : typeof r?.responsibilities === 'string'
        ? JSON.parse(r.responsibilities)
        : [],
      qualifications: Array.isArray(r?.qualifications)
        ? r.qualifications
        : typeof r?.qualifications === 'string'
        ? JSON.parse(r.qualifications)
        : [],
      questions: Array.isArray(r?.questions)
        ? r.questions
        : typeof r?.questions === 'string'
        ? JSON.parse(r.questions)
        : [],
    }
  }

  async updateInternshipPosition(id: string, data: {
    judul?: string
    divisi?: string | null
    durasi?: string
    lokasi?: string
    workMode?: string
    kompensasi?: string
    deadline?: string
    deskripsi?: string | null
    responsibilities?: string[]
    qualifications?: string[]
    questions?: any[]
    applyUrl?: string
    isOpen?: boolean
  }) {
    const current = await this.getInternshipPositionById(id)
    if (!current) throw new Error("Posisi internship tidak ditemukan")

    const judul = data.judul !== undefined ? data.judul : current.judul
    const divisi = data.divisi !== undefined ? data.divisi : current.divisi
    const durasi = data.durasi !== undefined ? data.durasi : current.durasi
    const lokasi = data.lokasi !== undefined ? data.lokasi : current.lokasi
    const workMode = data.workMode !== undefined ? data.workMode : current.workMode
    const kompensasi = data.kompensasi !== undefined ? data.kompensasi : current.kompensasi
    const deadline = data.deadline !== undefined ? data.deadline : current.deadline
    const deskripsi = data.deskripsi !== undefined ? data.deskripsi : current.deskripsi
    const respJson = JSON.stringify(data.responsibilities !== undefined ? data.responsibilities : current.responsibilities)
    const qualJson = JSON.stringify(data.qualifications !== undefined ? data.qualifications : current.qualifications)
    const questionsJson = JSON.stringify(data.questions !== undefined ? data.questions : current.questions)
    const applyUrl = data.applyUrl !== undefined ? data.applyUrl : current.applyUrl
    const isOpen = data.isOpen !== undefined ? Boolean(data.isOpen) : current.isOpen

    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `UPDATE "internship_positions"
       SET "judul" = $2,
           "divisi" = $3,
           "durasi" = $4,
           "lokasi" = $5,
           "workMode" = $6,
           "kompensasi" = $7,
           "deadline" = $8,
           "deskripsi" = $9,
           "responsibilities" = $10::jsonb,
           "qualifications" = $11::jsonb,
           "questions" = $12::jsonb,
           "applyUrl" = $13,
           "isOpen" = $14,
           "updatedAt" = NOW()
       WHERE "id" = $1
       RETURNING *;`,
      id,
      judul,
      divisi,
      durasi,
      lokasi,
      workMode,
      kompensasi,
      deadline,
      deskripsi,
      respJson,
      qualJson,
      questionsJson,
      applyUrl,
      isOpen
    )
    const r = rows[0]
    return {
      ...r,
      responsibilities: Array.isArray(r?.responsibilities)
        ? r.responsibilities
        : typeof r?.responsibilities === 'string'
        ? JSON.parse(r.responsibilities)
        : [],
      qualifications: Array.isArray(r?.qualifications)
        ? r.qualifications
        : typeof r?.qualifications === 'string'
        ? JSON.parse(r.qualifications)
        : [],
      questions: Array.isArray(r?.questions)
        ? r.questions
        : typeof r?.questions === 'string'
        ? JSON.parse(r.questions)
        : [],
    }
  }

  async toggleInternshipPosition(id: string) {
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `UPDATE "internship_positions"
       SET "isOpen" = NOT "isOpen",
           "updatedAt" = NOW()
       WHERE "id" = $1
       RETURNING *;`,
      id
    )
    if (!rows[0]) throw new Error("Posisi internship tidak ditemukan")
    const r = rows[0]
    return {
      ...r,
      responsibilities: Array.isArray(r?.responsibilities)
        ? r.responsibilities
        : typeof r?.responsibilities === 'string'
        ? JSON.parse(r.responsibilities)
        : [],
      qualifications: Array.isArray(r?.qualifications)
        ? r.qualifications
        : typeof r?.qualifications === 'string'
        ? JSON.parse(r.qualifications)
        : [],
      questions: Array.isArray(r?.questions)
        ? r.questions
        : typeof r?.questions === 'string'
        ? JSON.parse(r.questions)
        : [],
    }
  }

  async deleteInternshipPosition(id: string) {
    return this.prisma.$executeRawUnsafe(
      `DELETE FROM "internship_positions" WHERE "id" = $1;`,
      id
    )
  }

  async syncAllInternshipPositions(positions: any[]) {
    await this.prisma.$executeRawUnsafe(`DELETE FROM "internship_positions";`)
    for (const pos of positions) {
      await this.createInternshipPosition(pos)
    }
    return this.getInternshipPositions(false)
  }

  // ── Modul Pengajuan Pelamar Magang (Internship Applications) ──

  async getInternshipApplications() {
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT "id", "positionId", "positionTitle", "nama", "email", "telepon", "universitas", "jurusan", "semester", "cvUrl", "portfolioUrl", "jawaban", "status", "catatanAdmin", "createdAt", "updatedAt"
       FROM "internship_applications"
       ORDER BY "createdAt" DESC;`
    )
    return rows.map((r) => ({
      ...r,
      jawaban: Array.isArray(r.jawaban)
        ? r.jawaban
        : typeof r.jawaban === 'string'
        ? JSON.parse(r.jawaban)
        : [],
    }))
  }

  async getInternshipApplicationById(id: string) {
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT "id", "positionId", "positionTitle", "nama", "email", "telepon", "universitas", "jurusan", "semester", "cvUrl", "portfolioUrl", "jawaban", "status", "catatanAdmin", "createdAt", "updatedAt"
       FROM "internship_applications"
       WHERE "id" = $1
       LIMIT 1;`,
      id
    )
    if (!rows[0]) return null
    const r = rows[0]
    return {
      ...r,
      jawaban: Array.isArray(r.jawaban)
        ? r.jawaban
        : typeof r.jawaban === 'string'
        ? JSON.parse(r.jawaban)
        : [],
    }
  }

  async createInternshipApplication(data: {
    id?: string
    positionId: string
    positionTitle: string
    nama: string
    email: string
    telepon: string
    universitas: string
    jurusan?: string | null
    semester?: string | null
    cvUrl: string
    portfolioUrl?: string | null
    jawaban?: any[]
    status?: string
    catatanAdmin?: string | null
  }) {
    const id = data.id || `app-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const jawabanJson = JSON.stringify(data.jawaban || [])
    const status = data.status || 'MENUNGGU'

    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `INSERT INTO "internship_applications" (
        "id", "positionId", "positionTitle", "nama", "email", "telepon", "universitas", "jurusan", "semester", "cvUrl", "portfolioUrl", "jawaban", "status", "catatanAdmin", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13, $14, NOW(), NOW()
      )
      RETURNING *;`,
      id,
      data.positionId,
      data.positionTitle,
      data.nama,
      data.email,
      data.telepon,
      data.universitas,
      data.jurusan || null,
      data.semester || null,
      data.cvUrl,
      data.portfolioUrl || null,
      jawabanJson,
      status,
      data.catatanAdmin || null
    )
    const r = rows[0]
    return {
      ...r,
      jawaban: Array.isArray(r?.jawaban)
        ? r.jawaban
        : typeof r?.jawaban === 'string'
        ? JSON.parse(r.jawaban)
        : [],
    }
  }

  async updateInternshipApplicationStatus(id: string, status: string, catatanAdmin?: string | null) {
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `UPDATE "internship_applications"
       SET "status" = $2,
           "catatanAdmin" = COALESCE($3, "catatanAdmin"),
           "updatedAt" = NOW()
       WHERE "id" = $1
       RETURNING *;`,
      id,
      status,
      catatanAdmin || null
    )
    if (!rows[0]) throw new Error("Lamaran internship tidak ditemukan")
    const r = rows[0]
    return {
      ...r,
      jawaban: Array.isArray(r?.jawaban)
        ? r.jawaban
        : typeof r?.jawaban === 'string'
        ? JSON.parse(r.jawaban)
        : [],
    }
  }

  async deleteInternshipApplication(id: string) {
    return this.prisma.$executeRawUnsafe(
      `DELETE FROM "internship_applications" WHERE "id" = $1;`,
      id
    )
  }
}
