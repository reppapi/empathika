import type { PrismaClient } from '@prisma/client'
import type { CreateBlogInput, UpdateBlogInput, BlogQueryInput } from './blog.schema'

export class BlogRepository {
  constructor(private prisma: PrismaClient) { }

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

  async findBySlug(slug: string) {
    return this.prisma.artikelBlog.findUnique({
      where: { slug },
    })
  }

  async findByIdOrSlug(identifier: string) {
    return this.prisma.artikelBlog.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
    })
  }

  async incrementViews(id: string) {
    return this.prisma.artikelBlog.update({
      where: { id },
      data: {
        jumlah_dilihat: { increment: 1 },
      },
    })
  }

  async create(data: { judul: string; slug: string; isi: string }) {
    return this.prisma.artikelBlog.create({
      data: {
        judul: data.judul,
        slug: data.slug,
        isi: data.isi,
      },
    })
  }

  async update(id: string, data: { judul?: string; slug?: string; isi?: string }) {
    return this.prisma.artikelBlog.update({
      where: { id },
      data: {
        ...(data.judul && { judul: data.judul }),
        ...(data.slug && { slug: data.slug }),
        ...(data.isi && { isi: data.isi }),
      },
    })
  }

  async delete(id: string) {
    return this.prisma.artikelBlog.delete({
      where: { id },
    })
  }
}
