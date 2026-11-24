import type { PrismaClient, Prisma, StatusBooking, StatusSlot, StatusPembayaran } from '@prisma/client'
import { parseDateString, timeStringToDate, formatDateToString, formatTimeToString, calculateRefundDeadline } from '../../utils/date-time'
import { generateOrderId, generateTrxId, normalizePhoneNumber } from '../../utils'
import { hitungTransaksi } from '../transaksi/transaksi.calc'

export class BookingRepository {
  constructor(private prisma: PrismaClient) { }

  // ── 1. Slot Ketersediaan & Kalender ──────────────────────────────────────────

  async findJadwalSlots(params?: { date?: string; start_date?: string; end_date?: string; layanan?: string; status?: string; id_biro?: string; biroId?: string }) {
    const where: Prisma.JadwalSlotWhereInput = {}

    const biroId = params?.id_biro || params?.biroId
    if (biroId) {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
        {
          OR: [
            // 1. Slot yang dibooking oleh klien biro ini (transaksi atau klien terdaftar di biro ini)
            {
              booking_konsultasi: {
                status: { not: 'CANCELLED' },
                OR: [
                  { transaksi: { id_biro_tenant: biroId } },
                  {
                    AND: [
                      { client: { id_biro: biroId } },
                      {
                        OR: [
                          { id_transaksi: null },
                          { transaksi: { id_biro_tenant: biroId } },
                        ],
                      },
                    ],
                  },
                ],
              },
            },
            // 2. Slot ketersediaan milik tenaga ahli/psikolog biro ini (yang belum dibooking atau booking dibatalkan)
            {
              psikolog: {
                account: {
                  OR: [
                    { id_biro: biroId },
                    { owned_biro: { some: { id: biroId } } },
                  ],
                },
              },
              OR: [
                { booking_konsultasi: null },
                { booking_konsultasi: { status: 'CANCELLED' } },
              ],
            },
          ],
        },
      ]
    }

    if (params?.start_date && params?.end_date) {
      where.tanggal = {
        gte: parseDateString(params.start_date),
        lte: parseDateString(params.end_date),
      }
    } else if (params?.start_date) {
      where.tanggal = {
        gte: parseDateString(params.start_date),
      }
    }

    if (params?.status && params.status !== 'semua') {
      if (params.status === 'TERSEDIA' || params.status === 'SUDAH_DIBOOKING' || params.status === 'TIDAK_TERSEDIA') {
        where.status = params.status as any
      }
    }

    if (params?.layanan && params.layanan !== 'Semua Layanan' && params.layanan !== 'semua') {
      const layLower = params.layanan.toLowerCase().trim()
      if (layLower === 'asesmen' || layLower.includes('asesmen')) {
        where.OR = [
          { tipe_jadwal: 'ASESMEN' },
          { booking_konsultasi: { layanan: { kategori: 'ASESMEN' } } },
          { booking_konsultasi: { layanan: { nama: { contains: params.layanan, mode: 'insensitive' } } } },
        ]
      } else if (layLower === 'konseling' || layLower === 'konsultasi') {
        where.OR = [
          { tipe_jadwal: 'KONSULTASI' },
          { booking_konsultasi: { layanan: { kategori: 'KONSULTASI' } } },
          { booking_konsultasi: { layanan: { nama: { contains: params.layanan, mode: 'insensitive' } } } },
        ]
      } else {
        where.booking_konsultasi = {
          layanan: { nama: { contains: params.layanan, mode: 'insensitive' } },
        }
      }
    }

