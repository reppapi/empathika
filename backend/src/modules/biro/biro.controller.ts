import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify"
import { BiroService } from "./biro.service"
import type { UpdateBiroAccountInput } from "./biro.schema"

export class BiroController {
  private service: BiroService

  constructor(fastify: FastifyInstance) {
    this.service = new BiroService(fastify.prisma)
  }

  updateAccount = async (
    request: FastifyRequest<{ Body: UpdateBiroAccountInput }>,
    reply: FastifyReply
  ) => {
    try {
      const user = (request as any).user
      const accountId = user?.id || (request.headers["x-account-id"] as string)

      if (!accountId) {
        return reply.code(401).send({ error: "Unauthorized", message: "ID akun tidak ditemukan" })
      }

      const result = await this.service.updateAccount(accountId, request.body)
      return reply.code(200).send(result)
    } catch (err: any) {
      const statusCode = err.statusCode || 400
      return reply.code(statusCode).send({ error: "Bad Request", message: err.message })
    }
  }

  getMyAccount = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user
      const accountId = user?.id || (request.headers["x-account-id"] as string)

      if (!accountId) {
        return reply.code(401).send({ error: "Unauthorized", message: "ID akun tidak ditemukan" })
      }

      const result = await this.service.getAccount(accountId)
      return reply.code(200).send(result)
    } catch (err: any) {
      const statusCode = err.statusCode || 404
      return reply.code(statusCode).send({ error: "Error", message: err.message })
    }
  }

  getAll = async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await this.service.getAllBiroAccounts()
      return reply.code(200).send(result)
    } catch (err: any) {
      return reply.code(500).send({ error: "Error", message: err.message })
    }
  }
}
