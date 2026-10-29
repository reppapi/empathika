export type ActivationFields = {
  accountId?: string | null
  accountAktif?: boolean
  tokenAktivasi?: string | null
  tokenExpiredAt?: string | null
  activationUrl?: string | null
  linkMasihBerlaku?: boolean
  canGenerateLink?: boolean
  canRegenerateLink?: boolean
  remainingFormatted?: string | null
  remainingSeconds?: number
}

export function toIsoExpiry(value: unknown): string | null {
  if (value == null || value === "") return null
  const d = new Date(value as string | number | Date)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

export function isLinkStillValid(expiresAt?: string | null): boolean {
  const iso = toIsoExpiry(expiresAt)
  if (!iso) return false
  return new Date(iso).getTime() > Date.now()
}

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

export function formatExpiryDisplay(isoStr?: string | null): string {
  const iso = toIsoExpiry(isoStr)
  if (!iso) return "-"
  return new Date(iso).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function getActivationUrl(token?: string | null): string {
  if (!token) return ""
  if (typeof window !== "undefined") {
    return `${window.location.origin}/set-password?token=${token}`
  }
  return `http://localhost:3000/set-password?token=${token}`
}

export function pickActivationFromPayload(raw: any): ActivationFields {
  const account = raw?.account || {}
  const accountAktif = Boolean(
    account.accountAktif ??
      raw?.accountAktif ??
      (account.aktif && (account.hasPassword || account.password))
  )
  const tokenAktivasi =
    account.tokenAktivasi ||
    account.token_aktivasi ||
    raw?.tokenAktivasi ||
    raw?.token_aktivasi ||
    null
  const tokenExpiredAt = toIsoExpiry(
    account.tokenExpiredAt ||
      account.token_aktivasi_exp ||
      raw?.tokenExpiredAt ||
      raw?.token_expired_at ||
      raw?.token_aktivasi_exp
  )
  const accountId = account.id || raw?.accountId || raw?.id_account || null

  return {
    accountId,
    accountAktif,
    tokenAktivasi,
    tokenExpiredAt,
    activationUrl: raw?.activationUrl || account.activationUrl || getActivationUrl(tokenAktivasi),
    linkMasihBerlaku: Boolean(account.linkMasihBerlaku ?? raw?.linkMasihBerlaku ?? isLinkStillValid(tokenExpiredAt)),
    canGenerateLink: Boolean(account.canGenerateLink ?? raw?.canGenerateLink ?? (!accountAktif && !isLinkStillValid(tokenExpiredAt))),
    canRegenerateLink: Boolean(account.canRegenerateLink ?? raw?.canRegenerateLink),
    remainingFormatted: account.remainingFormatted || raw?.remainingFormatted || null,
    remainingSeconds: account.remainingSeconds ?? raw?.remainingSeconds ?? 0,
  }
}
