import type { FastifyRequest, FastifyReply } from "fastify"
import { hasAllowedDummyToken } from "./dev-bypass"

export async function adminGuard(request: FastifyRequest, reply: FastifyReply) {
  try {
    if (hasAllowedDummyToken(request)) {
      (request as any).user = { id: "admin-dev", role: "ADMIN" }
      return
    }
    await request.jwtVerify()
    const user = request.user as { role: string }
    if (user.role !== "ADMIN") {
      reply.code(403).send({ error: "Forbidden", message: "Akses ditolak - hanya untuk Admin" })
      return reply
    }
  } catch {
    if (hasAllowedDummyToken(request)) {
      (request as any).user = { id: "admin-dev", role: "ADMIN" }
      return
    }
    reply.code(401).send({ error: "Unauthorized", message: "Silakan login terlebih dahulu" })
    return reply
  }
}

