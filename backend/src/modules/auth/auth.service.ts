import bcrypt from "bcrypt"
import type { FastifyInstance } from "fastify"
import { AuthRepository } from "./auth.repository"
import type { LoginInput, RegisterInput } from "./auth.schema"

export class AuthService {
  private repo: AuthRepository

  constructor(private fastify: FastifyInstance) {
    this.repo = new AuthRepository(fastify.prisma)
  }

  async login(input: LoginInput) {
    const user = await this.repo.findByEmail(input.email)
    if (!user) throw this.fastify.httpErrors?.unauthorized("Email atau password salah")

    const valid = await bcrypt.compare(input.password, user.passwordHash)
    if (!valid) throw this.fastify.httpErrors?.unauthorized("Email atau password salah")

    const accessToken = this.fastify.jwt.sign({ id: user.id, role: user.role })

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken,
    }
  }

  async register(input: RegisterInput) {
    const existing = await this.repo.findByEmail(input.email)
    if (existing) throw this.fastify.httpErrors?.conflict("Email sudah terdaftar")

    const passwordHash = await bcrypt.hash(input.password, 12)
    const user = await this.repo.create({ ...input, passwordHash })

    const accessToken = this.fastify.jwt.sign({ id: user.id, role: user.role })

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken,
    }
  }
}

