import type { FastifyRequest, FastifyReply } from 'fastify'

export interface RateLimiterOptions {
  windowMs?: number // Durasi jendela waktu (default: 60.000 ms = 1 menit)
  max?: number // Jumlah request maksimal per windowMs (default: 5)
  message?: string // Pesan penolakan saat limit terlewati
}

interface ClientRecord {
  count: number
  resetTime: number
}

/**
 * Middleware Rate Limiter berbasis In-Memory Sliding Window untuk Fastify.
 * Melindungi endpoint publik dari spam, bot, dan brute-force.
 */
export function createRateLimiter(options: RateLimiterOptions = {}) {
  const windowMs = options.windowMs || 60 * 1000
  const max = options.max || 5
  const message =
    options.message || 'Terlalu banyak permintaan dari perangkat Anda. Silakan tunggu beberapa saat sebelum mencoba kembali.'

  const store = new Map<string, ClientRecord>()

  // Bersihkan record lama secara berkala setiap 5 menit agar tidak memakan RAM
  const cleanupTimer = setInterval(() => {
    const now = Date.now()
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(key)
      }
    }
  }, 5 * 60 * 1000)

  if (cleanupTimer.unref) {
    cleanupTimer.unref()
  }

  return async function rateLimitGuard(request: FastifyRequest, reply: FastifyReply) {
    // Abaikan jika testing developer memakai dummy token di mode development
    const isDev = process.env.NODE_ENV !== 'production'
    const authHeader = request.headers.authorization
    if (isDev && authHeader && authHeader.includes('dummy-')) {
      return
    }

    // Ekstrak IP klien (kompatibel dengan reverse proxy Nginx/Cloudflare)
    const forwarded = request.headers['x-forwarded-for']
    const clientIp =
      (typeof forwarded === 'string'
        ? forwarded.split(',')[0].trim()
        : Array.isArray(forwarded)
          ? forwarded[0]
          : null) ||
      request.ip ||
      request.socket?.remoteAddress ||
      '127.0.0.1'

    const now = Date.now()
    let record = store.get(clientIp)

    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs }
      store.set(clientIp, record)
    } else {
      record.count++
    }

    const remaining = Math.max(0, max - record.count)
    const retryAfterSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000))

    reply.header('X-RateLimit-Limit', max)
    reply.header('X-RateLimit-Remaining', remaining)
    reply.header('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000))

    if (record.count > max) {
      reply.header('Retry-After', retryAfterSeconds)
      reply.code(429).send({
        error: 'Too Many Requests',
        statusCode: 429,
        message,
        retryAfterSeconds,
      })
      return reply
    }
  }
}
