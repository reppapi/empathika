/** Helper tunggal untuk membatasi bypass token `dummy-` hanya di mode development lokal. */
import type { FastifyRequest } from 'fastify'
import { env } from '../config/env'

/**
 * Bypass token `dummy-` hanya diizinkan saat `NODE_ENV === "development"`
 * dan tidak dinonaktifkan oleh `DISABLE_DEV_DUMMY_AUTH=true`.
 * Pada `production`, `staging`, maupun `test`, fungsi ini selalu mengembalikan false.
 */
export function isDevDummyAuthEnabled(): boolean {
  return env.NODE_ENV === 'development' && env.DISABLE_DEV_DUMMY_AUTH !== 'true'
}

export function hasAllowedDummyToken(request: FastifyRequest): boolean {
  if (!isDevDummyAuthEnabled()) return false
  const authHeader = request.headers.authorization
  return typeof authHeader === 'string' && authHeader.includes('dummy-')
}

