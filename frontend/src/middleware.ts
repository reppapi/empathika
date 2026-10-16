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

  // Jika akses admin, biro, atau psikolog-web tanpa token, redirect ke login
  if (isAdmin && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/admin-biro/:path*",
    "/psikolog-web/:path*",
    "/beranda/:path*",
    "/jadwal/:path*",
    "/profile/:path*",
  ],
}


