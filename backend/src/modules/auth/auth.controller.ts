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

  loginGoogle = async (
    request: FastifyRequest<{ Body: { credential: string; rememberMe?: boolean } }>,
    reply: FastifyReply
  ) => {
    try {
      const result = await this.service.loginWithGoogle(
        request.body.credential,
        request.body.rememberMe
      )
      return reply.code(200).send({
        success: true,
        message: "Login Google berhasil",
        data: result,
      })
    } catch (err: any) {
      const statusCode = err.statusCode || 401
      return reply.code(statusCode).send({
        success: false,
        error: statusCode === 403 ? "Forbidden" : "Unauthorized",
        message: err.message || "Login Google gagal",
      })
    }
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
        error: err.errorCode || err.name || "Bad Request",
        errorCode: err.errorCode,
        message: err.message,
        role: err.role,
        alreadyActive: err.alreadyActive,
      })
    }
  }

  checkActivation = async (
    request: FastifyRequest<{ Querystring: { token?: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const token = request.query.token || ""
      const result = await this.service.checkActivation(token)
      const status = result.alreadyActive ? 409 : 200
      return reply.code(status).send(result)
    } catch (err: any) {
      return reply.code(err.statusCode || 400).send({
        error: err.errorCode || err.name || "Bad Request",
        errorCode: err.errorCode,
        message: err.message,
        valid: false,
        reason: err.reason,
        role: err.role,
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
        error: err.errorCode || err.name || "Bad Request",
        errorCode: err.errorCode,
        message: err.message,
        tokenExpiredAt: err.tokenExpiredAt,
        remainingSeconds: err.remainingSeconds,
        remainingFormatted: err.remainingFormatted,
      })
    }
  }
}
