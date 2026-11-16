import crypto from "crypto"
import { env } from "../config/env"

const TOKEN_TTL_MS = 3 * 24 * 60 * 60 * 1000

export function formatRemainingTime(ms: number): string {
  if (ms <= 0) return "0 detik"
  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  const parts: string[] = []
  if (days > 0) parts.push(`${days} hari`)
  if (hours > 0) parts.push(`${hours} jam`)
  if (minutes > 0 && days === 0) parts.push(`${minutes} menit`)
  if (parts.length === 0) return "kurang dari 1 menit"
  return parts.join(" ")
}

export function formatExpiryWib(date: Date | string): string {
  return new Date(date).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function getFrontendBaseUrl(): string {
  return (env.FRONTEND_URL || process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "")
}

export function buildActivationUrl(token: string): string {
  return `${getFrontendBaseUrl()}/set-password?token=${token}`
}

export function issueActivationToken() {
  return {
    token: `act_${crypto.randomBytes(20).toString("hex")}`,
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
  }
}

export type AccountActivationFields = {
  aktif?: boolean | null
  password?: string | null
  token_aktivasi?: string | null
  token_aktivasi_exp?: Date | string | null
}

export function buildActivationMeta(account: AccountActivationFields | null | undefined) {
  const hasPassword = Boolean(account?.password)
  const accountAktif = Boolean(account?.aktif && hasPassword)
  const tokenAktivasi = account?.token_aktivasi || null
  const exp = account?.token_aktivasi_exp ? new Date(account.token_aktivasi_exp) : null
  const remainingMs = exp ? exp.getTime() - Date.now() : 0
  const linkMasihBerlaku = Boolean(tokenAktivasi && exp && remainingMs > 0)
  const canGenerateLink = !accountAktif && !linkMasihBerlaku
  const canRegenerateLink = canGenerateLink && Boolean(tokenAktivasi)

  return {
    accountAktif,
    hasPassword,
    tokenAktivasi,
    tokenExpiredAt: exp && !Number.isNaN(exp.getTime()) ? exp.toISOString() : null,
    linkMasihBerlaku,
    canGenerateLink,
    canRegenerateLink,
    remainingSeconds: linkMasihBerlaku ? Math.ceil(remainingMs / 1000) : 0,
    remainingFormatted: linkMasihBerlaku ? formatRemainingTime(remainingMs) : null,
    expiresAtWib: exp && linkMasihBerlaku ? formatExpiryWib(exp) : null,
  }
}

export function withActivationAccount<T extends Record<string, any>>(account: T | null | undefined) {
  if (!account) return account
  const rest = { ...account }
  delete rest.password
  return {
    ...rest,
    ...buildActivationMeta(account),
  }
}
