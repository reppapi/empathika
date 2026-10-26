/**
 * Helper manajemen cookie dengan dukungan cross-subdomain (*.empathika.com).
 * Menjamin sesi autentikasi tetap aktif baik saat diakses dari domain utama
 * maupun subdomain biro.
 */

function getCookieDomain(): string {
  if (typeof window === "undefined") return ""
  const hostname = window.location.hostname.toLowerCase()
  if (hostname.endsWith("empathika.com")) {
    return "; domain=.empathika.com"
  }
  return ""
}

export function setAuthCookie(name: string, value: string, maxAgeSeconds?: number) {
  if (typeof document === "undefined") return
  const domainPart = getCookieDomain()
  let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/${domainPart}; SameSite=Lax`
  if (maxAgeSeconds !== undefined) {
    cookieStr += `; max-age=${maxAgeSeconds}`
  }
  document.cookie = cookieStr
}

export function getAuthCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const escapedName = encodeURIComponent(name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${escapedName}=([^;]+)`))
  return match && match[1] ? decodeURIComponent(match[1].trim()) : null
}

export function removeAuthCookie(name: string) {
  if (typeof document === "undefined") return
  const domainPart = getCookieDomain()
  document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
  if (domainPart) {
    document.cookie = `${encodeURIComponent(name)}=; path=/${domainPart}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
  }
}
