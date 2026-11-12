import type { FastifyRequest, FastifyReply } from "fastify"
import { hasAllowedDummyToken } from "./dev-bypass"

export async function authGuard(request: FastifyRequest, reply: FastifyReply) {
  try {
    if (hasAllowedDummyToken(request)) {
      (request as any).user = { id: "user-dev", role: "USER" }
      return
    }
    await request.jwtVerify()
  } catch {
    if (hasAllowedDummyToken(request)) {
      (request as any).user = { id: "user-dev", role: "USER" }
      return
    }
    reply.code(401).send({ error: "Unauthorized", message: "Silakan login terlebih dahulu" })
    return reply
  }
}

