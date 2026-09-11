import type { FastifyRequest, FastifyReply } from "fastify"

export async function adminGuard(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
    const user = request.user as { role: string }
    if (user.role !== "ADMIN") {
      reply.code(403).send({ error: "Forbidden", message: "Akses ditolak - hanya untuk Admin" })
    }
  } catch {
    reply.code(401).send({ error: "Unauthorized", message: "Silakan login terlebih dahulu" })
  }
}

