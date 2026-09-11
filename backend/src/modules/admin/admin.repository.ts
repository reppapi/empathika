import type { PrismaClient } from '@prisma/client'

export class AdminRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(params?: Record<string, unknown>) {
    // TODO: Implement query
    return []
  }

  async findById(id: string) {
    // TODO: Implement query
    return null
  }

  async create(data: unknown) {
    // TODO: Implement
    return null
  }

  async update(id: string, data: unknown) {
    // TODO: Implement
    return null
  }

  async delete(id: string) {
    // TODO: Implement
    return null
  }
}
