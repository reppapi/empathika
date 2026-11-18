/** Helper tunggal untuk membatasi bypass token `dummy-` hanya di mode development lokal dengan pengamanan ketat. */
import type { FastifyRequest } from 'fastify'
import { env } from '../config/env'

/**
 * Bypass token `dummy-` HANYA diizinkan secara eksplisit saat `NODE_ENV === "development"`
 * dan TIDAK dinonaktifkan oleh `DISABLE_DEV_DUMMY_AUTH=true`.
 * Pada lingkungan `production`, `staging`, maupun `test`, fungsi ini WAJIB selalu mengembalikan false.
 */
export function isDevDummyAuthEnabled(): boolean {
  // 1. Guard lingkungan non-development
  if (
    process.env.NODE_ENV === 'production' ||
    process.env.NODE_ENV === 'staging' ||
    process.env.NODE_ENV === 'test' ||
    env.NODE_ENV !== 'development'
  ) {
    return false
  }

  // 2. Guard manual disable dev auth
  if (
    env.DISABLE_DEV_DUMMY_AUTH === 'true' ||
    process.env.DISABLE_DEV_DUMMY_AUTH === 'true'
  ) {
    return false
  }

  return true
}

export function hasAllowedDummyToken(request: FastifyRequest): boolean {
  const authHeader = request.headers.authorization
  const isDummy = typeof authHeader === 'string' && authHeader.includes('dummy-')

  if (!isDummy) return false

  if (!isDevDummyAuthEnabled()) {
    console.warn(
      `[SECURITY ALERT] Percobaan penggunaan dummy token ditolak pada environment [${env.NODE_ENV}] untuk path: ${request.url}`
    )
    return false
  }

  return true
}

