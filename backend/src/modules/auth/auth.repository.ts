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
    })
  }

  async findByActivationToken(token: string) {
    return this.prisma.account.findUnique({
      where: { token_aktivasi: token },
    })
  }

  async updatePasswordAndActivate(accountId: string, hashedPassword: string) {
    return this.prisma.account.update({
      where: { id: accountId },
      data: {
        password: hashedPassword,
        aktif: true,
      },
    })
  }

  async updateActivationToken(accountId: string, token: string, expiresAt: Date) {
    return this.prisma.account.update({
      where: { id: accountId },
      data: {
        token_aktivasi: token,
        token_aktivasi_exp: expiresAt,
      },
    })
  }
}
