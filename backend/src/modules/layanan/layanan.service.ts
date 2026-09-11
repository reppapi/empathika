import type { FastifyInstance } from 'fastify'
import { LayananRepository } from './layanan.repository'

export class LayananService {
  private repo: LayananRepository

  constructor(fastify: FastifyInstance) {
    this.repo = new LayananRepository(fastify.prisma)
  }

  async getAll(params?: Record<string, unknown>) {
    return this.repo.findAll(params)
  }

  async getById(id: string) {
    const item = await this.repo.findById(id)
    if (!item) throw new Error('Layanan tidak ditemukan')
    return item
  }

  async create(data: unknown) {
    return this.repo.create(data)
  }

  async update(id: string, data: unknown) {
    return this.repo.update(id, data)
  }

  async delete(id: string) {
    return this.repo.delete(id)
  }
}
