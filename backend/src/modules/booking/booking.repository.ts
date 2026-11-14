import type { PrismaClient, Prisma, StatusBooking, StatusSlot, StatusPembayaran } from '@prisma/client'
import { parseDateString, timeStringToDate, formatDateToString, formatTimeToString, calculateRefundDeadline } from '../../utils/date-time'
import { generateOrderId, generateTrxId, normalizePhoneNumber } from '../../utils'

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
            { psikolog: { account: { id_biro: biroId } } },
            { booking_konsultasi: { client: { id_biro: biroId } } },
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
          },
        },
        booking_konsultasi: {
          include: {
            client: true,
            layanan: true,
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
              { client: { id_biro: biroId } },
              { jadwal: { psikolog: { account: { id_biro: biroId } } } },
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
      }).catch(() => { })
      expiredIds.push(booking.id)
    }

    return { count: expiredIds.length, expiredIds }
  }

  async findJadwalTersedia(params: {
    tanggal?: string
    id_psikolog?: string
    tipe_jadwal?: string
    metode?: string
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
        where.tipe_jadwal = { in: ['KONSULTASI', 'KEDUANYA', 'SEMUA'] }
      } else if (tj === 'ASESMEN') {
        where.tipe_jadwal = { in: ['ASESMEN', 'KEDUANYA', 'SEMUA'] }
      } else {
        where.tipe_jadwal = params.tipe_jadwal
      }
    } else if (resolvedPsikologId) {
      where.tipe_jadwal = { in: ['KONSULTASI', 'KEDUANYA', 'SEMUA'] }
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

    // 4. FILTER MUTLAK: Buang slot apa pun yang sudah dibooking atau berbentrok waktu!
    return availableCandidates.filter((slot) => {
      if (occupiedSlotIds.has(slot.id)) return false
      const dStr = formatDateToString(slot.tanggal)
      const jStr = formatTimeToString(slot.jam_mulai)
      if (occupiedTimeKeys.has(`${slot.id_psikolog}_${dStr}_${jStr}`)) return false
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
    klien: {
      nama: string
      no_telepon: string
      usia?: number
      jenis_kelamin?: string
    }
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Buat atau cari Klien berdasarkan nomor telepon (format standar tunggal 628...)
      const rawPhone = (data.klien.no_telepon || '').trim()
      const standardizedPhone = normalizePhoneNumber(rawPhone) || rawPhone
      const digitsOnly = rawPhone.replace(/\D/g, '')

      let client = await tx.client.findFirst({
        where: {
          OR: [
            { no_telepon: standardizedPhone },
            { no_telepon: rawPhone },
            ...(digitsOnly.length >= 8 ? [
              { no_telepon: digitsOnly },
              { no_telepon: '0' + (standardizedPhone.startsWith('62') ? standardizedPhone.slice(2) : digitsOnly) },
            ] : []),
          ],
        },
      })

      if (!client) {
        client = await tx.client.create({
          data: {
            nama: data.klien.nama.trim(),
            no_telepon: standardizedPhone,
            usia: data.klien.usia,
            jenis_kelamin: data.klien.jenis_kelamin,
          },
        })
      } else if (client.no_telepon !== standardizedPhone) {
        await tx.client.update({
          where: { id: client.id },
          data: { no_telepon: standardizedPhone },
        }).catch(() => {})
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
    })
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
    klien: {
      nama: string
      no_telepon: string
      email?: string
      usia?: number
      jenis_kelamin?: string
    }
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Verifikasi atau cari slot ketersediaan
      let slot: any = null
      let isNewlyCreated = false
      const isUuid = data.id_jadwal && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.id_jadwal)
      if (isUuid || (data.id_jadwal && !data.id_jadwal.startsWith('mock-') && !data.id_jadwal.startsWith('slot_asesmen_'))) {
        slot = await tx.jadwalSlot.findUnique({
          where: { id: data.id_jadwal },
          include: { psikolog: true, booking_konsultasi: true },
        })
        if (!slot) {
          throw Object.assign(
            new Error('Slot jadwal ini telah dihapus atau dibatalkan oleh pihak klinik/psikolog. Silakan pilih jadwal sesi lainnya.'),
            { statusCode: 409 }
          )
        }
      }

      if (slot && (slot.status === 'TIDAK_TERSEDIA' || slot.status === 'CANCELLED')) {
        throw Object.assign(
          new Error('Slot jadwal ini telah dibatalkan atau tidak tersedia lagi oleh pihak klinik/psikolog. Silakan pilih jadwal sesi lainnya.'),
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

        // Jika belum ada slot di database untuk waktu ini, buatkan slot baru
        if (!slot) {
          let targetPsiId = resolvedPsikologId
          if (!targetPsiId) {
            const firstPsi = await tx.psikolog.findFirst()
            if (!firstPsi) {
              throw Object.assign(new Error('Tidak ditemukan data psikolog/asesor untuk dialokasikan pada sesi ini'), { statusCode: 400 })
            }
            targetPsiId = firstPsi.id
          }

          const parsedJamSelesai = new Date(parsedJamMulai.getTime() + 60 * 60 * 1000)
          const isAsesmenSlot =
            (data as any).tipe_jadwal === 'ASESMEN' ||
            data.metode?.toUpperCase() === 'OFFLINE' ||
            (data.deskripsi_trauma || '').toLowerCase().includes('asesmen')

          // Cegah bentrok jadwal jika psikolog telah memiliki slot lain di jam tersebut
          const overlap = await tx.jadwalSlot.findFirst({
            where: {
              id_psikolog: targetPsiId,
              tanggal: parsedTanggal,
              jam_mulai: { lt: parsedJamSelesai },
              jam_selesai: { gt: parsedJamMulai },
              status: { in: ['SUDAH_DIBOOKING', 'TIDAK_TERSEDIA'] as any },
            },
          })

          if (overlap && !isAsesmenSlot) {
            throw Object.assign(
              new Error('Psikolog telah memiliki jadwal aktif lain pada jam tersebut. Silakan pilih waktu lain.'),
              { statusCode: 409 }
            )
          }

          slot = await tx.jadwalSlot.create({
            data: {
              id_psikolog: targetPsiId,
              tanggal: parsedTanggal,
              jam_mulai: parsedJamMulai,
              jam_selesai: parsedJamSelesai,
              metode: (data.metode || (isAsesmenSlot ? 'OFFLINE' : 'ONLINE')).toUpperCase(),
              status: 'SUDAH_DIBOOKING' as any,
              tipe_jadwal: isAsesmenSlot ? 'ASESMEN' : 'KONSULTASI',
            } as any,
            include: { psikolog: true },
          })
          isNewlyCreated = true
        }
      }

      if (!slot) {
        throw Object.assign(new Error('Slot jadwal tidak ditemukan atau belum dipilih'), { statusCode: 400 })
      }

      // Validasi ketersediaan slot & cegah duplikasi booking
      if (!isNewlyCreated) {
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

          const isSameClient =
            existingBooking.status === 'PENDING' &&
            (isSamePhone ||
             existingBooking.client?.nama?.trim().toUpperCase() === data.klien.nama.trim().toUpperCase())

          if (!isSameClient) {
            throw Object.assign(
              new Error('Slot jadwal ini sudah dibooking oleh klien lain. Silakan pilih jadwal atau waktu lain.'),
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
            new Error('Slot jadwal ini sudah dibooking oleh klien lain. Silakan pilih jadwal atau waktu lain.'),
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
      }

      // 3. Buat atau cari Klien berdasarkan nomor telepon (format standar tunggal 628...)
      const rawPhone = data.klien.no_telepon.trim()
      const standardizedPhone = normalizePhoneNumber(rawPhone) || rawPhone
      const digitsOnly = rawPhone.replace(/\D/g, '')

      let client = await tx.client.findFirst({
        where: {
          OR: [
            { no_telepon: standardizedPhone },
            { no_telepon: rawPhone },
            ...(digitsOnly.length >= 8 ? [
              { no_telepon: digitsOnly },
              { no_telepon: '0' + (standardizedPhone.startsWith('62') ? standardizedPhone.slice(2) : digitsOnly) },
            ] : []),
          ],
        },
      })

      if (!client) {
        client = await tx.client.create({
          data: {
            nama: data.klien.nama.trim(),
            no_telepon: standardizedPhone,
            usia: data.klien.usia,
            jenis_kelamin: data.klien.jenis_kelamin,
          },
        })
      } else {
        const updateData: Prisma.ClientUpdateInput = {}
        if (client.no_telepon !== standardizedPhone) {
          updateData.no_telepon = standardizedPhone
        }
        if (data.klien.nama?.trim() && !client.nama) {
          updateData.nama = data.klien.nama.trim()
        }
        if (data.klien.usia && !client.usia) updateData.usia = data.klien.usia
        if (data.klien.jenis_kelamin && !client.jenis_kelamin) updateData.jenis_kelamin = data.klien.jenis_kelamin
        if (Object.keys(updateData).length > 0) {
          await tx.client.update({
            where: { id: client.id },
            data: updateData,
          }).catch(() => {})
        }
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
      const transaksi = await tx.transaksi.create({
        data: {
          id_client: client.id,
          kode_transaksi,
          tipe_transaksi: 'KONSULTASI',
          subtotal: nominal,
          biaya_admin: 0,
          total: nominal,
          metode_pembayaran: (data.metode_pembayaran || 'QRIS').toUpperCase(),
          channel_pembayaran: data.channel_pembayaran || null,
          status_pembayaran: paymentStatus,
        } as any,
      })

      // 6. Buat BookingKonsultasi (terhubung langsung ke JadwalSlot dan Transaksi)
      const booking = await tx.bookingKonsultasi.create({
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

      return booking
    })
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

      return {
        success: true,
        message: 'Pembayaran berhasil dikonfirmasi.',
        booking: updatedBooking,
        transaksi: updatedTransaksi,
      }
    })
  }

  async updateBookingStatus(id: string, status: StatusBooking) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.bookingKonsultasi.findUnique({
        where: { id },
        include: { jadwal: true },
      })

      if (!existing) {
        throw new Error('Booking konsultasi tidak ditemukan')
      }

      const updated = await tx.bookingKonsultasi.update({
        where: { id },
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
    })
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

      // Validasi H-1 (24 jam sebelum jadwal sesi) via helper terpusat
      const { refundDeadline, isPastH1 } = calculateRefundDeadline(
        booking.jadwal.tanggal,
        booking.jadwal.jam_mulai
      )

      if (isPastH1) {
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

      // Hitung nominal refund 100%
      let refundAmount = booking.transaksi ? Number(booking.transaksi.total) : Number(booking.layanan.harga_weekday)
      if (refundAmount <= 0) refundAmount = 200000

      // 1. Update / Catat transaksi (PENTING: Jangan di-delete, hanya update status ke REFUNDED)
      let updatedTransaksi: any = booking.transaksi
      if (booking.transaksi) {
        updatedTransaksi = await tx.transaksi.update({
          where: { id: booking.transaksi.id },
          data: {
            status_pembayaran: 'REFUNDED',
            refund_at: new Date(),
            refund_reason: params.alasan,
            refund_amount: refundAmount,
          } as any,
        })
      } else {
        // Jika sesi belum memiliki record transaksi terhubung (misal walk-in manual admin), buat record transaksi REFUNDED
        updatedTransaksi = await tx.transaksi.create({
          data: {
            id_client: booking.id_client,
            tipe_transaksi: 'KONSULTASI',
            subtotal: refundAmount,
            biaya_admin: 0,
            total: refundAmount,
            metode_pembayaran: 'TRANSFER_BANK',
            status_pembayaran: 'REFUNDED',
            refund_at: new Date(),
            refund_reason: params.alasan,
            refund_amount: refundAmount,
          } as any,
        })
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
    })
  }

  async findAllBookings(params?: { id_biro?: string; status?: string }) {
    const where: Prisma.BookingKonsultasiWhereInput = {}
    if (params?.id_biro) {
      where.client = { id_biro: params.id_biro }
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
}

