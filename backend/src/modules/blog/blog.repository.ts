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

  async findByIdOrSlug(identifier: string) {
    return this.findById(identifier)
  }

  async incrementViews(_id: string) {
    // Di skema revisi, jumlah_dilihat ditiadakan dari database
    return null
  }

  async create(data: { judul: string; isi: string; banner_url?: string | null }) {
    return this.prisma.artikelBlog.create({
      data: {
        judul: data.judul,
        isi: data.isi,
        ...(data.banner_url && { banner_url: data.banner_url }),
      },
    })
  }

  async update(id: string, data: { judul?: string; isi?: string; banner_url?: string | null }) {
    return this.prisma.artikelBlog.update({
      where: { id },
      data: {
        ...(data.judul && { judul: data.judul }),
        ...(data.isi && { isi: data.isi }),
        ...(data.banner_url !== undefined && { banner_url: data.banner_url }),
      },
    })
  }

  async delete(id: string) {
    return this.prisma.artikelBlog.delete({
      where: { id },
    })
  }
}
