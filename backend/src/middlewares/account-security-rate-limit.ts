// File: backend/src/middlewares/account-security-rate-limit.ts
import type { FastifyRequest, FastifyReply } from "fastify"

interface RateBucket {
  count: number
  resetAt: number
}

// In-memory rate limiter untuk proteksi brute force
const attempts = new Map<string, RateBucket>()

export function createStrictRateLimit(options: { maxAttempts: number; windowMs: number; keyPrefix: string }) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const ip = request.ip || request.headers["x-forwarded-for"] || "unknown"
    const user = (request.user as any)?.id || "anonymous"
    const key = `${options.keyPrefix}:${user}:${ip}`
    const now = Date.now()

    const bucket = attempts.get(key)
    if (bucket && bucket.resetAt > now) {
      if (bucket.count >= options.maxAttempts) {
        const retryAfter = Math.ceil((bucket.resetAt - now) / 1000)
        reply.header("Retry-After", retryAfter)
        return reply.code(429).send({
          error: "Too Many Requests",
          message: `Terlalu banyak percobaan. Harap tunggu ${Math.ceil(retryAfter / 60)} menit lagi sebelum mencoba kembali.`,
        })
      }
      bucket.count += 1
    } else {
      attempts.set(key, { count: 1, resetAt: now + options.windowMs })
    }
  }
}

// 5 percobaan per 15 menit untuk operasi sensitif (password & email change)
export const sensitiveAccountRateLimit = createStrictRateLimit({
  keyPrefix: "acc-security",
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
})

// 10 verifikasi token per 15 menit per IP
export const verifyEmailRateLimit = createStrictRateLimit({
  keyPrefix: "verify-email",
  maxAttempts: 10,
  windowMs: 15 * 60 * 1000,
})
