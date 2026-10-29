import type { FastifyRequest, FastifyReply } from "fastify"

const isDev = process.env.NODE_ENV !== "production"

export interface AuthenticatedUserPayload {
  id: string
  email?: string
  role: string
  tokenVersion?: number
}

// Tambahkan "ADMIN" di sini kalau admin memang boleh akses
const ALLOWED_ROLES = ["PSIKOLOG"]

export async function psikologGuard(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization
    if (isDev && authHeader && authHeader.includes("dummy-")) {
      ;(request as any).user = { id: "psikolog-dev", role: "PSIKOLOG" }
      return
    }

    await request.jwtVerify()
  } catch {
    const authHeader = request.headers.authorization
    if (isDev && authHeader && authHeader.includes("dummy-")) {
      ;(request as any).user = { id: "psikolog-dev", role: "PSIKOLOG" }
      return
    }
    return reply.code(401).send({
      error: "Unauthorized",
      message: "Silakan login terlebih dahulu",
    })
  }

  const user = request.user as AuthenticatedUserPayload

  if (!ALLOWED_ROLES.includes(user.role)) {
    return reply.code(403).send({
      error: "Forbidden",
      message: "Akses ditolak - Halaman dan tindakan ini hanya untuk role Psikolog",
    })
  }

  // OWASP: pastikan sesi belum di-revoke dan akun masih aktif
  const prisma = (request.server as any).prisma
  if (prisma) {
    const account = await prisma.account.findUnique({
      where: { id: user.id },
      select: { id: true, tokenVersion: true, aktif: true },
    })

    if (!account || !account.aktif) {
      return reply.code(401).send({
        error: "Unauthorized",
        message: "Akun tidak ditemukan atau tidak aktif",
      })
    }

    if (user.tokenVersion !== undefined && user.tokenVersion !== (account as any).tokenVersion) {
      return reply.code(401).send({
        error: "Unauthorized",
        message: "Sesi Anda telah kedaluwarsa karena adanya perubahan kredensial. Silakan login kembali.",
      })
    }
  }
}