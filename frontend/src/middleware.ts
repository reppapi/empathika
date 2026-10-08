import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedRoutes = ["/dashboard", "/riwayat-transaksi", "/hasil-tes"]
const adminRoutes = ["/admin"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("access_token")?.value

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r))
  // Bypass sementara untuk dev admin:
  // const isAdmin = adminRoutes.some((r) => pathname.startsWith(r))

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/riwayat-transaksi/:path*", "/hasil-tes/:path*"],
}

