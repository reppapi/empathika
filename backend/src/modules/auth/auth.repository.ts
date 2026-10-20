import type { PrismaClient } from "@prisma/client"

export class AuthRepository {
  constructor(private prisma: PrismaClient) {}

  async findByEmail(email: string) {
    return this.prisma.account.findUnique({
      where: { email },
    })
  }

  async findById(id: string) {
    return this.prisma.account.findUnique({
      where: { id },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        foto: true,
        aktif: true,
      },
    })
  }
}
