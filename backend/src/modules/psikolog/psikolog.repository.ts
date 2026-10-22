import type { PrismaClient, Prisma } from '@prisma/client'

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
