import type { FastifyInstance } from "fastify"
import bcrypt from "bcrypt"
import { OAuth2Client } from "google-auth-library"
import { env } from "../../config/env"
import { AuthRepository } from "./auth.repository"
import type { LoginInput } from "./auth.schema"

function formatRemainingTime(ms: number): string {
  if (ms <= 0) return "0 detik"
  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  const parts: string[] = []
  if (days > 0) parts.push(`${days} hari`)
  if (hours > 0) parts.push(`${hours} jam`)
  if (minutes > 0 && days === 0) parts.push(`${minutes} menit`)
  if (parts.length === 0) return "kurang dari 1 menit"
  return parts.join(" ")
}

export class AuthService {
  private repo: AuthRepository

  constructor(private fastify: FastifyInstance) {
    this.repo = new AuthRepository(fastify.prisma)
  }

  async loginWithGoogle(credential: string, rememberMe?: boolean) {
    if (!credential || typeof credential !== "string") {
      throw Object.assign(new Error("Token credential Google tidak valid"), {
        statusCode: 400,
      })
    }

    let email: string | undefined

    // Mode development / testing support mock token
    const isMock =
      process.env.NODE_ENV !== "production" && credential.startsWith("mock-google-token:")

    if (isMock) {
      email = credential.replace("mock-google-token:", "").trim().toLowerCase()
    } else {
      const clientId = env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID
      try {
        const client = new OAuth2Client(clientId)
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: clientId ? [clientId] : undefined,
        })
        const payload = ticket.getPayload()
        if (!payload || !payload.email) {
          throw new Error("Token Google tidak berisi email yang valid")
        }
        email = payload.email.toLowerCase()
      } catch (err: any) {
        throw Object.assign(
          new Error("Token Google tidak valid atau telah kedaluwarsa"),
          { statusCode: 401 }
        )
      }
    }

    if (!email) {
      throw Object.assign(
        new Error("Token Google tidak valid atau tidak berisi email"),
        { statusCode: 401 }
      )
    }

    // 1. Cek keberadaan akun di database (Hanya untuk akun yang sudah terdaftar)
    const account = await this.repo.findByEmail(email)
    if (!account) {
      throw Object.assign(
        new Error("Email Google belum terdaftar di Empathika. Silakan hubungi admin."),
        { statusCode: 401 }
      )
    }

    // 2. Cek apakah akun belum diaktivasi (Tolak dengan HTTP 403)
    if (!account.aktif || !account.password) {
      throw Object.assign(
        new Error("Akun Anda belum diaktivasi. Silakan lakukan aktivasi terlebih dahulu melalui tautan aktivasi yang telah dikirimkan oleh admin."),
        { statusCode: 403 }
      )
    }

    // 3. Akun aktif -> Terbitkan JWT resmi Empathika
    const expiresIn = rememberMe ? "7d" : "1d"
    const token = this.fastify.jwt.sign(
      {
        id: account.id,
        email: account.email,
        role: account.role,
        nama: account.nama,
      },
      { expiresIn }
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

    let isPasswordValid = false
    try {
      isPasswordValid = await bcrypt.compare(input.password, account.password)
    } catch {
      isPasswordValid = false
    }

    if (!isPasswordValid && account.password === input.password) {
      isPasswordValid = true
    }

    if (!isPasswordValid) {
      throw Object.assign(new Error("Email atau password yang Anda masukkan salah"), {
        statusCode: 401,
      })
    }

    const expiresIn = input.rememberMe ? "7d" : "1d"
    const token = this.fastify.jwt.sign(
      {
        id: account.id,
        email: account.email,
        role: account.role,
        nama: account.nama,
      },
      { expiresIn }
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

    // 1. Validasi jika akun sudah aktif (password sudah diset)
    if (account.aktif && account.password) {
      throw Object.assign(
        new Error("Akun sudah aktif. Generate ulang link aktivasi tidak diperlukan lagi."),
        {
          statusCode: 400,
          errorCode: "ACCOUNT_ALREADY_ACTIVE",
        }
      )
    }

    // 2. Validasi masa berlaku link aktivasi: tolak jika masih dalam masa 3 hari
    const now = Date.now()
    if (account.token_aktivasi && account.token_aktivasi_exp) {
      const expTime = new Date(account.token_aktivasi_exp).getTime()
      if (expTime > now) {
        const remainingMs = expTime - now
        const remainingStr = formatRemainingTime(remainingMs)
        const expDateFormatted = new Date(account.token_aktivasi_exp).toLocaleString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })

        throw Object.assign(
          new Error(
            `Link aktivasi masih berlaku. Generate ulang baru bisa dilakukan setelah ${expDateFormatted} (tersisa ${remainingStr}).`
          ),
          {
            statusCode: 429,
            errorCode: "LINK_STILL_ACTIVE",
            tokenExpiredAt: account.token_aktivasi_exp,
            remainingSeconds: Math.ceil(remainingMs / 1000),
            remainingFormatted: remainingStr,
          }
        )
      }
    }

    // 3. Buat token baru masa aktif 3 hari
    const crypto = await import("crypto")
    const newToken = `act_${crypto.randomBytes(20).toString("hex")}`
    const newExpiry = new Date(now + 3 * 24 * 60 * 60 * 1000)

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
        aktif: account.aktif,
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
