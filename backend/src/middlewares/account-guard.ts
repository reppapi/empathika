// File: backend/src/middlewares/account-guard.ts
import type { FastifyRequest, FastifyReply } from "fastify"

export interface AuthenticatedUserPayload {
  id: string
  email: string
  role: string
  tokenVersion?: number
}

/**
 * Factory untuk membuat guard berbasis role dengan verifikasi OWASP ASVS (tokenVersion & aktif)
 */
export function createAccountGuard(allowedRoles: string[]) {
  return async function guard(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify()
    } catch {
      return reply.code(401).send({
        error: "Unauthorized",
        message: "Silakan login terlebih dahulu",
      })
    }

    const user = request.user as AuthenticatedUserPayload

    if (!allowedRoles.includes(user.role)) {
      return reply.code(403).send({
        error: "Forbidden",
        message: `Akses ditolak - Halaman dan tindakan ini hanya untuk role [${allowedRoles.join(", ")}]`,
      })
    }

    // OWASP: pastikan sesi belum di-revoke dan akun masih aktif
    const account = await request.server.prisma.account.findUnique({
      where: { id: user.id },
      select: { id: true, tokenVersion: true, aktif: true },
    })

    if (!account || !account.aktif) {
      return reply.code(401).send({
        error: "Unauthorized",
        message: "Akun tidak ditemukan atau tidak aktif",
      })
    }

    if (user.tokenVersion !== undefined && user.tokenVersion !== account.tokenVersion) {
      return reply.code(401).send({
        error: "Unauthorized",
        message: "Sesi Anda telah kedaluwarsa karena adanya perubahan kredensial. Silakan login kembali.",
      })
    }
  }
}

// 1. Guard khusus untuk Pengaturan Akun Mandiri (Ganti Email & Password)
// Jika nanti ada role baru (misal KLIEN), cukup tambahkan ke array ini:
export const accountSecurityGuard = createAccountGuard(["PSIKOLOG", "BIRO", "ADMIN"])

// 2. Guard khusus spesifik role PSIKOLOG (untuk rute jadwal/booking/profil internal psikolog)
export const psikologOnlyGuard = createAccountGuard(["PSIKOLOG"])

// 3. Backward Compatibility: Alias agar rute lama tetap berjalan mulus tanpa breaking changes
export const psikologGuard = psikologOnlyGuard
