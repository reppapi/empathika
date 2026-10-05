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
    return reply.code(error.statusCode).send({
      error: error.name,
      message: error.message,
    })
  }

  // Unknown server error
  reply.code(500).send({
    error: "Internal Server Error",
    message: "Terjadi kesalahan pada server",
  })
}

