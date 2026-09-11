import type { PrismaClient } from "@prisma/client"
import type { RegisterInput } from "./auth.schema"

export class AuthRepository {
  constructor(private prisma: PrismaClient) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } })
  }

  async create(data: RegisterInput & { passwordHash: string }) {
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        role: "CLIENT",
      },
    })
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } })
  }
}

