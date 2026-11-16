// File: backend/src/modules/psikolog/account-settings.controller.ts
import type { FastifyRequest, FastifyReply, FastifyInstance } from "fastify"
import { AccountSettingsService } from "./account-settings.service"
import {
  emailChangeRequestSchema,
  verifyEmailSchema,
  changePasswordSchema,
} from "./account-settings.schema"

export class AccountSettingsController {
  private service: AccountSettingsService

  constructor(fastify: FastifyInstance) {
    this.service = new AccountSettingsService(fastify.prisma)
  }

  getPendingEmailChange = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: string }
    const result = await this.service.getPendingEmailChange(user.id)
    return reply.code(200).send(result)
  }

  requestEmailChange = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: string }
    const parsed = emailChangeRequestSchema.parse(request.body)
    const result = await this.service.requestEmailChange(user.id, parsed, {
      ip: request.ip || "unknown",
      userAgent: request.headers["user-agent"],
    })
    return reply.code(200).send(result)
  }

  cancelEmailChange = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: string }
    const result = await this.service.cancelEmailChange(user.id, {
      ip: request.ip || "unknown",
    })
    return reply.code(200).send(result)
  }

  verifyEmailChange = async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = verifyEmailSchema.parse(request.body)
    const result = await this.service.verifyEmailChange(parsed.token, {
      ip: request.ip || "unknown",
    })
    return reply.code(200).send(result)
  }

  changePassword = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: string }
    const parsed = changePasswordSchema.parse(request.body)
    const result = await this.service.changePassword(user.id, parsed, {
      ip: request.ip || "unknown",
      userAgent: request.headers["user-agent"],
    })
    return reply.code(200).send(result)
  }
}
