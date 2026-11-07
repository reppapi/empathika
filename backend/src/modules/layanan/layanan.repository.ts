import type { PrismaClient, Prisma, KategoriLayanan } from '@prisma/client'

export class LayananRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(params?: { kategori?: string; aktif?: boolean; search?: string }) {
    const where: Prisma.LayananWhereInput = {}

    if (params?.kategori && params.kategori !== 'semua') {
      where.kategori = params.kategori as KategoriLayanan
    }

    if (params?.aktif !== undefined) {
      where.aktif = params.aktif
    }

    if (params?.search) {
      where.OR = [
        { nama: { contains: params.search, mode: 'insensitive' } },
        { deskripsi: { contains: params.search, mode: 'insensitive' } },
      ]
    }

    return this.prisma.layanan.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        _count: {
          select: { booking_konsultasi: true },
        },
      },
    })
  }

  async findById(id: string) {
    return this.prisma.layanan.findUnique({
      where: { id },
      include: {
        _count: {
          select: { booking_konsultasi: true },
        },
      },
    })
  }

  async findByNama(nama: string) {
    return this.prisma.layanan.findFirst({
      where: {
        nama: { equals: nama.trim(), mode: 'insensitive' },
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
