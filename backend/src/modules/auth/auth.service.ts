import type { FastifyInstance } from "fastify"
import bcrypt from "bcrypt"
import { AuthRepository } from "./auth.repository"
import type { LoginInput } from "./auth.schema"

export class AuthService {
  private repo: AuthRepository

  constructor(private fastify: FastifyInstance) {
    this.repo = new AuthRepository(fastify.prisma)
  }

  async login(input: LoginInput) {
    const account = await this.repo.findByEmail(input.email)
    if (!account) {
      throw Object.assign(new Error("Email atau password yang Anda masukkan salah"), {
        statusCode: 401,
      })
    }

    if (!account.aktif) {
      throw Object.assign(
        new Error("Akun Anda telah dinonaktifkan. Silakan hubungi admin."),
        { statusCode: 403 }
      )
    }

    // Bandingkan password (support bcrypt hash atau plain text jika baru seed)
    let isPasswordValid = false
    try {
      isPasswordValid = await bcrypt.compare(input.password, account.password)
    } catch {
      isPasswordValid = false
    }

    // Fallback jika database belum di-hash (misal seed awal)
    if (!isPasswordValid && account.password === input.password) {
      isPasswordValid = true
    }

    if (!isPasswordValid) {
      throw Object.assign(new Error("Email atau password yang Anda masukkan salah"), {
        statusCode: 401,
      })
    }

    // Generate JWT access token
    const token = this.fastify.jwt.sign(
      {
        id: account.id,
        email: account.email,
        role: account.role,
        nama: account.nama,
      },
      { expiresIn: "1d" }
    )

    return {
      user: {
        id: account.id,
        nama: account.nama,
        email: account.email,
        role: account.role,
      },
      accessToken: token,
    }
  }

  async getProfile(userId: string) {
    const user = await this.repo.findById(userId)
    if (!user) {
      throw Object.assign(new Error("User tidak ditemukan"), { statusCode: 404 })
    }
    return {
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
      },
    }
  }
}
