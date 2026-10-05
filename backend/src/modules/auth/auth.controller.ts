import type { FastifyRequest, FastifyReply } from "fastify"
import { AuthService } from "./auth.service"
import type { LoginInput, RegisterInput } from "./auth.schema"

export class AuthController {
  private service: AuthService

  constructor(fastify: any) {
    this.service = new AuthService(fastify)
  }

  login = async (request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply) => {
    const result = await this.service.login(request.body)
    reply.code(200).send(result)
  }

  register = async (request: FastifyRequest<{ Body: RegisterInput }>, reply: FastifyReply) => {
    const result = await this.service.register(request.body)
    reply.code(201).send(result)
  }

  me = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: string }
    reply.code(200).send({ userId: user.id })
  }
}

