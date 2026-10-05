import type { FastifyRequest, FastifyReply } from "fastify"
import { AuthService } from "./auth.service"

export class AuthController {
  private service: AuthService

  constructor(fastify: any) {
    this.service = new AuthService(fastify)
  }

  me = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: string }
    const result = await this.service.getProfile(user.id)
    reply.code(200).send(result)
  }
}

