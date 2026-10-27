import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rute admin, biro, dan psikolog-web dilindungi - membutuhkan cookie access_token
const adminRoutes = [
  "/admin",
  "/admin-biro",
  "/psikolog-web",
  "/beranda",
  "/jadwal",
  "/profile",
]

/**
 * Ekstrak slug tenant/biro dari subdomain.
 * Mendukung:
 * - Localhost: [slug].localhost:3000 -> slug
 * - Localhost (lvh.me): [slug].lvh.me:3000 -> slug
 * - Production: [slug].empathika.com -> slug
 */
function extractSubdomain(host: string | null): string | null {
  if (!host) return null
  const hostname = host.split(":")[0].toLowerCase()

  // 1. Kasus localhost: *.localhost
  if (hostname.endsWith(".localhost")) {
    const parts = hostname.replace(/\.localhost$/, "").split(".")
    const sub = parts[parts.length - 1]
    if (sub && sub !== "www") return sub
    return null
  }

  // 2. Kasus local dev helper: *.lvh.me
  if (hostname.endsWith(".lvh.me")) {
    const parts = hostname.replace(/\.lvh.me$/, "").split(".")
    const sub = parts[parts.length - 1]
    if (sub && sub !== "www") return sub
    return null
  }

  // 3. Kasus production / staging: *.empathika.com
  const parts = hostname.split(".")
  if (parts.length > 2) {
    const sub = parts[0]
    if (sub && sub !== "www") return sub
  }

  return null
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("access_token")?.value

  // /set-password dan /login tetap publik (matcher juga tidak mencakup keduanya)
  if (pathname === "/set-password" || pathname.startsWith("/login") || pathname.startsWith("/psikolog/login")) {
    return NextResponse.next()
  }

  const isAdmin = adminRoutes.some((r) => pathname.startsWith(r))

  // Jika akses admin, biro, atau psikolog-web tanpa token valid, redirect ke login
  if (isAdmin && (!token || token.trim() === "")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // ── DETEKSI TENANT MODEL 2 (SUBDOMAIN-BASED) ─────────────────────────────
  const host = request.headers.get("host")
  const subdomain = extractSubdomain(host)

  if (subdomain) {
    // Pengguna mengakses via subdomain (misal: ugm.localhost:3000 atau ugm.empathika.com)
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-biro-slug", subdomain)
    requestHeaders.set("x-tenant-slug", subdomain)

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
    response.headers.set("x-biro-slug", subdomain)
    response.headers.set("x-tenant-slug", subdomain)
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes
     * - _next/static (static assets)
     * - _next/image (image optimization files)
     * - favicon.ico and static file extensions (.svg, .png, .jpg, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}


