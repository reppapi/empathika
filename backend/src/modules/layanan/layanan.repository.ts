import type { Prisma, PrismaClient } from '@prisma/client'

export class LayananRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(params?: {
    kategori?: string
    aktif?: boolean
    search?: string
  }) {
    const where: Prisma.LayananWhereInput = {}

    if (params?.kategori) {
      where.kategori = params.kategori as any
    }

    if (params?.aktif !== undefined) {
      where.aktif = params.aktif
    }

    if (params?.search) {
      where.nama = {
        contains: params.search,
        mode: 'insensitive',
      }
    }

    return this.prisma.layanan.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    })
  }

  async findById(id: string) {
    return this.prisma.layanan.findUnique({
      where: { id },
    })
  }

  async findByNama(nama: string) {
    return this.prisma.layanan.findFirst({
      where: {
        nama: {
          equals: nama.trim(),
          mode: 'insensitive',
        },
      },
    })
  }

  async create(data: Prisma.LayananCreateInput) {
    return this.prisma.layanan.create({
      data,
    })
  }

  async update(id: string, data: Prisma.LayananUpdateInput) {
    return this.prisma.layanan.update({
      where: { id },
      data,
    })
  }

  async delete(id: string) {
    return this.prisma.layanan.delete({
      where: { id },
    })
  }
}
