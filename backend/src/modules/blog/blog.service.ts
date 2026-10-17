import type { FastifyInstance } from 'fastify'
import { BlogRepository } from './blog.repository'
import type { CreateBlogInput, UpdateBlogInput, BlogQueryInput } from './blog.schema'

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export class BlogService {
  private repo: BlogRepository

  constructor(fastify: FastifyInstance) {
    this.repo = new BlogRepository(fastify.prisma)
  }

  async getAll(query?: BlogQueryInput) {
    return this.repo.findAll(query)
  }

  async getByIdOrSlug(identifier: string) {
    const item = await this.repo.findByIdOrSlug(identifier)
    if (!item) {
      throw Object.assign(new Error('Artikel blog tidak ditemukan'), { statusCode: 404 })
    }

    // Naikkan view counter secara background
    this.repo.incrementViews(item.id).catch(() => {})

    return item
  }

  async create(data: CreateBlogInput) {
    let slug = data.slug?.trim() ? generateSlug(data.slug) : generateSlug(data.judul)

    // Cek apakah slug sudah ada, jika ada tambahkan random suffix
    const existing = await this.repo.findBySlug(slug)
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`
    }

    return this.repo.create({
      judul: data.judul,
      isi: data.isi,
      slug,
    })
  }

  async update(id: string, data: UpdateBlogInput) {
    const existing = await this.repo.findById(id)
    if (!existing) {
      throw Object.assign(new Error('Artikel blog tidak ditemukan'), { statusCode: 404 })
    }

    let slug = data.slug
    if (slug) {
      slug = generateSlug(slug)
      const duplicate = await this.repo.findBySlug(slug)
      if (duplicate && duplicate.id !== id) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`
      }
    }

    return this.repo.update(id, {
      ...(data.judul && { judul: data.judul }),
      ...(data.isi && { isi: data.isi }),
      ...(slug && { slug }),
    })
  }

  async delete(id: string) {
    const existing = await this.repo.findById(id)
    if (!existing) {
      throw Object.assign(new Error('Artikel blog tidak ditemukan'), { statusCode: 404 })
    }
    return this.repo.delete(id)
  }
}
