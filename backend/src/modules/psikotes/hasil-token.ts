/** Helper pembuatan dan verifikasi HMAC token akses untuk laporan hasil psikotes berbayar. */
import crypto from 'node:crypto'
import { env } from '../../config/env'

function signHasilPayload(bookingId: string, secret: string): Buffer {
  return crypto
    .createHmac('sha256', secret)
    .update(`empathika-hasil-psikotes:${bookingId}`)
    .digest()
}

/**
 * Membuat token akses terikat bookingId menggunakan HMAC-SHA256.
 */
export function createHasilAccessToken(bookingId: string, secretOverride?: string): string {
  const secret = secretOverride || env.JWT_SECRET
  return signHasilPayload(bookingId, secret).toString('base64url')
}

/**
 * Memverifikasi token akses hasil psikotes menggunakan perbandingan constant-time.
 */
export function verifyHasilAccessToken(
  bookingId: string,
  token?: string | null,
  secretOverride?: string
): boolean {
  if (!bookingId || !token || typeof token !== 'string') return false
  try {
    const provided = Buffer.from(token.trim(), 'base64url')
    const expected = signHasilPayload(bookingId, secretOverride || env.JWT_SECRET)
    if (provided.length !== expected.length) return false
    return crypto.timingSafeEqual(provided, expected)
  } catch {
    return false
  }
}

