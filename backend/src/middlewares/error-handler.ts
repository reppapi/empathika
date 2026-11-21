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

  // Prisma unique constraint violation (P2002 / Race Condition)
  if ((error as any).code === "P2002") {
    const target = (error as any).meta?.target
    const isSlotRaceCondition =
      !target ||
      (Array.isArray(target) && target.some((t: string) => t.includes("jadwal") || t.includes("slot"))) ||
      String(target).includes("jadwal") ||
      String(target).includes("slot")

    return reply.code(409).send({
      error: "Conflict",
      errorCode: "P2002",
      message: isSlotRaceCondition
        ? "Mohon maaf, slot sesi ini baru saja dipesan oleh klien lain. Silakan pilih jadwal sesi lainnya."
        : "Data yang Anda kirimkan sudah terdaftar atau terjadi konflik data. Silakan periksa kembali.",
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

