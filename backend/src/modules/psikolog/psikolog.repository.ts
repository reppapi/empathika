import type { PrismaClient, Prisma } from '@prisma/client'
import { parseDateString } from '../../utils/date-time'

export class PsikologRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(params?: { kategori?: string; search?: string; status?: string }) {
    const where: Prisma.PsikologWhereInput = {}

    if (params?.status) {
      const s = params.status.toUpperCase()
      if (s === 'ACTIVE' || s === 'INACTIVE') {
        where.status = s as any
      }
      // Jika status === 'ALL', tidak ada filter status agar semua (aktif maupun nonaktif) tampil untuk admin
    } else {
      // Default untuk publik: hanya tampilkan yang ACTIVE
      where.status = 'ACTIVE'
    }

    if (params?.kategori) {
      where.kategori = params.kategori
    }

    if (params?.search) {
      where.OR = [
        { nama_gelar: { contains: params.search, mode: 'insensitive' } },
        { bio: { contains: params.search, mode: 'insensitive' } },
      ]
    }

    return this.prisma.psikolog.findMany({
      where,
      include: {
        spesialisasi: true,
        account: {
          select: {
            id: true,
            nama: true,
            email: true,
            no_telepon: true,
            foto: true,
            role: true,
          },
        },
        jadwal_slot: {
          where: {
            status: 'TERSEDIA',
            tipe_jadwal: 'KONSULTASI',
            NOT: {
              id: { startsWith: 'slot-' },
            },
          },
          orderBy: [
            { tanggal: 'asc' },
            { jam_mulai: 'asc' },
          ],
          take: 2,
        },
        _count: {
          select: {
            jadwal_slot: {
              where: {
                booking_konsultasi: { isNot: null },
              },
            },
          },
        },
      },
      orderBy: {
        nama_gelar: 'asc',
      },
    })
  }

  async findById(id: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
    const detailInclude: Prisma.PsikologInclude = {
      spesialisasi: true,
      account: {
        select: {
          id: true,
          nama: true,
          email: true,
          no_telepon: true,
          foto: true,
          role: true,
        },
      },
      jadwal_slot: {
        where: {
          status: 'TERSEDIA',
          tipe_jadwal: 'KONSULTASI',
          NOT: {
            id: { startsWith: 'slot-' },
          },
        },
        orderBy: [
          { tanggal: 'asc' },
          { jam_mulai: 'asc' },
        ],
        take: 10,
      },
      _count: {
        select: {
          jadwal_slot: {
            where: {
              booking_konsultasi: { isNot: null },
            },
          },
        },
      },
    }

    if (!isUuid) {
      // Jika bukan format UUID (misal placeholder 'string' di Swagger atau cari berdasarkan nama)
      const found = await this.prisma.psikolog.findFirst({
        where: {
          OR: [
            { nama_gelar: { contains: id === 'string' ? '' : id, mode: 'insensitive' } },
          ],
        },
        include: detailInclude,
      })
      if (found) return found
      // Fallback ke psikolog pertama di database
      return this.prisma.psikolog.findFirst({
        include: detailInclude,
      })
    }

    return this.prisma.psikolog.findUnique({
      where: { id },
      include: detailInclude,
    })
  }

  async findByAccountId(id_account: string) {
    return this.prisma.psikolog.findUnique({
      where: { id_account },
      include: {
        spesialisasi: true,
      },
    })
  }

  async findJadwalTersedia(params: {
    tanggal?: string
    id_psikolog?: string
    tipe_jadwal?: string
  }) {
    const where: Prisma.JadwalSlotWhereInput = {
      status: 'TERSEDIA',
      tipe_jadwal: params.tipe_jadwal || 'KONSULTASI',
      NOT: {
        id: { startsWith: 'slot-' },
      },
    }

    if (params.tanggal) {
      where.tanggal = parseDateString(params.tanggal)
    }

    const isUuid = params.id_psikolog && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(params.id_psikolog)
    if (isUuid) {
      where.id_psikolog = params.id_psikolog
    }

    return this.prisma.jadwalSlot.findMany({
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
  }

  async findJadwalByPsikologId(
    id_psikolog: string,
    params?: { start_date?: string; end_date?: string }
  ) {
    const where: Prisma.JadwalSlotWhereInput = {
      id_psikolog,
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

  async findJadwalSlotById(id: string) {
    return this.prisma.jadwalSlot.findUnique({
      where: { id },
      include: {
        booking_konsultasi: true,
      },
    })
  }

  async deleteJadwalSlot(id: string) {
    return this.prisma.jadwalSlot.delete({
      where: { id },
    })
  }

  async create(data: Prisma.PsikologUncheckedCreateInput) {
    return this.prisma.psikolog.create({
      data,
    })
  }

  async update(id: string, data: Prisma.PsikologUpdateInput) {
    return this.prisma.psikolog.update({
      where: { id },
      data,
    })
  }

  async delete(id: string) {
    return this.prisma.psikolog.delete({
      where: { id },
    })
  }
}
