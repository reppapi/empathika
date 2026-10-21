import type { PrismaClient, Prisma, StatusBooking } from '@prisma/client'
import { parseDateString } from '../../utils/date-time'
import { generateOrderId } from '../../utils'

export class AdminRepository {
  constructor(private prisma: PrismaClient) {}

  async findJadwalSlots(params?: { date?: string; layanan?: string; status?: string }) {
    const where: Prisma.JadwalSlotWhereInput = {}

    if (params?.date) {
      where.tanggal = parseDateString(params.date)
    }

    if (params?.status && params.status !== 'semua') {
      if (params.status === 'TERSEDIA' || params.status === 'SUDAH_DIBOOKING' || params.status === 'TIDAK_TERSEDIA') {
        where.status = params.status as any
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

  async findTodaySessions(date: Date) {
    return this.prisma.bookingKonsultasi.findMany({
      where: {
        jadwal: {
          tanggal: date,
        },
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
        OR: [
          {
            jam_mulai: { lte: jam_mulai },
            jam_selesai: { gt: jam_mulai },
          },
          {
            jam_mulai: { lt: jam_selesai },
            jam_selesai: { gte: jam_selesai },
          },
        ],
      },
    })
  }

  async createJadwalSlot(data: {
    id_psikolog: string
    tanggal: Date
    jam_mulai: Date
    jam_selesai: Date
    tipe_jadwal?: string
  }) {
    return this.prisma.jadwalSlot.create({
      data: {
        id_psikolog: data.id_psikolog,
        tanggal: data.tanggal,
        jam_mulai: data.jam_mulai,
        jam_selesai: data.jam_selesai,
        tipe_jadwal: data.tipe_jadwal || 'KONSULTASI',
        status: 'TERSEDIA',
      },
    })
  }

  async createAdminSesi(data: {
    id_psikolog: string
    id_layanan: string
    tanggal: Date
    jam_mulai: Date
    jam_selesai: Date
    metode: string
    deskripsi_trauma?: string
    klien: {
      nama: string
      no_telepon: string
      usia?: number
      jenis_kelamin?: string
    }
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Buat atau cari Klien berdasarkan nomor telepon
      let client = await tx.client.findFirst({
        where: { no_telepon: data.klien.no_telepon },
      })

      if (!client) {
        client = await tx.client.create({
          data: {
            nama: data.klien.nama,
            no_telepon: data.klien.no_telepon,
            usia: data.klien.usia,
            jenis_kelamin: data.klien.jenis_kelamin,
          },
        })
      }

      // 2. Buat JadwalSlot dengan status SUDAH_DIBOOKING
      const slot = await tx.jadwalSlot.create({
        data: {
          id_psikolog: data.id_psikolog,
          tanggal: data.tanggal,
          jam_mulai: data.jam_mulai,
          jam_selesai: data.jam_selesai,
          tipe_jadwal: 'KONSULTASI',
          status: 'SUDAH_DIBOOKING',
        },
      })

      // 3. Buat BookingKonsultasi langsung CONFIRMED (tanpa id_transaksi karena walk-in / admin direct)
      const kode_pesanan = `ADM-${generateOrderId()}`
      const booking = await tx.bookingKonsultasi.create({
        data: {
          kode_pesanan,
          id_client: client.id,
          id_layanan: data.id_layanan,
          id_jadwal: slot.id,
          metode: data.metode,
          deskripsi_trauma: data.deskripsi_trauma,
          status: 'CONFIRMED',
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

      // 4. Update jumlah_sesi psikolog berdasarkan penambahan booking baru
      await tx.psikolog.update({
        where: { id: data.id_psikolog },
        data: { jumlah_sesi: { increment: 1 } },
      }).catch(() => {})

      return booking
    })
  }

  async updateBookingStatus(id: string, status: StatusBooking) {
    return this.prisma.bookingKonsultasi.update({
      where: { id },
      data: { status },
      include: {
        client: true,
        layanan: true,
      },
    })
  }

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
}

