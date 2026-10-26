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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("access_token")?.value

  const isAdmin = adminRoutes.some((r) => pathname.startsWith(r))

  // Jika akses admin, biro, atau psikolog-web tanpa token valid, redirect ke login
  if (isAdmin && (!token || token.trim() === "")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Multi-tenant Biro rewrite:
  // /biro/[slug] -> rewrite ke / (halaman home)
  // /biro/[slug]/[...path] -> rewrite ke /[...path] (misal: /layanan, /konseling, /psikolog, dll.)
  // URL di browser tetap /biro/[slug]/[...path]
  const biroMatch = pathname.match(/^\/biro\/([^/?#]+)(\/.*)?$/)
  if (biroMatch) {
    const slug = biroMatch[1]
    const restPath = biroMatch[2] || "/"
    
    const url = request.nextUrl.clone()
    url.pathname = restPath
    const response = NextResponse.rewrite(url)
    response.headers.set("x-biro-slug", slug)
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/admin-biro",
    "/admin-biro/:path*",
    "/psikolog-web",
    "/psikolog-web/:path*",
    "/beranda",
    "/beranda/:path*",
    "/jadwal",
    "/jadwal/:path*",
    "/profile",
    "/profile/:path*",
    "/biro/:path*",
  ],
}


