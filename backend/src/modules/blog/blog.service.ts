import type { FastifyInstance } from 'fastify'
import { BlogRepository } from './blog.repository'
import type { CreateBlogInput, UpdateBlogInput, BlogQueryInput } from './blog.schema'

export class BlogService {
  private repo: BlogRepository

  constructor(fastify: FastifyInstance) {
    this.repo = new BlogRepository(fastify.prisma)
  }

  async getAll(query?: BlogQueryInput) {
    return this.repo.findAll(query)
  }

  async getById(id: string) {
    const item = await this.repo.findById(id)
    if (!item) {
      throw Object.assign(new Error('Artikel blog tidak ditemukan'), { statusCode: 404 })
    }
    return item
  }

  async create(data: CreateBlogInput) {
    return this.repo.create(data)
  }

  async update(id: string, data: UpdateBlogInput) {
    const existing = await this.repo.findById(id)
    if (!existing) {
      throw Object.assign(new Error('Artikel blog tidak ditemukan'), { statusCode: 404 })
    }

    return this.repo.update(id, data)
  }

  async delete(id: string) {
    const existing = await this.repo.findById(id)
    if (!existing) {
      throw Object.assign(new Error('Artikel blog tidak ditemukan'), { statusCode: 404 })
    }
    return this.repo.delete(id)
  }
}
