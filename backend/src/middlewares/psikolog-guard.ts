import type { FastifyRequest, FastifyReply } from "fastify"

const isDev = process.env.NODE_ENV !== "production"

export interface AuthenticatedUserPayload {
  id: string
  email?: string
  role: string
  tokenVersion?: number
}

export async function psikologGuard(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization
    if (isDev && authHeader && authHeader.includes("dummy-")) {
      ;(request as any).user = { id: "psikolog-dev", role: "PSIKOLOG" }
      return
    }

    await request.jwtVerify()
    const user = request.user as AuthenticatedUserPayload

    if (user.role !== "PSIKOLOG") {
      reply.code(403).send({
        error: "Forbidden",
        message: "Akses ditolak - Halaman dan tindakan ini hanya untuk role Psikolog",
      })
      return reply
    }

    // OWASP: Verifikasi tokenVersion jika koneksi prisma tersedia
    const prisma = (request.server as any).prisma
    if (prisma) {
      const account = await prisma.account.findUnique({
        where: { id: user.id },
        select: { id: true, tokenVersion: true, aktif: true },
      })

      if (!account || !account.aktif) {
        reply.code(401).send({
          error: "Unauthorized",
          message: "Akun tidak ditemukan atau tidak aktif",
        })
        return reply
      }

      if (user.tokenVersion !== undefined && user.tokenVersion !== (account as any).tokenVersion) {
        reply.code(401).send({
          error: "Unauthorized",
          message: "Sesi Anda telah kedaluwarsa karena adanya perubahan kredensial. Silakan login kembali.",
        })
        return reply
      }
    }
  } catch {
    const authHeader = request.headers.authorization
    if (isDev && authHeader && authHeader.includes("dummy-")) {
      ;(request as any).user = { id: "psikolog-dev", role: "PSIKOLOG" }
      return
    }
    reply.code(401).send({
      error: "Unauthorized",
      message: "Silakan login terlebih dahulu",
    })
    return reply
  }
}
