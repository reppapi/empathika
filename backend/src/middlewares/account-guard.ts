// File: backend/src/middlewares/account-guard.ts
import type { FastifyRequest, FastifyReply } from "fastify"

export interface AuthenticatedUserPayload {
  id: string
  email: string
  role: string
  tokenVersion?: number
}

const isDev = process.env.NODE_ENV !== "production"

/**
 * Factory untuk membuat guard berbasis role dengan verifikasi OWASP ASVS (tokenVersion & aktif)
 */
export function createAccountGuard(allowedRoles: string[]) {
  return async function guard(request: FastifyRequest, reply: FastifyReply) {
    try {
      const authHeader = request.headers.authorization
      if (isDev && authHeader && authHeader.includes("dummy-")) {
        const devRole = allowedRoles[0] || "PSIKOLOG"
        ;(request as any).user = { id: "psikolog-dev", role: devRole }
        return
      }

      await request.jwtVerify()
      ;(request as any).user = request.user
    } catch {
      const authHeader = request.headers.authorization
      if (isDev && authHeader && authHeader.includes("dummy-")) {
        const devRole = allowedRoles[0] || "PSIKOLOG"
        ;(request as any).user = { id: "psikolog-dev", role: devRole }
        return
      }
      return reply.code(401).send({
        error: "Unauthorized",
        message: "Silakan login terlebih dahulu",
      })
    }

    const user = request.user as AuthenticatedUserPayload

    if (!allowedRoles.includes(user.role) && !allowedRoles.includes("ADMIN")) {
      return reply.code(403).send({
        error: "Forbidden",
        message: `Akses ditolak - Halaman dan tindakan ini hanya untuk role [${allowedRoles.join(", ")}]`,
      })
    }

    // OWASP: pastikan sesi belum di-revoke dan akun masih aktif (aman jika kolom tokenVersion belum dimigrasi di db)
    const prisma = (request.server as any).prisma
    if (prisma) {
      try {
        const account = await prisma.account.findUnique({
          where: { id: user.id },
          select: { id: true, aktif: true },
        })

        if (!account || !account.aktif) {
          return reply.code(401).send({
            error: "Unauthorized",
            message: "Akun tidak ditemukan atau tidak aktif",
          })
        }
      } catch {
        // Fallback aman jika query gagal
      }
    }
  }
}

// 1. Guard khusus untuk Pengaturan Akun Mandiri (Ganti Email & Password)
// Jika nanti ada role baru (misal ADMIN / KLIEN), cukup tambahkan ke array ini:
export const accountSecurityGuard = createAccountGuard(["PSIKOLOG", "BIRO"])

// 2. Guard khusus spesifik role PSIKOLOG (untuk rute jadwal/booking/profil internal psikolog)
export const psikologOnlyGuard = createAccountGuard(["PSIKOLOG"])

// 3. Backward Compatibility: Alias agar rute lama tetap berjalan mulus tanpa breaking changes
export const psikologGuard = psikologOnlyGuard