    return this.prisma.jadwalSlot.findMany({
      where,
      include: {
        psikolog: {
          select: {
            id: true,
            nama_gelar: true,
            kategori: true,
            foto: true,
            spesialisasi: {
              select: { nama: true },
            },
            account: {
              select: {
                id: true,
                nama: true,
                email: true,
                no_telepon: true,
              },
            },
          },
        },
        booking_konsultasi: {
          include: {
            client: true,
            layanan: true,
            transaksi: true,
          },
        },
      },
      orderBy: [
        { tanggal: 'asc' },
        { jam_mulai: 'asc' },
      ],
    })
  }

  async findTodaySessions(date: Date, biroId?: string) {
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
      ...(biroId
        ? {
            OR: [
              { transaksi: { id_biro_tenant: biroId } },
              {
                AND: [
                  { client: { id_biro: biroId } },
                  {
                    OR: [
                      { id_transaksi: null },
                      { transaksi: { id_biro_tenant: biroId } },
                    ],
                  },
                ],
              },
            ],
          }
        : {}),
    }

    return this.prisma.bookingKonsultasi.findMany({
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
      orderBy: {
        jadwal: {
          jam_mulai: 'asc',
        },
      },
    })
  }

  async findOverlappingSlot(id_psikolog: string, tanggal: Date, jam_mulai: Date, jam_selesai: Date) {
    return this.prisma.jadwalSlot.findFirst({
      where: {
        id_psikolog,
        tanggal,
        jam_mulai: { lt: jam_selesai },
        jam_selesai: { gt: jam_mulai },
      },
      include: {
        booking_konsultasi: {
          include: {
            transaksi: true,
          },
        },
      },
      orderBy: [
        { status: 'desc' }, // 'SUDAH_DIBOOKING' prioritized so active bookings are checked first
        { createdAt: 'desc' },
      ],
    })
  }

  async cancelExpiredPendingBookings(maxAgeMinutes: number = 30) {
    const cutoffDate = new Date(Date.now() - maxAgeMinutes * 60 * 1000)

    // Cari seluruh booking konsultasi berstatus PENDING yang sudah melewati batas waktu
    const expiredBookings = await this.prisma.bookingKonsultasi.findMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: cutoffDate },
      },
      include: {
        jadwal: true,
        transaksi: true,
      },
    })

    if (expiredBookings.length === 0) {
      return { count: 0, expiredIds: [] }
    }

    const expiredIds: string[] = []

    for (const booking of expiredBookings) {
      await this.prisma.$transaction(async (tx) => {
        // 1. Batalkan booking
        await tx.bookingKonsultasi.update({
          where: { id: booking.id },
          data: { status: 'CANCELLED' } as any,
        })

        // 2. Kembalikan slot jam ke TERSEDIA
        if (booking.id_jadwal) {
          await tx.jadwalSlot.update({
            where: { id: booking.id_jadwal },
            data: { status: 'TERSEDIA' } as any,
          }).catch(() => { })
        }

        // 3. Update transaksi menjadi FAILED jika masih PENDING
        if (booking.id_transaksi) {
          await tx.transaksi.update({
            where: { id: booking.id_transaksi },
            data: { status_pembayaran: 'FAILED' } as any,
          }).catch(() => { })
        }

        // 4. Kurangi jumlah sesi psikolog (hanya jika sebelumnya sudah CONFIRMED)
        if (booking.status === 'CONFIRMED' && booking.jadwal?.id_psikolog) {
          await tx.psikolog.update({
            where: { id: booking.jadwal.id_psikolog },
            data: { jumlah_sesi: { decrement: 1 } },
          }).catch(() => { })
        }
      }, { timeout: 30000, maxWait: 10000 }).catch(() => { })
      expiredIds.push(booking.id)
    }

    return { count: expiredIds.length, expiredIds }
  }

  /**
   * Menandai transaksi konsultasi yang jadwal sesinya sudah terlewat tanpa kehadiran/refund/reschedule
   * menjadi transaksi HANGUS secara otomatis.
   */
  async processHangusBookings() {
    const { getSessionDateTime } = await import('../../utils/date-time.js')
    const now = Date.now()

    // Cari booking konsultasi yang sudah PAID/CONFIRMED dan belum COMPLETED / CANCELLED / REFUNDED / HANGUS
    const pastBookings = await this.prisma.bookingKonsultasi.findMany({
      where: {
        status: 'CONFIRMED',
        transaksi: {
          status_pembayaran: 'PAID',
        },
      },
      include: {
        jadwal: true,
        transaksi: true,
      },
    })

    const hangusIds: string[] = []

    for (const b of pastBookings) {
      if (!b.jadwal || !b.transaksi) continue
      // Waktu sesi selesai (asumsi durasi sesi ~60-90 menit, kita beri toleransi lewat jam mulai sesi)
      const sessionDateTime = getSessionDateTime(b.jadwal.tanggal, b.jadwal.jam_mulai)
      // Jika waktu sekarang sudah melewati jam selesai / jam mulai sesi (+ 2 jam toleransi)
      if (now > sessionDateTime.getTime() + 2 * 60 * 60 * 1000) {
        await this.prisma.$transaction(async (tx) => {
          // Update status transaksi menjadi HANGUS
          await tx.transaksi.update({
            where: { id: b.transaksi!.id },
            data: {
              status_pembayaran: 'HANGUS',
              alasan_penahanan: 'Klien tidak hadir tanpa pemberitahuan (Sesi Hangus)',
              nominal_ditahan: b.transaksi!.total,
              nominal_dikembalikan: 0,
            },
          })

          // Update status booking menjadi COMPLETED / CANCELLED dengan catatan
          await tx.bookingKonsultasi.update({
            where: { id: b.id },
            data: {
              status: 'COMPLETED', // sesi dianggap terlewat
            },
          })

          // Update ledger pembagian: psikolog tetap menerima hak sesi normal (alasan: SESI_HANGUS)
          await tx.pembagianTransaksi.updateMany({
            where: { id_transaksi: b.transaksi!.id, penerima_tipe: 'PSIKOLOG' },
            data: {
              alasan: 'SESI_HANGUS',
              catatan_pembayaran: 'Sesi hangus (klien tidak hadir tanpa kabar, honor psikolog tetap diberikan penuh)',
            },
          })
        }).catch(() => {})

        hangusIds.push(b.id)
      }
    }

    return { count: hangusIds.length, hangusIds }
  }

  async findJadwalTersedia(params: {
    tanggal?: string
    id_psikolog?: string
    tipe_jadwal?: string
    metode?: string
    layanan?: string
  }) {
    // Otomatis lepas slot yang ditinggalkan (pending > 30 menit) agar langsung muncul lagi di kalender
    await this.cancelExpiredPendingBookings(30).catch(() => { })

    // Resolusi ID psikolog jika diteruskan sebagai nama/email/slug
    let resolvedPsikologId = params.id_psikolog
    if (resolvedPsikologId) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(resolvedPsikologId)
      if (!isUuid) {
        const psi = await this.prisma.psikolog.findFirst({
          where: {
            OR: [
              { nama_gelar: { contains: resolvedPsikologId, mode: 'insensitive' } },
              { account: { nama: { contains: resolvedPsikologId, mode: 'insensitive' } } },
              { account: { email: { contains: resolvedPsikologId, mode: 'insensitive' } } },
            ],
          },
        })
        if (psi) resolvedPsikologId = psi.id
      }
    }

    const parsedTanggal = params.tanggal ? parseDateString(params.tanggal) : undefined

    let requestedService: any = null
    if (
      params.layanan &&
      params.layanan.trim() &&
      params.layanan !== 'Semua Layanan Konsultasi' &&
      params.layanan !== 'Semua Layanan Asesmen' &&
      params.layanan !== 'Semua Layanan'
    ) {
      try {
        requestedService = await this.prisma.layanan.findFirst({
          where: {
            OR: [
              { nama: { equals: params.layanan.trim(), mode: 'insensitive' } },
              { nama: { contains: params.layanan.trim(), mode: 'insensitive' } },
            ],
          },
        })
      } catch {}
    }

    // 1. Kumpulkan seluruh slot yang SUDAH ADA booking aktifnya (bukan CANCELLED)
    const activeBookings = await this.prisma.bookingKonsultasi.findMany({
      where: {
        status: { in: ['PENDING', 'CONFIRMED'] },
        ...(parsedTanggal ? { jadwal: { tanggal: parsedTanggal } } : {}),
        ...(resolvedPsikologId ? { jadwal: { id_psikolog: resolvedPsikologId } } : {}),
      },
      select: {
        id_jadwal: true,
        jadwal: {
          select: {
            id_psikolog: true,
            tanggal: true,
            jam_mulai: true,
          },
        },
      },
    })

    const occupiedSlotIds = new Set<string>()
    const occupiedTimeKeys = new Set<string>()

    activeBookings.forEach((b) => {
      if (b.id_jadwal) occupiedSlotIds.add(b.id_jadwal)
      if (b.jadwal) {
        const dStr = formatDateToString(b.jadwal.tanggal)
        const jStr = formatTimeToString(b.jadwal.jam_mulai)
        occupiedTimeKeys.add(`${b.jadwal.id_psikolog}_${dStr}_${jStr}`)
      }
    })

    // 2. Kumpulkan slot yang statusnya SUDAH_DIBOOKING atau TIDAK_TERSEDIA
    const bookedSlots = await this.prisma.jadwalSlot.findMany({
      where: {
        status: { in: ['SUDAH_DIBOOKING', 'TIDAK_TERSEDIA'] as any },
        ...(parsedTanggal ? { tanggal: parsedTanggal } : {}),
        ...(resolvedPsikologId ? { id_psikolog: resolvedPsikologId } : {}),
      },
      select: {
        id: true,
        id_psikolog: true,
        tanggal: true,
        jam_mulai: true,
      },
    })

    bookedSlots.forEach((s) => {
      occupiedSlotIds.add(s.id)
      const dStr = formatDateToString(s.tanggal)
      const jStr = formatTimeToString(s.jam_mulai)
      occupiedTimeKeys.add(`${s.id_psikolog}_${dStr}_${jStr}`)
    })

    // 3. Query slot yang berstatus TERSEDIA
    const where: Prisma.JadwalSlotWhereInput = {
      status: 'TERSEDIA',
      OR: [
        { booking_konsultasi: null },
        { booking_konsultasi: { status: 'CANCELLED' } },
      ],
    }

    if (params.tipe_jadwal) {
      const tj = params.tipe_jadwal.toUpperCase()
      if (tj === 'KONSULTASI') {
        where.tipe_jadwal = 'KONSULTASI'
      } else if (tj === 'ASESMEN') {
        where.tipe_jadwal = 'ASESMEN'
      } else {
        where.tipe_jadwal = params.tipe_jadwal
      }
    } else if (resolvedPsikologId) {
      where.tipe_jadwal = 'KONSULTASI'
    }

    if (parsedTanggal) {
      where.tanggal = parsedTanggal
    }

    if (resolvedPsikologId) {
      where.id_psikolog = resolvedPsikologId
    }

    if (params.metode) {
      const mUpper = params.metode.toUpperCase()
      if (mUpper === 'OFFLINE') {
        where.metode = { in: ['OFFLINE', 'KEDUANYA'] }
      } else if (mUpper === 'ONLINE') {
        where.metode = { in: ['ONLINE', 'KEDUANYA'] }
      }
    }

    const availableCandidates = await this.prisma.jadwalSlot.findMany({
      where,
      include: {
        psikolog: {
          select: {
            id: true,
            nama_gelar: true,
            foto: true,
            kategori: true,
            tarif_per_jam: true,
            spesialisasi: {
              select: {
                nama: true,
              },
            },
          },
        },
      },
      orderBy: [
        { tanggal: 'asc' },
        { jam_mulai: 'asc' },
      ],
    })

    // 4. FILTER MUTLAK: Buang slot apa pun yang sudah dibooking, berbentrok waktu, atau metodenya tidak didukung layanan!
    return availableCandidates.filter((slot) => {
      if (occupiedSlotIds.has(slot.id)) return false
      const dStr = formatDateToString(slot.tanggal)
      const jStr = formatTimeToString(slot.jam_mulai)
      if (occupiedTimeKeys.has(`${slot.id_psikolog}_${dStr}_${jStr}`)) return false

      if (requestedService && requestedService.metode) {
        const sMetode = requestedService.metode.toUpperCase()
        const slotMetode = (slot.metode || 'KEDUANYA').toUpperCase()
        if (slotMetode === 'OFFLINE' && !sMetode.includes('OFFLINE') && !sMetode.includes('KEDUANYA')) {
          return false
        }
        if (slotMetode === 'ONLINE' && !sMetode.includes('ONLINE') && !sMetode.includes('KEDUANYA')) {
          return false
        }
      }

      return true
    })
  }

  async findJadwalByPsikologId(
    id_psikolog: string,
    params?: { start_date?: string; end_date?: string }
  ) {
    const where: Prisma.JadwalSlotWhereInput = {
      id_psikolog,
      tipe_jadwal: 'KONSULTASI',
    }

    if (params?.start_date && params?.end_date) {
      where.tanggal = {
        gte: parseDateString(params.start_date),
        lte: parseDateString(params.end_date),
      }
    } else if (params?.start_date) {
      where.tanggal = {
        gte: parseDateString(params.start_date),
      }
    }

    return this.prisma.jadwalSlot.findMany({
      where,
      include: {
        psikolog: true,
        booking_konsultasi: {
          include: {
            client: {
              select: {
                id: true,
                nama: true,
                no_telepon: true,
                jenis_kelamin: true,
                usia: true,
              },
            },
            layanan: {
              select: {
                id: true,
                nama: true,
                metode: true,
                harga_weekday: true,
                harga_weekend: true,
              },
            },
            transaksi: true,
          },
        },
      },
      orderBy: [
        { tanggal: 'asc' },
        { jam_mulai: 'asc' },
      ],
    })
  }

  async findJadwalSlotById(id: string) {
    return this.prisma.jadwalSlot.findUnique({
      where: { id },
      include: {
        booking_konsultasi: true,
      },
    })
  }

  async createJadwalSlot(data: {
    id_psikolog: string
    tanggal: Date
    jam_mulai: Date
    jam_selesai: Date
    tipe_jadwal?: string
    metode?: string
    status?: StatusSlot | string
  }): Promise<any> {
    return this.prisma.jadwalSlot.create({
      data: {
        id_psikolog: data.id_psikolog,
        tanggal: data.tanggal,
        jam_mulai: data.jam_mulai,
        jam_selesai: data.jam_selesai,
        tipe_jadwal: data.tipe_jadwal || 'KONSULTASI',
        metode: data.metode || 'ONLINE',
        status: (data.status as any) || 'TERSEDIA',
      } as any,
    })
  }

  async deleteJadwalSlot(id: string) {
    const slot = await this.prisma.jadwalSlot.findUnique({
      where: { id },
      include: { booking_konsultasi: true },
    })

    if (slot?.booking_konsultasi) {
      return this.prisma.jadwalSlot.update({
        where: { id },
        data: { status: 'TERSEDIA' },
      })
    }

    return this.prisma.jadwalSlot.delete({
      where: { id },
    })
  }

  // ── 2. Pembuatan & Pengelolaan Sesi Booking ──────────────────────────────────

  async createAdminSesi(data: {
    id_psikolog?: string
    id_layanan: string
    tanggal: Date
    jam_mulai: Date
    jam_selesai: Date
    metode: string
    tipe_jadwal?: string
    deskripsi_trauma?: string
    id_biro?: string
    klien: {
      nama: string
      no_telepon: string
      usia?: number
      jenis_kelamin?: string
    }
  }) {
    return this.prisma.$transaction(async (tx) => {
      const resolvedBiroId: string | null = data.id_biro || null
      // 1. Buat atau cari Klien berdasarkan kombinasi nomor telepon DAN nama (case-insensitive)
      // Satu nomor bisa dipakai beberapa klien berbeda (misal keluarga/anak), sehingga profil dicocokkan berdasarkan kombinasi nomor + nama.
      const inputName = (data.klien.nama || '').trim()
      const rawPhone = (data.klien.no_telepon || '').trim()
      const standardizedPhone = normalizePhoneNumber(rawPhone) || rawPhone
      const digitsOnly = rawPhone.replace(/\D/g, '')

      const phoneConditions: Prisma.ClientWhereInput[] = rawPhone ? [
        { no_telepon: standardizedPhone },
        { no_telepon: rawPhone },
        ...(digitsOnly.length >= 8 ? [
          { no_telepon: digitsOnly },
          { no_telepon: '0' + (standardizedPhone.startsWith('62') ? standardizedPhone.slice(2) : digitsOnly) },
        ] : []),
      ] : []

      let client: any = null

      if (inputName && phoneConditions.length > 0) {
        client = await tx.client.findFirst({
          where: {
            AND: [
              { OR: phoneConditions },
              { nama: { equals: inputName, mode: 'insensitive' } },
            ],
          },
        })
      } else if (phoneConditions.length > 0) {
        client = await tx.client.findFirst({
          where: { OR: phoneConditions },
        })
      } else if (inputName) {
        client = await tx.client.findFirst({
          where: { nama: { equals: inputName, mode: 'insensitive' } },
        })
      }

      if (!client) {
        client = await tx.client.create({
          data: {
            nama: inputName || 'Klien',
            no_telepon: standardizedPhone || null,
            usia: data.klien.usia,
            jenis_kelamin: data.klien.jenis_kelamin,
            id_biro: resolvedBiroId || null,
          },
        })
      } else {
        const updateData: Prisma.ClientUpdateInput = {}
        if (resolvedBiroId && !client.id_biro) {
          updateData.biro = { connect: { id: resolvedBiroId } }
        }
        if (standardizedPhone && client.no_telepon !== standardizedPhone) {
          updateData.no_telepon = standardizedPhone
        }
        if (data.klien.usia !== undefined && data.klien.usia !== null && data.klien.usia !== client.usia) {
          updateData.usia = data.klien.usia
        }
        if (data.klien.jenis_kelamin && data.klien.jenis_kelamin !== client.jenis_kelamin) {
          updateData.jenis_kelamin = data.klien.jenis_kelamin
        }
        // Jangan timpa nama klien yang sudah ada
        if (Object.keys(updateData).length > 0) {
          client = await tx.client.update({
            where: { id: client.id },
            data: updateData,
          }).catch(() => client)
        }
      }

      if (!client) {
        throw Object.assign(new Error('Gagal memproses data klien'), { statusCode: 400 })
      }

      let targetPsiId = data.id_psikolog
      if (!targetPsiId) {
        const firstPsi = await tx.psikolog.findFirst()
        if (!firstPsi) {
          throw Object.assign(new Error('Tidak ditemukan data psikolog/asesor untuk dialokasikan pada sesi ini'), { statusCode: 400 })
        }
        targetPsiId = firstPsi.id
      }

      let resolvedLayananId = data.id_layanan
      let layanan: any = null
      const isUuidLay = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.id_layanan)
      if (isUuidLay) {
        layanan = await tx.layanan.findUnique({
          where: { id: data.id_layanan },
        })
      } else if (data.id_layanan) {
        layanan = await tx.layanan.findFirst({
          where: { nama: { contains: data.id_layanan, mode: 'insensitive' } },
        })
      }
      if (!layanan) {
        layanan = await tx.layanan.findFirst({ where: { aktif: true } }) || await tx.layanan.findFirst()
      }
      if (layanan) {
        resolvedLayananId = layanan.id
      }

      const isAsesmen =
        data.tipe_jadwal === 'ASESMEN' ||
        layanan?.kategori === 'ASESMEN' ||
        (layanan?.nama || '').toLowerCase().includes('asesmen')

      // 2. Hubungkan ke JadwalSlot yang sudah dibuka psikolog, atau buat baru jika belum ada
      let slot = await tx.jadwalSlot.findFirst({
        where: {
          id_psikolog: targetPsiId,
          tanggal: data.tanggal,
          jam_mulai: data.jam_mulai,
        },
      })

      if (slot) {
        slot = await tx.jadwalSlot.update({
          where: { id: slot.id },
          data: {
            status: 'SUDAH_DIBOOKING',
            metode: data.metode || slot.metode,
          } as any,
        })
      } else {
        slot = await tx.jadwalSlot.create({
          data: {
            id_psikolog: targetPsiId,
            tanggal: data.tanggal,
            jam_mulai: data.jam_mulai,
            jam_selesai: data.jam_selesai,
            tipe_jadwal: isAsesmen ? 'ASESMEN' : 'KONSULTASI',
            metode: data.metode || (isAsesmen ? 'OFFLINE' : 'ONLINE'),
            status: 'SUDAH_DIBOOKING',
          } as any,
        })
      }

      // 3. Buat BookingKonsultasi langsung CONFIRMED (admin direct)
      const kode_pesanan = generateOrderId('ADM')
      const booking = await tx.bookingKonsultasi.create({
        data: {
          kode_pesanan,
          id_client: client.id,
          id_layanan: resolvedLayananId,
          id_jadwal: slot.id,
          metode: data.metode,
          deskripsi_trauma: data.deskripsi_trauma,
          status: 'CONFIRMED',
        } as any,
        include: {
          client: true,
          layanan: true,
          jadwal: {
            include: {
              psikolog: true,
            },
          },
        },
      })

      // 4. Update jumlah_sesi psikolog
      await tx.psikolog.update({
        where: { id: data.id_psikolog },
        data: { jumlah_sesi: { increment: 1 } },
      }).catch(() => { })

      return booking
    }, { timeout: 30000, maxWait: 10000 })
  }

  async createClientBooking(data: {
    id_jadwal?: string
    id_layanan?: string
    layanan?: string
    nama_layanan?: string
    tipe_jadwal?: string
    id_psikolog?: string
    tanggal?: string
    jam_mulai?: string
    metode?: string
    deskripsi_trauma?: string
    metode_pembayaran?: string
    channel_pembayaran?: string
    id_biro?: string
    biro_slug?: string
    klien: {
      nama: string
      no_telepon: string
      email?: string
      usia?: number
      jenis_kelamin?: string
    }
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 0. Resolusi Biro Tenant jika booking berasal dari link website biro
      let resolvedBiroId: string | null = null
      if (data.id_biro && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.id_biro)) {
        const biroFound = await tx.biro.findUnique({
          where: { id: data.id_biro },
          select: { id: true },
        })
        if (biroFound) resolvedBiroId = biroFound.id
      }
      if (!resolvedBiroId && (data.biro_slug || data.id_biro)) {
        const candidateSlug = (data.biro_slug || data.id_biro || '').trim().toLowerCase()
        const alternateSlug = candidateSlug.startsWith('biro-')
          ? candidateSlug.replace(/^biro-/, '')
          : `biro-${candidateSlug}`

        const biroFound = await tx.biro.findFirst({
          where: {
            OR: [
              { slug: { equals: candidateSlug, mode: 'insensitive' } },
              { slug: { equals: alternateSlug, mode: 'insensitive' } },
              { nama_biro: { contains: candidateSlug.replace(/[-_]/g, ' '), mode: 'insensitive' } },
            ],
          },
          select: { id: true },
        })
        if (biroFound) resolvedBiroId = biroFound.id
      }

      // 1. Verifikasi atau cari slot ketersediaan
      let slot: any = null
      const isUuid = data.id_jadwal && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.id_jadwal)
      if (isUuid) {
        slot = await tx.jadwalSlot.findUnique({
          where: { id: data.id_jadwal },
          include: { psikolog: true, booking_konsultasi: true },
        })
      }

      if (slot && (slot.status === 'TIDAK_TERSEDIA' || slot.status === 'CANCELLED')) {
        throw Object.assign(
          new Error('Slot jadwal ini telah dibatalkan atau tidak tersedia lagi oleh pihak klinik/psikolog. Silakan pilih jadwal sesi lainnya.'),
          { statusCode: 409 }
        )
      }

      if (
        slot &&
        (slot.status === 'SUDAH_DIBOOKING' ||
          (slot.booking_konsultasi && slot.booking_konsultasi.status !== 'CANCELLED'))
      ) {
        throw Object.assign(
          new Error('Mohon maaf, slot sesi ini baru saja dipesan oleh klien lain. Silakan pilih jadwal sesi lainnya.'),
          { statusCode: 409 }
        )
      }

      // Resolusi ID psikolog jika diteruskan sebagai account ID, nama, atau slug
      let resolvedPsikologId = data.id_psikolog
      if (resolvedPsikologId) {
        const isUuidPsi = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(resolvedPsikologId)
        if (!isUuidPsi) {
          const psi = await tx.psikolog.findFirst({
            where: {
              OR: [
                { nama_gelar: { contains: resolvedPsikologId, mode: 'insensitive' } },
                { account: { nama: { contains: resolvedPsikologId, mode: 'insensitive' } } },
                { account: { email: { contains: resolvedPsikologId, mode: 'insensitive' } } },
              ],
            },
          })
          if (psi) resolvedPsikologId = psi.id
        } else {
          const psiByAccount = await tx.psikolog.findUnique({
            where: { id_account: resolvedPsikologId },
          })
          if (psiByAccount) resolvedPsikologId = psiByAccount.id
        }
      }

      // Jika slot tidak ditemukan dengan id_jadwal, cari berdasarkan psikolog, tanggal, dan jam_mulai (atau cari slot asesmen jika resolvedPsikologId kosong)
      if (!slot && data.tanggal && data.jam_mulai) {
        const parsedTanggal = parseDateString(data.tanggal)
        const parsedJamMulai = timeStringToDate(data.jam_mulai)

        if (resolvedPsikologId) {
          slot = await tx.jadwalSlot.findFirst({
            where: {
              id_psikolog: resolvedPsikologId,
              tanggal: parsedTanggal,
              jam_mulai: parsedJamMulai,
            },
            include: { psikolog: true, booking_konsultasi: { include: { client: true } } },
          })
        } else {
          slot = await tx.jadwalSlot.findFirst({
            where: {
              tanggal: parsedTanggal,
              jam_mulai: parsedJamMulai,
              tipe_jadwal: 'ASESMEN',
            },
            include: { psikolog: true, booking_konsultasi: { include: { client: true } } },
          })
        }

        // Slot wajib memang sudah ada di database dan dibuka oleh psikolog
        if (!slot) {
          throw Object.assign(
            new Error('Slot jadwal ini tidak ditemukan atau belum dibuka oleh psikolog pada database. Silakan pilih jadwal sesi yang tersedia.'),
            { statusCode: 404 }
          )
        }
      }

      if (!slot) {
        throw Object.assign(
          new Error('Slot jadwal tidak ditemukan atau belum dipilih pada database.'),
          { statusCode: 400 }
        )
      }

      // Validasi ketersediaan slot & cegah duplikasi booking
      const existingBooking = slot.booking_konsultasi || await tx.bookingKonsultasi.findUnique({
          where: { id_jadwal: slot.id },
          include: { client: true },
        })

        if (existingBooking && existingBooking.status !== 'CANCELLED') {
          // Izinkan jika klien yang sama ingin melanjutkan pembayaran status PENDING sebelumnya
          const clientStandardPhone = normalizePhoneNumber(existingBooking.client?.no_telepon)
          const inputStandardPhone = normalizePhoneNumber(data.klien.no_telepon)
          const isSamePhone =
            Boolean(clientStandardPhone && inputStandardPhone && clientStandardPhone === inputStandardPhone) ||
            existingBooking.client?.no_telepon === data.klien.no_telepon ||
            (clientStandardPhone.length >= 8 &&
             inputStandardPhone.length >= 8 &&
             (clientStandardPhone.endsWith(inputStandardPhone.slice(-8)) ||
              inputStandardPhone.endsWith(clientStandardPhone.slice(-8))))

          const isSameName = Boolean(
            existingBooking.client?.nama &&
            data.klien.nama &&
            existingBooking.client.nama.trim().toUpperCase() === data.klien.nama.trim().toUpperCase()
          )

          // Hanya izinkan lanjut jika klien yang sama (status PENDING DAN nomor telepon sama DAN nama sama)
          const isSameClient =
            existingBooking.status === 'PENDING' &&
            isSamePhone &&
            isSameName

          if (!isSameClient) {
            throw Object.assign(
              new Error('Mohon maaf, slot sesi ini baru saja dipesan oleh klien lain. Silakan pilih jadwal sesi lainnya.'),
              { statusCode: 409 }
            )
          }

          // Klien yang sama melanjutkan booking PENDING: perbarui data dan kembalikan (mencegah error duplikasi P2002)
          const updatedBooking = await tx.bookingKonsultasi.update({
            where: { id: existingBooking.id },
            data: {
              metode: (data.metode || 'ONLINE').toUpperCase(),
              deskripsi_trauma: data.deskripsi_trauma || existingBooking.deskripsi_trauma,
            },
            include: {
              client: true,
              layanan: true,
              transaksi: true,
              jadwal: {
                include: {
                  psikolog: true,
                },
              },
            },
          })

          if (existingBooking.id_transaksi) {
            await tx.transaksi.update({
              where: { id: existingBooking.id_transaksi },
              data: {
                metode_pembayaran: (data.metode_pembayaran || 'QRIS').toUpperCase() as any,
                channel_pembayaran: data.channel_pembayaran || null,
              },
            }).catch(() => {})
          }

          return updatedBooking
        }

        if (slot.status === 'SUDAH_DIBOOKING' && (!existingBooking || existingBooking.status !== 'CANCELLED')) {
          throw Object.assign(
            new Error('Mohon maaf, slot sesi ini baru saja dipesan oleh klien lain. Silakan pilih jadwal sesi lainnya.'),
            { statusCode: 409 }
          )
        }

        // Jika slot sebelumnya pernah memiliki booking berstatus CANCELLED,
        // buat slot baru dengan jam/tanggal yang sama untuk booking baru ini
        // agar tidak terjadi tabrakan unique constraint pada BookingKonsultasi.id_jadwal
        if (existingBooking && existingBooking.status === 'CANCELLED') {
          await tx.jadwalSlot.update({
            where: { id: slot.id },
            data: { status: 'SUDAH_DIBOOKING' } as any,
          }).catch(() => {})

          slot = await tx.jadwalSlot.create({
            data: {
              id_psikolog: slot.id_psikolog,
              tanggal: slot.tanggal,
              jam_mulai: slot.jam_mulai,
              jam_selesai: slot.jam_selesai,
              metode: slot.metode,
              status: 'SUDAH_DIBOOKING' as any,
              tipe_jadwal: slot.tipe_jadwal || 'KONSULTASI',
            } as any,
            include: { psikolog: true },
          })
        } else {
          // 2. Update status slot menjadi SUDAH_DIBOOKING
          await tx.jadwalSlot.update({
            where: { id: slot.id },
            data: { status: 'SUDAH_DIBOOKING' } as any,
          })
        }

      // 3. Buat atau cari Klien berdasarkan kombinasi nomor telepon DAN nama (case-insensitive)
      // Satu nomor bisa dipakai beberapa klien berbeda (misal keluarga/anak), sehingga profil dicocokkan berdasarkan kombinasi nomor + nama.
      const inputName = (data.klien.nama || '').trim()
      const rawPhone = (data.klien.no_telepon || '').trim()
      const standardizedPhone = normalizePhoneNumber(rawPhone) || rawPhone
      const digitsOnly = rawPhone.replace(/\D/g, '')

      const phoneConditions: Prisma.ClientWhereInput[] = rawPhone ? [
        { no_telepon: standardizedPhone },
        { no_telepon: rawPhone },
        ...(digitsOnly.length >= 8 ? [
          { no_telepon: digitsOnly },
          { no_telepon: '0' + (standardizedPhone.startsWith('62') ? standardizedPhone.slice(2) : digitsOnly) },
        ] : []),
      ] : []

      let client: any = null

      if (inputName && phoneConditions.length > 0) {
        client = await tx.client.findFirst({
          where: {
            AND: [
              { OR: phoneConditions },
              { nama: { equals: inputName, mode: 'insensitive' } },
            ],
          },
        })
      } else if (phoneConditions.length > 0) {
        client = await tx.client.findFirst({
          where: { OR: phoneConditions },
        })
      } else if (inputName) {
        client = await tx.client.findFirst({
          where: { nama: { equals: inputName, mode: 'insensitive' } },
        })
      }

      if (!client) {
        client = await tx.client.create({
          data: {
            nama: inputName || 'Klien',
            no_telepon: standardizedPhone || null,
            usia: data.klien.usia,
            jenis_kelamin: data.klien.jenis_kelamin,
            id_biro: resolvedBiroId || null,
          },
        })
      } else {
        const updateData: Prisma.ClientUpdateInput = {}
        if (resolvedBiroId && !client.id_biro) {
          updateData.biro = { connect: { id: resolvedBiroId } }
        }
        if (standardizedPhone && client.no_telepon !== standardizedPhone) {
          updateData.no_telepon = standardizedPhone
        }
        if (data.klien.usia !== undefined && data.klien.usia !== null && data.klien.usia !== client.usia) {
          updateData.usia = data.klien.usia
        }
        if (data.klien.jenis_kelamin && data.klien.jenis_kelamin !== client.jenis_kelamin) {
          updateData.jenis_kelamin = data.klien.jenis_kelamin
        }
        // Jangan timpa nama klien yang sudah ada
        if (Object.keys(updateData).length > 0) {
          client = await tx.client.update({
            where: { id: client.id },
            data: updateData,
          }).catch(() => client)
        }
      }

      if (!client) {
        throw Object.assign(new Error('Gagal memproses data klien'), { statusCode: 400 })
      }

      // 4. Cari info layanan untuk menentukan nominal transaksi (fallback otomatis ke layanan aktif pertama)
      let resolvedLayananId = data.id_layanan
      let layanan: any = null
      if (resolvedLayananId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(resolvedLayananId)) {
        layanan = await tx.layanan.findUnique({
          where: { id: resolvedLayananId },
        })
      }

      const isAsesmen =
        slot?.tipe_jadwal === 'ASESMEN' ||
        (data as any).tipe_jadwal === 'ASESMEN' ||
        (data.metode?.toUpperCase() === 'OFFLINE' && !data.id_psikolog) ||
        (data.deskripsi_trauma || '').toLowerCase().includes('asesmen') ||
        (data.layanan || '').toLowerCase().includes('asesmen') ||
        (data.nama_layanan || '').toLowerCase().includes('asesmen')

      if (!layanan) {
        if (isAsesmen) {
          const reqName = (data.layanan || data.nama_layanan || '').replace(/\s*\((weekday|weekend)\)/i, '').trim()
          if (reqName) {
            layanan = await tx.layanan.findFirst({
              where: {
                kategori: 'ASESMEN',
                nama: { contains: reqName, mode: 'insensitive' },
              },
            })
          }
          if (!layanan) {
            layanan = await tx.layanan.findFirst({
              where: { kategori: 'ASESMEN', aktif: true },
            })
          }
          if (!layanan) {
            layanan = await tx.layanan.findFirst({
              where: { kategori: 'ASESMEN' },
            })
          }
          if (!layanan) {
            layanan = await tx.layanan.create({
              data: {
                nama: reqName || 'Asesmen Minat Bakat (Offline)',
                kategori: 'ASESMEN',
                deskripsi: 'Sesi asesmen psikologi tatap muka di klinik Empathika.',
                harga_weekday: 400000,
                harga_weekend: 500000,
                aktif: true,
              },
            })
          }
        }

        if (!layanan) {
          layanan = await tx.layanan.findFirst({ where: { aktif: true } })
          if (!layanan) {
            layanan = await tx.layanan.findFirst()
          }
        }

        if (layanan) {
          resolvedLayananId = layanan.id
        }
      }

      // Hitung nominal harga: Cek apakah sesi jatuh di Weekend (Sabtu / Minggu)
      let isWeekend = false
      if (slot?.tanggal) {
        const slotDay = new Date(slot.tanggal).getDay() // 0 = Minggu, 6 = Sabtu
        isWeekend = slotDay === 0 || slotDay === 6
      }
      let nominal = 200000
      const psikologKategori = (slot?.psikolog?.kategori || '').toLowerCase()
      const tarifJson = (layanan as any)?.tarif_tenaga_ahli

      let matchedTarif: { weekday?: number; weekend?: number } | null = null
      if (tarifJson && typeof tarifJson === 'object') {
        if (psikologKategori.includes('peer')) {
          matchedTarif = tarifJson.peer
        } else if (psikologKategori.includes('konselor')) {
          matchedTarif = tarifJson.konselor
        } else {
          matchedTarif = tarifJson.psikolog
        }
      }

      if (matchedTarif) {
        if (isWeekend && matchedTarif.weekend && Number(matchedTarif.weekend) > 0) {
          nominal = Number(matchedTarif.weekend)
        } else if (matchedTarif.weekday && Number(matchedTarif.weekday) > 0) {
          nominal = Number(matchedTarif.weekday)
        }
      } else if (layanan) {
        if (isWeekend && layanan.harga_weekend && Number(layanan.harga_weekend) > 0) {
          nominal = Number(layanan.harga_weekend)
        } else if (layanan.harga_weekday && Number(layanan.harga_weekday) > 0) {
          nominal = Number(layanan.harga_weekday)
        }
      }
      // Status awal booking publik SELALU PENDING sampai diverifikasi pembayarannya
      const finalStatus: StatusBooking = 'PENDING'
      const paymentStatus: StatusPembayaran = 'PENDING'

      // 5. Buat Transaksi
      const prefix = isAsesmen ? 'ASES' : 'KONS'
      const kode_pesanan = generateOrderId(prefix)
      const kode_transaksi = generateTrxId()
      const effectiveBiroId = resolvedBiroId || (data as any).id_biro || client.id_biro || null
      let metodeBayar = (data.metode_pembayaran || 'QRIS').toUpperCase()
      if (!['TRANSFER_BANK', 'E_WALLET', 'QRIS'].includes(metodeBayar)) {
        if (metodeBayar === 'BANK') metodeBayar = 'TRANSFER_BANK'
        else if (metodeBayar === 'EWALLET') metodeBayar = 'E_WALLET'
        else metodeBayar = 'QRIS'
      }
      const tipeSesi = (data.metode || 'ONLINE').toUpperCase() as 'ONLINE' | 'OFFLINE'
      const dariBiro = Boolean(effectiveBiroId)
      const rincian = hitungTransaksi(nominal, tipeSesi, metodeBayar, dariBiro)

      const transaksi = await tx.transaksi.create({
        data: {
          id_client: client.id,
          id_biro_tenant: effectiveBiroId,
          kode_transaksi,
          tipe_transaksi: 'KONSULTASI',
          harga_dasar: rincian.hargaDasar,
          biaya_layanan: rincian.biayaLayanan,
          komisi_biro: rincian.komisiBiro,
          subtotal: rincian.subtotalKlien,
          biaya_admin: rincian.biayaLayanan,
          total: rincian.total,
          metode_pembayaran: metodeBayar as any,
          channel_pembayaran: data.channel_pembayaran || null,
          status_pembayaran: paymentStatus,
        } as any,
      })

      // 6. Buat BookingKonsultasi (terhubung langsung ke JadwalSlot dan Transaksi)
      // Tangani race condition jika ada klien lain yang menekan tombol bayar di milidetik yang sama
      let booking: any
      try {
        booking = await tx.bookingKonsultasi.create({
          data: {
            kode_pesanan,
            id_client: client.id,
            id_layanan: resolvedLayananId,
            id_jadwal: slot.id,
            id_transaksi: transaksi.id,
            metode: (data.metode || 'ONLINE').toUpperCase(),
            deskripsi_trauma: data.deskripsi_trauma,
            status: finalStatus,
          } as any,
          include: {
            client: true,
            layanan: true,
            transaksi: true,
            jadwal: {
              include: {
                psikolog: true,
              },
            },
          },
        })
      } catch (err: any) {
        if (
          err?.code === 'P2002' ||
          err?.message?.includes('P2002') ||
          (err?.meta?.target && String(err.meta.target).includes('id_jadwal'))
        ) {
          throw Object.assign(
            new Error('Mohon maaf, slot sesi ini baru saja dipesan oleh klien lain. Silakan pilih jadwal sesi lainnya.'),
            { statusCode: 409, code: 'P2002' }
          )
        }
        throw err
      }

      return booking
    }, { timeout: 30000, maxWait: 10000 })
  }

  async confirmBookingPayment(bookingId: string) {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.bookingKonsultasi.findUnique({
        where: { id: bookingId },
        include: { transaksi: true, jadwal: true },
      })

      if (!booking) {
        throw Object.assign(new Error('Sesi booking tidak ditemukan'), { statusCode: 404 })
      }

      if (booking.status === 'CONFIRMED') {
        return { success: true, message: 'Pembayaran sudah pernah dikonfirmasi sebelumnya', booking }
      }

      if (booking.status === 'CANCELLED') {
        throw Object.assign(new Error('Sesi booking telah dibatalkan atau kedaluwarsa'), { statusCode: 400 })
      }

      // 1. Update status booking menjadi CONFIRMED
      const updatedBooking = await tx.bookingKonsultasi.update({
        where: { id: booking.id },
        data: { status: 'CONFIRMED' },
        include: {
          client: true,
          layanan: true,
          transaksi: true,
          jadwal: {
            include: { psikolog: true },
          },
        },
      })

      // 2. Update status transaksi menjadi PAID
      let updatedTransaksi = booking.transaksi
      if (booking.id_transaksi) {
        updatedTransaksi = await tx.transaksi.update({
          where: { id: booking.id_transaksi },
          data: {
            status_pembayaran: 'PAID',
            tanggal_bayar: new Date(),
          } as any,
        }).catch(() => null)
      }

      // 3. Pastikan slot berstatus SUDAH_DIBOOKING
      if (booking.id_jadwal) {
        await tx.jadwalSlot.update({
          where: { id: booking.id_jadwal },
          data: { status: 'SUDAH_DIBOOKING' } as any,
        }).catch(() => {})
      }

      // 4. Tambah jumlah_sesi psikolog (hanya saat pembayaran berhasil dikonfirmasi)
      if (booking.jadwal?.id_psikolog) {
        await tx.psikolog.update({
          where: { id: booking.jadwal.id_psikolog },
          data: { jumlah_sesi: { increment: 1 } },
        }).catch(() => {})
      }

      // 5. Catat pembagian transaksi jika belum tercatat
      if (updatedTransaksi && booking.id_transaksi) {
        try {
          const existingPembagian = await tx.pembagianTransaksi.count({
            where: { id_transaksi: updatedTransaksi.id },
          })
          if (existingPembagian === 0) {
            const hargaDasar = updatedTransaksi.harga_dasar
              ? Number(updatedTransaksi.harga_dasar)
              : Number(updatedTransaksi.subtotal)
            const metode = (updatedTransaksi.metode_pembayaran as string) || 'QRIS'
            const tipeSesi = (booking.metode || 'ONLINE').toUpperCase() as 'OFFLINE' | 'ONLINE'
            const dariBiro = Boolean(updatedTransaksi.id_biro_tenant)
            const hasil = hitungTransaksi(hargaDasar, tipeSesi, metode, dariBiro)
            const idPsikolog = booking.jadwal?.id_psikolog ?? null

            await tx.pembagianTransaksi.create({
              data: {
                id_transaksi: updatedTransaksi.id,
                penerima_tipe: 'PSIKOLOG',
                penerima_id: idPsikolog,
                jumlah: hasil.porsiPsikolog,
                alasan: 'SESI_NORMAL',
                status: 'BELUM_DICAIRKAN',
              },
            })

            await tx.pembagianTransaksi.create({
              data: {
                id_transaksi: updatedTransaksi.id,
                penerima_tipe: 'EMPATHIKA',
                penerima_id: null,
                jumlah: hasil.porsiEmpathika,
                alasan: 'SESI_NORMAL',
                status: 'BERHASIL',
              },
            })

            if (dariBiro && hasil.komisiBiro > 0) {
              await tx.pembagianTransaksi.create({
                data: {
                  id_transaksi: updatedTransaksi.id,
                  penerima_tipe: 'BIRO',
                  penerima_id: updatedTransaksi.id_biro_tenant,
                  jumlah: hasil.komisiBiro,
                  alasan: 'SESI_NORMAL',
                  status: 'BELUM_DICAIRKAN',
                },
              })
            }
          }
        } catch (err: any) {
          console.error('[Booking] Gagal mencatat ledger pembagian:', err?.message)
        }
      }

      return {
        success: true,
        message: 'Pembayaran berhasil dikonfirmasi.',
        booking: updatedBooking,
        transaksi: updatedTransaksi,
      }
    }, { timeout: 30000, maxWait: 10000 })
  }

  async updateBookingStatus(id: string, status: StatusBooking) {
    return this.prisma.$transaction(async (tx) => {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
      let existing = await tx.bookingKonsultasi.findFirst({
        where: {
          OR: [
            ...(isUuid ? [{ id }, { id_jadwal: id }] : []),
            { kode_pesanan: id },
          ],
        },
        include: {
          client: true,
          layanan: true,
          jadwal: {
            include: {
              psikolog: true,
            },
          },
        },
      })

      if (!existing && isUuid) {
        // Cek jika ID yang dikirim merupakan ID dari JadwalSlot
        const slot = await tx.jadwalSlot.findUnique({
          where: { id },
          include: {
            booking_konsultasi: {
              include: {
                client: true,
                layanan: true,
                jadwal: {
                  include: {
                    psikolog: true,
                  },
                },
              },
            },
          },
        })

        if (slot) {
          if (slot.booking_konsultasi) {
            existing = slot.booking_konsultasi as any
          } else {
            // Slot mandiri tanpa booking: kembalikan ke TERSEDIA
            const updatedSlot = await tx.jadwalSlot.update({
              where: { id },
              data: { status: 'TERSEDIA' } as any,
            })
            return {
              id: updatedSlot.id,
              status: 'CANCELLED',
              client: { nama: '-' },
              layanan: { nama: '-' },
            } as any
          }
        }
      }

      if (!existing) {
        // Cek apakah ID yang dikirim merupakan ID transaksi atau kode transaksi
        const trx = await tx.transaksi.findFirst({
          where: {
            OR: [
              ...(isUuid ? [{ id }] : []),
              { kode_transaksi: id },
            ],
          },
          include: {
            booking_konsultasi: {
              include: {
                client: true,
                layanan: true,
                jadwal: {
                  include: {
                    psikolog: true,
                  },
                },
              },
            },
          },
        })
        if (trx?.booking_konsultasi) {
          existing = trx.booking_konsultasi as any
        }
      }

      if (!existing) {
        throw new Error('Booking konsultasi tidak ditemukan')
      }

      const updated = await tx.bookingKonsultasi.update({
        where: { id: existing.id },
        data: { status },
        include: {
          client: true,
          layanan: true,
          jadwal: {
            include: {
              psikolog: true,
            },
          },
        },
      })

      // Jika dibatalkan (CANCELLED) oleh admin
      if (status === 'CANCELLED') {
        // Lepas slot jadwal agar kembali TERSEDIA
        if (existing.id_jadwal) {
          await tx.jadwalSlot.update({
            where: { id: existing.id_jadwal },
            data: { status: 'TERSEDIA' } as any,
          }).catch(() => { })
        }
        // Kurangi jumlah sesi psikolog yang sebelumnya bertambah saat booking
        if (existing.jadwal?.id_psikolog) {
          await tx.psikolog.update({
            where: { id: existing.jadwal.id_psikolog },
            data: { jumlah_sesi: { decrement: 1 } },
          }).catch(() => { })
        }
        // Update transaksi jika ada
        if (existing.id_transaksi) {
          await tx.transaksi.update({
            where: { id: existing.id_transaksi },
            data: {
              status_pembayaran: 'REFUNDED',
              refund_at: new Date(),
              refund_reason: 'Dibatalkan oleh Admin',
            },
          }).catch(() => { })
        }
      } else if (existing.status === 'CANCELLED' && (status === 'CONFIRMED' || status === 'PENDING')) {
        // Jika diaktifkan kembali dari CANCELLED
        if (existing.id_jadwal) {
          await tx.jadwalSlot.update({
            where: { id: existing.id_jadwal },
            data: { status: 'SUDAH_DIBOOKING' } as any,
          }).catch(() => { })
        }
        if (existing.jadwal?.id_psikolog) {
          await tx.psikolog.update({
            where: { id: existing.jadwal.id_psikolog },
            data: { jumlah_sesi: { increment: 1 } },
          }).catch(() => { })
        }
      }

      return updated
    }, { timeout: 30000, maxWait: 10000 })
  }

  async findBookingById(id: string) {
    return this.prisma.bookingKonsultasi.findUnique({
      where: { id },
      include: {
        client: true,
        layanan: true,
        transaksi: true,
        jadwal: {
          include: {
            psikolog: true,
          },
        },
      },
    })
  }

  async refundBooking(params: {
    bookingId: string
    adminName: string
    alasan: string
  }) {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.bookingKonsultasi.findUnique({
        where: { id: params.bookingId },
        include: {
          transaksi: true,
          jadwal: true,
          client: true,
          layanan: true,
        },
      })

      if (!booking) {
        throw Object.assign(new Error('Sesi booking tidak ditemukan'), { statusCode: 404 })
      }

      // Pastikan status belum dibatalkan / direfund
      if (booking.status === 'CANCELLED' || booking.transaksi?.status_pembayaran === 'REFUNDED') {
        throw Object.assign(new Error('Sesi atau transaksi ini sudah pernah direfund atau dibatalkan sebelumnya'), { statusCode: 409 })
      }

      if (booking.status === 'COMPLETED') {
        throw Object.assign(new Error('Sesi yang sudah selesai tidak dapat direfund'), { statusCode: 422 })
      }

      // Validasi kelayakan refund sesuai aturan baru (> H-3: 100%, H-3 s.d 3 jam: 70%, <= 3 jam: ditolak)
      const { evaluateRefundEligibility } = await import('../../utils/date-time.js')
      const evaluasi = evaluateRefundEligibility(booking.jadwal.tanggal, booking.jadwal.jam_mulai)

      if (evaluasi.kategori === 'DITOLAK') {
        throw Object.assign(
          new Error(evaluasi.alasanPenolakan || 'Refund ditolak karena batas waktu pengajuan telah terlewati'),
          {
            statusCode: 422,
            details: {
              batasRefund3Jam: evaluasi.refundDeadline3Jam.toISOString(),
            },
          }
        )
      }

      const totalNominal = booking.transaksi ? Number(booking.transaksi.total) : Number(booking.layanan.harga_weekday)
      const refundAmount = Math.floor((totalNominal * evaluasi.persenRefund) / 100)
      const nominalDitahan = totalNominal - refundAmount

      const tipeSesi = (booking.metode || 'ONLINE').toUpperCase() === 'OFFLINE' ? 'OFFLINE' : 'ONLINE'
      const persenPsikolog = tipeSesi === 'OFFLINE' ? 60 : 50
      const porsiPsikologPotongan = Math.floor((nominalDitahan * persenPsikolog) / 100)
      const porsiEmpathikaPotongan = nominalDitahan - porsiPsikologPotongan

      const catatanAlokasi = [
        `[Refund ${evaluasi.persenRefund}% - Potongan ${evaluasi.persenPotongan}%]`,
        `Kategori: ${evaluasi.kategori}`,
        `Total: Rp ${totalNominal.toLocaleString('id-ID')}`,
        `Dikembalikan: Rp ${refundAmount.toLocaleString('id-ID')}`,
        `Potongan: Rp ${nominalDitahan.toLocaleString('id-ID')}`,
        nominalDitahan > 0
          ? `(Hak Psikolog: Rp ${porsiPsikologPotongan.toLocaleString('id-ID')}, Empathika: Rp ${porsiEmpathikaPotongan.toLocaleString('id-ID')})`
          : '',
        `Alasan: ${params.alasan}`,
      ].filter(Boolean).join(' | ')

      // 1. Update / Catat transaksi (PENTING: Jangan di-delete, hanya update status ke REFUNDED)
      let updatedTransaksi: any = booking.transaksi
      if (booking.transaksi) {
        updatedTransaksi = await tx.transaksi.update({
          where: { id: booking.transaksi.id },
          data: {
            status_pembayaran: 'REFUNDED',
            refund_at: new Date(),
            refund_reason: catatanAlokasi,
            refund_amount: refundAmount,
            nominal_ditahan: nominalDitahan,
            nominal_dikembalikan: refundAmount,
            alasan_penahanan: params.alasan,
          } as any,
        })
      } else {
        // Jika sesi belum memiliki record transaksi terhubung (misal walk-in manual admin), buat record transaksi REFUNDED
        updatedTransaksi = await tx.transaksi.create({
          data: {
            id_client: booking.id_client,
            tipe_transaksi: 'KONSULTASI',
            subtotal: totalNominal,
            biaya_admin: 0,
            total: totalNominal,
            metode_pembayaran: 'TRANSFER_BANK',
            status_pembayaran: 'REFUNDED',
            refund_at: new Date(),
            refund_reason: catatanAlokasi,
            refund_amount: refundAmount,
            nominal_ditahan: nominalDitahan,
            nominal_dikembalikan: refundAmount,
            alasan_penahanan: params.alasan,
          } as any,
        })
      }

      // Update ledger pembagian jika ada
      if (booking.transaksi) {
        if (evaluasi.kategori === 'FULL_REFUND') {
          await tx.pembagianTransaksi.updateMany({
            where: { id_transaksi: booking.transaksi.id, penerima_tipe: 'PSIKOLOG' },
            data: {
              jumlah: 0,
              status: 'BERHASIL',
              catatan_pembayaran: 'Refund penuh 100% (tidak ada honor yang dibayarkan)',
            },
          })
        } else {
          await tx.pembagianTransaksi.updateMany({
            where: { id_transaksi: booking.transaksi.id, penerima_tipe: 'PSIKOLOG' },
            data: {
              jumlah: porsiPsikologPotongan,
              alasan: 'REFUND_POTONGAN_30',
              catatan_pembayaran: `Refund 70% (potongan 30% sebesar Rp ${nominalDitahan.toLocaleString('id-ID')})`,
            },
          })
        }
      }

      // 2. Ubah status BookingKonsultasi menjadi CANCELLED
      const updatedBooking = await tx.bookingKonsultasi.update({
        where: { id: booking.id },
        data: {
          status: 'CANCELLED',
          id_transaksi: updatedTransaksi.id,
        } as any,
        include: {
          client: true,
          layanan: true,
          jadwal: {
            include: { psikolog: true },
          },
        },
      })

      // 3. Lepas slot jadwal psikolog agar kembali TERSEDIA untuk klien lain
      await tx.jadwalSlot.update({
        where: { id: booking.id_jadwal },
        data: { status: 'TERSEDIA' },
      })

      // 4. Kurangi jumlah sesi psikolog (karena sesi dibatalkan)
      if (booking.jadwal?.id_psikolog) {
        await tx.psikolog.update({
          where: { id: booking.jadwal.id_psikolog },
          data: { jumlah_sesi: { decrement: 1 } },
        }).catch(() => { })
      }

      return {
        booking: updatedBooking,
        transaksi: updatedTransaksi,
        nominalRefund: refundAmount,
      }
    }, { timeout: 30000, maxWait: 10000 })
  }

  async findAllBookings(params?: { id_biro?: string; status?: string }) {
    const where: Prisma.BookingKonsultasiWhereInput = {}
    if (params?.id_biro) {
      where.OR = [
        { transaksi: { id_biro_tenant: params.id_biro } },
        { client: { id_biro: params.id_biro } },
      ]
    }
    if (params?.status) {
      where.status = params.status as any
    }

    return this.prisma.bookingKonsultasi.findMany({
      where,
      include: {
        client: true,
        layanan: true,
        jadwal: {
          include: {
            psikolog: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  }

  async findBookingsByClientIdentifier(identifier: { phone?: string; email?: string; clientId?: string }) {
    const whereCondition: Prisma.BookingKonsultasiWhereInput = {}

    if (identifier.clientId) {
      whereCondition.id_client = identifier.clientId
    } else if (identifier.phone) {
      const stdPhone = normalizePhoneNumber(identifier.phone)
      const cleanDigits = identifier.phone.replace(/\D/g, '')
      whereCondition.client = {
        OR: [
          ...(stdPhone ? [{ no_telepon: stdPhone }] : []),
          ...(cleanDigits.length >= 8 ? [{ no_telepon: { contains: cleanDigits.slice(-8) } }] : []),
          { no_telepon: identifier.phone },
        ],
      }
    }

    return this.prisma.bookingKonsultasi.findMany({
      where: whereCondition,
      include: {
        client: true,
        layanan: true,
        transaksi: true,
        jadwal: {
          include: {
            psikolog: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  // ── Helper Psikolog ──
  async findPsikologById(id: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
    if (!isUuid) return null
    return this.prisma.psikolog.findUnique({
      where: { id },
      include: { spesialisasi: true },
    })
  }

  async findPsikologByAccountId(id_account: string) {
    if (!id_account) return null
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id_account)
    if (!isUuid) return null
    return this.prisma.psikolog.findUnique({
      where: { id_account },
      include: { spesialisasi: true },
    })
  }

  async findFirstPsikolog() {
    const defaultJane = await this.prisma.psikolog.findFirst({
      where: {
        OR: [
          { nama_gelar: { contains: 'Jane', mode: 'insensitive' } },
          { account: { email: { contains: 'psikolog@empathika', mode: 'insensitive' } } },
        ],
      },
      include: { spesialisasi: true },
    })
    if (defaultJane) return defaultJane

    return this.prisma.psikolog.findFirst({
      include: { spesialisasi: true },
    })
  }

  // ── 7. Reschedule Booking Konsultasi ──
  async rescheduleBooking(
    idOrSlotId: string,
    input: { newDate: string; newWaktu: string; alasan?: string },
    user?: { id: string; role?: string; email?: string }
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Cari booking berdasarkan ID booking, ID slot jadwal, atau kode pesanan
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrSlotId)
      let booking = await tx.bookingKonsultasi.findFirst({
        where: {
          OR: [
            ...(isUuid ? [{ id: idOrSlotId }, { id_jadwal: idOrSlotId }] : []),
            { kode_pesanan: idOrSlotId },
          ],
        },
        include: {
          client: true,
          layanan: true,
          jadwal: {
            include: {
              psikolog: {
                include: {
                  account: true,
                },
              },
            },
          },
        },
      })

      // Jika tidak ditemukan langsung dan format UUID, coba cari slotnya terlebih dahulu
      if (!booking && isUuid) {
        const slot = await tx.jadwalSlot.findUnique({
          where: { id: idOrSlotId },
          include: {
            booking_konsultasi: {
              include: {
                client: true,
                layanan: true,
                jadwal: {
                  include: {
                    psikolog: {
                      include: {
                        account: true,
                      },
                    },
                  },
                },
              },
            },
          },
        })
        if (slot?.booking_konsultasi) {
          booking = slot.booking_konsultasi as any
        }
      }

      if (!booking) {
        throw Object.assign(
          new Error('Data sesi konsultasi / booking tidak ditemukan untuk dijadwalkan ulang'),
          { statusCode: 404 }
        )
      }

      // ── VERIFIKASI OTORISASI KEPEMILIKAN (Pencegahan IDOR) ──
      // Aturan: Hanya role ADMIN dan PSIKOLOG terkait yang berhak melakukan reschedule
      if (user) {
        const role = (user.role || '').toUpperCase()

        if (role !== 'ADMIN' && role !== 'PSIKOLOG') {
          throw Object.assign(
            new Error('Akses ditolak: Fitur reschedule hanya dapat diakses oleh Admin atau Tenaga Ahli (Psikolog) terkait.'),
            { statusCode: 403 }
          )
        }

        if (role === 'PSIKOLOG') {
          const assignedAccountId = booking.jadwal?.psikolog?.id_account
          const assignedPsikologId = booking.jadwal?.id_psikolog

          let isAssigned = Boolean(
            (assignedAccountId && assignedAccountId === user.id) ||
            (assignedPsikologId && assignedPsikologId === user.id)
          )

          if (!isAssigned) {
            const psi = await tx.psikolog.findFirst({
              where: { id_account: user.id },
              select: { id: true },
            })
            if (psi && psi.id === assignedPsikologId) {
              isAssigned = true
            }
          }

          if (!isAssigned) {
            throw Object.assign(
              new Error('Akses ditolak: Anda hanya dapat menjadwalkan ulang (reschedule) sesi konsultasi milik Anda sendiri.'),
              { statusCode: 403 }
            )
          }
        }
      }

      // 2. Lepas slot jadwal lama agar kembali TERSEDIA untuk klien lain
      const oldSlotId = booking.id_jadwal
      if (oldSlotId) {
        await tx.jadwalSlot.update({
          where: { id: oldSlotId },
          data: { status: 'TERSEDIA' },
        }).catch(() => {})
      }

      // 3. Parse tanggal baru dan jam baru
      const parsedNewDate = parseDateString(input.newDate)
      const cleanTime = (input.newWaktu || '').replace(/\s*WIB/gi, '').trim()
      const timeParts = cleanTime.split('-').map((s) => s.trim())
      const jamMulaiStr = timeParts[0] || '10:00'
      let jamSelesaiStr = timeParts[1]
      if (!jamSelesaiStr) {
        const [h, m] = jamMulaiStr.split(':').map(Number)
        jamSelesaiStr = `${String((h + 1) % 24).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`
      }
      const parsedJamMulai = timeStringToDate(jamMulaiStr)
      const parsedJamSelesai = timeStringToDate(jamSelesaiStr)

      const targetPsikologId = booking.jadwal?.id_psikolog || null
      const tipeJadwal = booking.jadwal?.tipe_jadwal || 'KONSULTASI'
      const metode = booking.metode || booking.jadwal?.metode || 'ONLINE'

      // 4. Cari apakah sudah ada slot jadwal di tanggal dan jam baru tersebut
      const targetSlot = await tx.jadwalSlot.findFirst({
        where: {
          tanggal: parsedNewDate,
          jam_mulai: parsedJamMulai,
          ...(targetPsikologId ? { id_psikolog: targetPsikologId } : {}),
        },
        include: {
          booking_konsultasi: true,
        },
      })

      let targetSlotId: string

      if (targetSlot) {
        // Cek jika slot sudah dibooking oleh booking lain yang masih aktif
        if (
          targetSlot.booking_konsultasi &&
          targetSlot.booking_konsultasi.id !== booking.id &&
          targetSlot.booking_konsultasi.status !== 'CANCELLED'
        ) {
          throw new Error('Slot jadwal pada tanggal dan jam tersebut sudah dibooking oleh klien lain.')
        }

        // Tandai slot sebagai SUDAH_DIBOOKING
        const updatedTarget = await tx.jadwalSlot.update({
          where: { id: targetSlot.id },
          data: {
            status: 'SUDAH_DIBOOKING',
          },
        })
        targetSlotId = updatedTarget.id
      } else {
        // Jika belum ada slot (misal asesmen klinik atau slot baru), buat slot baru
        let psiId = targetPsikologId
        if (!psiId) {
          const firstPsi = await tx.psikolog.findFirst({ select: { id: true } })
          if (!firstPsi) throw new Error('Data psikolog tidak ditemukan di database.')
          psiId = firstPsi.id
        }

        const createdTarget = await tx.jadwalSlot.create({
          data: {
            id_psikolog: psiId,
            tipe_jadwal: tipeJadwal,
            metode: metode.toUpperCase().includes('OFFLINE') ? 'OFFLINE' : 'ONLINE',
            tanggal: parsedNewDate,
            jam_mulai: parsedJamMulai,
            jam_selesai: parsedJamSelesai,
            status: 'SUDAH_DIBOOKING',
          },
        })
        targetSlotId = createdTarget.id
      }

      // 5. Perbarui booking konsultasi agar menunjuk ke slot jadwal yang baru
      const catatanReschedule = input.alasan?.trim()
        ? `[Reschedule: ${input.alasan.trim()}]`
        : `[Reschedule ke ${input.newDate} ${cleanTime} WIB]`

      const updatedBooking = await tx.bookingKonsultasi.update({
        where: { id: booking.id },
        data: {
          id_jadwal: targetSlotId,
          deskripsi_trauma: booking.deskripsi_trauma
            ? `${booking.deskripsi_trauma} | ${catatanReschedule}`
            : catatanReschedule,
        },
        include: {
          client: true,
          layanan: true,
          jadwal: {
            include: {
              psikolog: {
                include: {
                  account: true,
                },
              },
            },
          },
        },
      })

      return {
        booking: updatedBooking,
        oldSlotId,
        newSlotId: targetSlotId,
        newDate: input.newDate,
        newWaktu: cleanTime,
      }
    }, { timeout: 30000, maxWait: 10000 })
  }
}

