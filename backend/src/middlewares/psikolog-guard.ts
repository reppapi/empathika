// File: backend/src/middlewares/psikolog-guard.ts
import type { FastifyRequest, FastifyReply } from "fastify"

export interface AuthenticatedUserPayload {
  id: string
  email: string
  role: string
  tokenVersion?: number
}

export async function psikologGuard(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
    const user = request.user as AuthenticatedUserPayload

    if (user.role !== "PSIKOLOG") {
      return reply.code(403).send({
        error: "Forbidden",
        message: "Akses ditolak - Halaman dan tindakan ini hanya untuk role Psikolog",
      })
    }

    // OWASP: Verifikasi tokenVersion untuk memastikan sesi belum di-revoke
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
  } catch (err) {
    return reply.code(401).send({
      error: "Unauthorized",
      message: "Silakan login terlebih dahulu",
    })
  }
}
