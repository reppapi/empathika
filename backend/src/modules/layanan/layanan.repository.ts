import type { PrismaClient } from '@prisma/client'

export class LayananRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(_params?: Record<string, unknown>) {
    // TODO: Implement query
    return []
  }

  async findById(_id: string) {
    // TODO: Implement query
    return null
  }

  async create(_data: unknown) {
    // TODO: Implement
    return null
  }

  async update(_id: string, _data: unknown) {
    // TODO: Implement
    return null
  }

  async delete(_id: string) {
    // TODO: Implement
    return null
  }
}
