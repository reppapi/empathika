import type { PrismaClient } from "@prisma/client"

export class AuthRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } })
  }
}
