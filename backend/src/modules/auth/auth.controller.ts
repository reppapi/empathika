import type { FastifyRequest, FastifyReply, FastifyInstance } from "fastify"
import { AuthService } from "./auth.service"
import type { LoginInput } from "./auth.schema"

export class AuthController {
  private service: AuthService

  constructor(fastify: FastifyInstance) {
    this.service = new AuthService(fastify)
  }

  login = async (
    request: FastifyRequest<{ Body: LoginInput }>,
    reply: FastifyReply
  ) => {
    const result = await this.service.login(request.body)
    return reply.code(200).send({
      success: true,
      message: "Login berhasil",
      data: result,
    })
  }

  me = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: string }
    const result = await this.service.getProfile(user.id)
    return reply.code(200).send({
      success: true,
      message: "Berhasil mengambil profil user",
      data: result,
    })
  }
}
