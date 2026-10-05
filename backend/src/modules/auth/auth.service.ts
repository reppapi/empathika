import type { FastifyInstance } from "fastify"
import { AuthRepository } from "./auth.repository"

export class AuthService {
  private repo: AuthRepository

  constructor(private fastify: FastifyInstance) {
    this.repo = new AuthRepository(fastify.prisma)
  }

  async getProfile(userId: string) {
    const user = await this.repo.findById(userId)
    if (!user) throw (this.fastify as any).httpErrors.notFound("User tidak ditemukan")
    return {
      user: { id: user.id, nama: user.nama, role: user.role },
    }
  }
}
