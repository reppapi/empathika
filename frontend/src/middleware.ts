import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedRoutes = ["/dashboard", "/riwayat-transaksi", "/hasil-tes"]
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

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r))
  const isAdmin = adminRoutes.some((r) => pathname.startsWith(r))

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Jika akses admin, biro, atau psikolog-web tanpa token, redirect ke login
  if (isAdmin && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/admin-biro/:path*",
    "/riwayat-transaksi/:path*",
    "/hasil-tes/:path*",
    "/psikolog-web/:path*",
    "/beranda/:path*",
    "/jadwal/:path*",
    "/profile/:path*",
  ],
}

