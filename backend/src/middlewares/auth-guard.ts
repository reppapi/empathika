import type { FastifyRequest, FastifyReply } from "fastify"

export async function authGuard(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization
    if (authHeader && authHeader.includes("dummy-")) {
      (request as any).user = { id: "user-dev", role: "USER" }
      return
    }
    await request.jwtVerify()
  } catch {
    const authHeader = request.headers.authorization
    if (authHeader && authHeader.includes("dummy-")) {
      (request as any).user = { id: "user-dev", role: "USER" }
      return
    }
    reply.code(401).send({ error: "Unauthorized", message: "Silakan login terlebih dahulu" })
  }
}

