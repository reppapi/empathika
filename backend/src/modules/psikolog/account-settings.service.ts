// File: backend/src/modules/psikolog/account-settings.service.ts
import type { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import { env } from "../../config/env"
import { generateSecureRandomToken, hashTokenSha256, normalizeEmail } from "../../utils/crypto-tokens"
import { accountMailService } from "../../utils/account-email-templates"
import type { EmailChangeRequestInput, ChangePasswordInput } from "./account-settings.schema"

export class AccountSettingsService {
  constructor(private prisma: PrismaClient) {}

  private maskEmail(email: string): string {
    const [name, domain] = email.split("@")
    if (!domain) return "***"
    const visibleChars = Math.min(2, Math.floor(name.length / 2))
    return `${name.slice(0, visibleChars)}***@${domain}`
  }

  /**
   * Mengambil status permintaan ganti email yang sedang pending
   */
  async getPendingEmailChange(accountId: string) {
    const pending = await this.prisma.emailChangeRequest.findFirst({
      where: {
        accountId,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    })

    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      select: { email: true },
    })

    return {
      currentEmail: account?.email || "",
      pendingRequest: pending
        ? {
            id: pending.id,
            newEmail: pending.newEmail,
            expiresAt: pending.expiresAt,
            createdAt: pending.createdAt,
          }
        : null,
    }
  }

  /**
   * Mengajukan perubahan email dengan verifikasi password
   */
  async requestEmailChange(
    accountId: string,
    input: EmailChangeRequestInput,
    context: { ip: string; userAgent?: string }
  ) {
    const targetEmail = normalizeEmail(input.newEmail)

    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    })

    if (!account || !account.password) {
      throw Object.assign(new Error("Akun tidak valid atau belum diaktivasi"), { statusCode: 400 })
    }

    // Verifikasi password saat ini
    const isPasswordValid = await bcrypt.compare(input.currentPassword, account.password)
    if (!isPasswordValid) {
      // Audit log gagal
      console.warn(`[AUDIT] Gagal re-autentikasi ganti email untuk accountId=${accountId} dari IP=${context.ip}`)
      throw Object.assign(new Error("Password saat ini salah"), { statusCode: 401 })
    }

    // Cek apakah email baru sama dengan email saat ini
    if (normalizeEmail(account.email) === targetEmail) {
      throw Object.assign(new Error("Email baru tidak boleh sama dengan email saat ini"), { statusCode: 400 })
    }

    // Cek apakah email baru sudah terdaftar di akun lain
    const existingEmail = await this.prisma.account.findUnique({
      where: { email: targetEmail },
    })
    if (existingEmail) {
      // Hindari kebocoran enumeration yang agresif atau kembalikan 409
      throw Object.assign(new Error("Email baru tidak dapat digunakan"), { statusCode: 409 })
    }

    // Buat token acak dan simpan hash-nya (TTL: 45 Menit)
    const rawToken = generateSecureRandomToken(32)
    const tokenHash = hashTokenSha256(rawToken)
    const expiresInMinutes = 45
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000)

    // Simpan dalam database & batalkan pending request sebelumnya
    await this.prisma.$transaction(async (tx) => {
      await tx.emailChangeRequest.deleteMany({
        where: { accountId, usedAt: null },
      })

      await tx.emailChangeRequest.create({
        data: {
          accountId,
          newEmail: targetEmail,
          tokenHash,
          expiresAt,
        },
      })
    })

    // URL verifikasi di frontend
    const frontendBaseUrl = (env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "")
    const verificationUrl = `${frontendBaseUrl}/verifikasi-email?token=${rawToken}`

    // Kirim email (asinkron agar tidak memblokir response)
    Promise.all([
      accountMailService.sendEmailChangeVerification({
        toNewEmail: targetEmail,
        nama: account.nama,
        verificationUrl,
        expiresInMinutes,
      }),
      accountMailService.sendEmailChangeAlertToOldEmail({
        toOldEmail: account.email,
        nama: account.nama,
        newEmailMasked: this.maskEmail(targetEmail),
      }),
    ]).catch((err) => {
      console.error("[Mailer] Gagal mengirim email ganti email:", err)
    })

    console.info(`[AUDIT] Permintaan ganti email diajukan untuk accountId=${accountId} dari IP=${context.ip}`)

    return {
      success: true,
      message: "Tautan verifikasi telah dikirim ke alamat email baru Anda. Silakan periksa kotak masuk atau spam.",
      pendingEmail: targetEmail,
      expiresAt,
    }
  }

  /**
   * Membatalkan permintaan perubahan email yang sedang pending
   */
  async cancelEmailChange(accountId: string, context: { ip: string }) {
    await this.prisma.emailChangeRequest.deleteMany({
      where: { accountId, usedAt: null },
    })

    console.info(`[AUDIT] Permintaan ganti email dibatalkan untuk accountId=${accountId} dari IP=${context.ip}`)

    return {
      success: true,
      message: "Permintaan pergantian email berhasil dibatalkan",
    }
  }

  /**
   * Memproses verifikasi token email (Endpoint Publik)
   */
  async verifyEmailChange(token: string, context: { ip: string }) {
    const tokenHash = hashTokenSha256(token)

    const requestRecord = await this.prisma.emailChangeRequest.findUnique({
      where: { tokenHash },
      include: { account: true },
    })

    if (!requestRecord) {
      throw Object.assign(new Error("Tautan verifikasi tidak valid atau sudah tidak tersedia"), { statusCode: 400 })
    }

    if (requestRecord.usedAt) {
      throw Object.assign(new Error("Tautan verifikasi ini sudah pernah digunakan"), { statusCode: 400 })
    }

    if (new Date() > requestRecord.expiresAt) {
      throw Object.assign(new Error("Tautan verifikasi telah kedaluwarsa. Silakan ajukan pergantian email ulang"), {
        statusCode: 400,
      })
    }

    const targetEmail = normalizeEmail(requestRecord.newEmail)

    // Cek ulang apakah ada akun lain yang baru saja mendaftarkan email tersebut
    const conflictAccount = await this.prisma.account.findUnique({
      where: { email: targetEmail },
    })
    if (conflictAccount && conflictAccount.id !== requestRecord.accountId) {
      throw Object.assign(new Error("Email baru sudah digunakan oleh akun lain"), { statusCode: 409 })
    }

    const oldEmail = requestRecord.account.email
    const accountNama = requestRecord.account.nama

    // Jalankan dalam atomic transaction: update email, flag usedAt, invalidate sesi (increment tokenVersion)
    await this.prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: { id: requestRecord.accountId },
        data: {
          email: targetEmail,
          tokenVersion: { increment: 1 },
        },
      })

      await tx.emailChangeRequest.update({
        where: { id: requestRecord.id },
        data: {
          usedAt: new Date(),
        },
      })

      // Hapus permintaan lain yang tersisa untuk akun ini
      await tx.emailChangeRequest.deleteMany({
        where: {
          accountId: requestRecord.accountId,
          id: { not: requestRecord.id },
        },
      })
    })

    // Kirim notifikasi ke email lama
    accountMailService
      .sendEmailChangedConfirmation({
        toOldEmail: oldEmail,
        nama: accountNama,
      })
      .catch((err) => {
        console.error("[Mailer] Gagal kirim email konfirmasi ke email lama:", err)
      })

    console.info(
      `[AUDIT] Email berhasil diverifikasi & diubah untuk accountId=${requestRecord.accountId} dari IP=${context.ip}`
    )

    return {
      success: true,
      message: "Email akun Anda berhasil diperbarui. Silakan login kembali menggunakan email baru.",
    }
  }

  /**
   * Mengganti password akun Psikolog
   */
  async changePassword(
    accountId: string,
    input: ChangePasswordInput,
    context: { ip: string; userAgent?: string }
  ) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    })

    if (!account || !account.password) {
      throw Object.assign(new Error("Akun tidak ditemukan atau belum aktif"), { statusCode: 400 })
    }

    // 1. Verifikasi password saat ini
    const isPasswordCorrect = await bcrypt.compare(input.currentPassword, account.password)
    if (!isPasswordCorrect) {
      console.warn(`[AUDIT] Gagal re-autentikasi ganti password untuk accountId=${accountId} dari IP=${context.ip}`)
      throw Object.assign(new Error("Password lama yang Anda masukkan salah"), { statusCode: 401 })
    }

    // 2. Hash password baru dengan bcrypt cost 12
    const hashedPassword = await bcrypt.hash(input.newPassword, 12)

    // 3. Update password, catat passwordChangedAt, increment tokenVersion (invalidasi semua sesi)
    await this.prisma.account.update({
      where: { id: accountId },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
        tokenVersion: { increment: 1 },
      },
    })

    // 4. Kirim email notifikasi
    accountMailService
      .sendPasswordChangedNotification({
        toEmail: account.email,
        nama: account.nama,
      })
      .catch((err) => {
        console.error("[Mailer] Gagal kirim email notifikasi password changed:", err)
      })

    console.info(`[AUDIT] Password berhasil diubah untuk accountId=${accountId} dari IP=${context.ip}`)

    return {
      success: true,
      message: "Password Anda berhasil diperbarui. Demi keamanan, Anda telah dilogout dari seluruh sesi.",
    }
  }
}
