import type { PrismaClient } from '@prisma/client'
import type { CreateBlogInput, UpdateBlogInput, BlogQueryInput } from './blog.schema'

export class BlogRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(query?: BlogQueryInput) {
    const page = query?.page ?? 1
    const limit = query?.limit ?? 10
    const skip = (page - 1) * limit

    const where = query?.search
      ? {
          OR: [
            { judul: { contains: query.search, mode: 'insensitive' as const } },
            { isi: { contains: query.search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [items, total] = await Promise.all([
      this.prisma.artikelBlog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { tanggal_terbit: 'desc' },
      }),
      this.prisma.artikelBlog.count({ where }),
    ])

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findById(id: string) {
    return this.prisma.artikelBlog.findUnique({
      where: { id },
    })
  }

  async create(data: CreateBlogInput) {
    return this.prisma.artikelBlog.create({
      data: {
        judul: data.judul,
        isi: data.isi,
        banner_url: data.banner_url ?? null,
        ...(data.tanggal_terbit ? { tanggal_terbit: new Date(data.tanggal_terbit) } : {}),
      },
    })
  }

  async update(id: string, data: UpdateBlogInput) {
    return this.prisma.artikelBlog.update({
      where: { id },
      data: {
        ...(data.judul !== undefined && { judul: data.judul }),
        ...(data.isi !== undefined && { isi: data.isi }),
        ...(data.banner_url !== undefined && { banner_url: data.banner_url }),
        ...(data.tanggal_terbit !== undefined && {
          tanggal_terbit: new Date(data.tanggal_terbit),
        }),
      },
    })
  }

  async delete(id: string) {
    return this.prisma.artikelBlog.delete({
      where: { id },
    })
  }
}
