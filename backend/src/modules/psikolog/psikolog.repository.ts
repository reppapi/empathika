import type { PrismaClient, Prisma } from '@prisma/client'

/** Select akun yang dibutuhkan FE — tidak termasuk field sensitif password */
const ACCOUNT_PUBLIC_SELECT = {
  id: true,
  nama: true,
  email: true,
  no_telepon: true,
  foto: true,
  role: true,
  aktif: true,
  token_aktivasi: true,
  token_aktivasi_exp: true,
} satisfies Prisma.AccountSelect

const JADWAL_SLOT_LIST_INCLUDE = {
  where: {
    status: 'TERSEDIA' as const,
    tipe_jadwal: 'KONSULTASI' as const,
    NOT: { id: { startsWith: 'slot-' } },
  },
  orderBy: [{ tanggal: 'asc' as const }, { jam_mulai: 'asc' as const }],
  take: 2,
}

const JADWAL_SLOT_DETAIL_INCLUDE = {
  ...JADWAL_SLOT_LIST_INCLUDE,
  take: 10,
}

const BOOKING_COUNT_SELECT = {
  select: {
    jadwal_slot: {
      where: { booking_konsultasi: { isNot: null } },
    },
  },
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export class PsikologRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(params?: { kategori?: string; search?: string; status?: string }) {
    const where: Prisma.PsikologWhereInput = {}

    if (params?.status) {
      const s = params.status.toUpperCase()
      if (s === 'ACTIVE' || s === 'INACTIVE') {
        where.status = s as Prisma.EnumStatusPsikologFilter
      }
    } else {
      where.status = 'ACTIVE'
    }

    if (params?.kategori) {
      where.kategori = params.kategori
    }

    if (params?.search) {
      where.OR = [
        { nama_gelar: { contains: params.search, mode: 'insensitive' } },
        { keahlian: { contains: params.search, mode: 'insensitive' } },
      ]
    }

    return this.prisma.psikolog.findMany({
      where,
      include: {
        spesialisasi: true,
        account: { select: ACCOUNT_PUBLIC_SELECT },
        jadwal_slot: JADWAL_SLOT_LIST_INCLUDE,
        _count: BOOKING_COUNT_SELECT,
      },
      orderBy: { nama_gelar: 'asc' },
    })
  }

  async findById(id: string) {
    const isUuid = UUID_REGEX.test(id)
    const detailInclude: Prisma.PsikologInclude = {
      spesialisasi: true,
      account: { select: ACCOUNT_PUBLIC_SELECT },
      jadwal_slot: JADWAL_SLOT_DETAIL_INCLUDE,
      _count: BOOKING_COUNT_SELECT,
    }

    if (isUuid) {
      const found = await this.prisma.psikolog.findFirst({
        where: { OR: [{ id }, { id_account: id }] },
        include: detailInclude,
      })
      if (found) return found
    }

    try {
      const byId = await this.prisma.psikolog.findUnique({
        where: { id },
        include: detailInclude,
      })
      if (byId) return byId
    } catch {}

    const cleanSearch = decodeURIComponent(id).replace(/-/g, ' ').trim()
    return this.prisma.psikolog.findFirst({
      where: {
        OR: [
          { nama_gelar: { contains: cleanSearch, mode: 'insensitive' } },
          { account: { nama: { contains: cleanSearch, mode: 'insensitive' } } },
          { account: { email: { equals: cleanSearch, mode: 'insensitive' } } },
          { id_account: id },
        ],
      },
      include: detailInclude,
    })
  }

  async findByAccountId(id_account: string) {
    return this.prisma.psikolog.findUnique({
      where: { id_account },
      include: {
        spesialisasi: true,
        account: true,
      },
    })
  }

  async create(data: Prisma.PsikologCreateInput) {
    return this.prisma.psikolog.create({
      data,
      include: {
        spesialisasi: true,
        account: true,
      },
    })
  }

  async update(id: string, data: Prisma.PsikologUpdateInput) {
    return this.prisma.psikolog.update({
      where: { id },
      data,
      include: {
        spesialisasi: true,
        account: true,
      },
    })
  }

  async delete(id: string) {
    return this.prisma.psikolog.delete({
      where: { id },
    })
  }
}
