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

  setPassword = async (
    request: FastifyRequest<{ Body: { token: string; password: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { token, password } = request.body
      const result = await this.service.setPassword(token, password)
      return reply.code(200).send(result)
    } catch (err: any) {
      return reply.code(err.statusCode || 400).send({
        error: err.name || "Bad Request",
        message: err.message,
      })
    }
  }

  resendActivation = async (
    request: FastifyRequest<{ Body: { accountId: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { accountId } = request.body
      const result = await this.service.resendActivation(accountId)
      return reply.code(200).send(result)
    } catch (err: any) {
      return reply.code(err.statusCode || 400).send({
        error: err.name || "Bad Request",
        message: err.message,
      })
    }
  }
}
