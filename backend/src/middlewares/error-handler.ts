import type { FastifyError, FastifyRequest, FastifyReply } from "fastify"
import { ZodError } from "zod"

export function errorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  request.log.error(error)

  // Zod validation error
  if (error instanceof ZodError) {
    return reply.code(422).send({
      error: "Validation Error",
      message: "Data yang dikirim tidak valid",
      details: error.flatten().fieldErrors,
    })
  }

  // Known HTTP errors
  if (error.statusCode) {
    const extra = error as FastifyError & {
      errorCode?: string
      tokenExpiredAt?: Date | string
      remainingSeconds?: number
      remainingFormatted?: string
      role?: string
      alreadyActive?: boolean
      reason?: string
      valid?: boolean
    }
    return reply.code(error.statusCode).send({
      error: extra.errorCode || error.name,
      errorCode: extra.errorCode,
      message: error.message,
      tokenExpiredAt: extra.tokenExpiredAt,
      remainingSeconds: extra.remainingSeconds,
      remainingFormatted: extra.remainingFormatted,
      role: extra.role,
      alreadyActive: extra.alreadyActive,
      reason: extra.reason,
      valid: extra.valid,
    })
  }

  // Unknown server error
  reply.code(500).send({
    error: "Internal Server Error",
    message: error.message || "Terjadi kesalahan pada server",
    stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
  })
}

