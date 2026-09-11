import type { FastifyInstance } from 'fastify'
import { EventRepository } from './event.repository'

export class EventService {
  private repo: EventRepository

  constructor(fastify: FastifyInstance) {
    this.repo = new EventRepository(fastify.prisma)
  }

  async getAll(params?: Record<string, unknown>) {
    return this.repo.findAll(params)
  }

  async getById(id: string) {
    const item = await this.repo.findById(id)
    if (!item) throw new Error('Event tidak ditemukan')
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
