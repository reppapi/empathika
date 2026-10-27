import type { FastifyRequest, FastifyReply } from "fastify"

const isDev = process.env.NODE_ENV !== "production"

export async function authGuard(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization
    if (isDev && authHeader && authHeader.includes("dummy-")) {
      (request as any).user = { id: "user-dev", role: "USER" }
      return
    }
    await request.jwtVerify()
  } catch {
    const authHeader = request.headers.authorization
    if (isDev && authHeader && authHeader.includes("dummy-")) {
      (request as any).user = { id: "user-dev", role: "USER" }
      return
    }
    reply.code(401).send({ error: "Unauthorized", message: "Silakan login terlebih dahulu" })
    return reply
  }
}

