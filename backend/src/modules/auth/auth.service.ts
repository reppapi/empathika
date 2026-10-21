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

    if (!account.password) {
      throw Object.assign(
        new Error("Akun Anda belum diaktifkan. Silakan periksa tautan aktivasi di WhatsApp Anda."),
        { statusCode: 403 }
      )
    }

    if (!account.aktif) {
      throw Object.assign(
        new Error("Akun Anda telah dinonaktifkan atau belum aktif. Silakan hubungi admin."),
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

  async setPassword(token: string, newPassword: string) {
    const account = await this.repo.findByActivationToken(token)
    if (!account) {
      throw Object.assign(new Error("Tautan aktivasi tidak valid"), { statusCode: 404 })
    }

    if (account.token_aktivasi_exp && new Date() > new Date(account.token_aktivasi_exp)) {
      throw Object.assign(new Error("Tautan aktivasi telah kedaluwarsa"), { statusCode: 400 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await this.repo.updatePasswordAndActivate(account.id, hashedPassword)

    return {
      success: true,
      message: "Kata sandi berhasil dibuat dan akun telah aktif. Silakan masuk.",
      user: {
        id: account.id,
        nama: account.nama,
        email: account.email,
        role: account.role,
      },
    }
  }

  async resendActivation(accountId: string) {
    const account = await this.repo.findById(accountId)
    if (!account) {
      throw Object.assign(new Error("Akun tidak ditemukan"), { statusCode: 404 })
    }

    const crypto = await import("crypto")
    const newToken = crypto.randomBytes(24).toString("hex")
    const newExpiry = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)

    await this.repo.updateActivationToken(account.id, newToken, newExpiry)

    const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:3000"
    const activationUrl = `${frontendBaseUrl}/set-password?token=${newToken}`

    return {
      success: true,
      message: "Tautan aktivasi baru berhasil dibuat",
      token: newToken,
      tokenExpiredAt: newExpiry.toISOString(),
      activationUrl,
      account: {
        id: account.id,
        nama: account.nama,
        email: account.email,
        no_telepon: account.no_telepon,
        role: account.role,
      },
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
