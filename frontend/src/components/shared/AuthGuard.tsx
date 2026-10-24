"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: ("ADMIN" | "BIRO" | "PSIKOLOG")[]
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState<boolean>(false)
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false)

  // Stabilkan dependensi allowedRoles agar tidak memicu re-running di setiap re-render
  const rolesKey = allowedRoles ? allowedRoles.slice().sort().join(",") : ""

  useEffect(() => {
    setIsMounted(true)

    // 1. Cek token di localStorage dan Cookie
    let token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null

    // Cek keberadaan nilai cookie access_token yang tidak kosong
    let cookieToken: string | null = null
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]+)/)
      if (match && match[1] && match[1].trim() !== "") {
        cookieToken = decodeURIComponent(match[1].trim())
      }
    }

    // Dual-Sync: jika ada di cookie tapi belum ada di localStorage, sinkronkan
    if (!token && cookieToken) {
      token = cookieToken
      try {
        localStorage.setItem("access_token", cookieToken)
      } catch {}
    }

    // Dual-Sync: jika ada di localStorage tapi cookie hilang (idle/fresh load), pulihkan cookie
    if (token && !cookieToken && typeof document !== "undefined") {
      document.cookie = `access_token=${token}; path=/; max-age=604800; SameSite=Lax`
      cookieToken = token
    }

    if (!token && !cookieToken) {
      // Jika benar-benar tidak ada token, baru redirect ke /login
      router.replace("/login")
      return
    }

    // 2. Jika ada pembatasan role tertentu, cek data di authStore / localStorage
    if (allowedRoles && allowedRoles.length > 0) {
      try {
        const authDataStr = typeof window !== "undefined" ? localStorage.getItem("empathika-auth") : null
        if (authDataStr) {
          const authData = JSON.parse(authDataStr)
          const userRole = authData?.state?.user?.role

          // Superadmin handling: Akun ADMIN memiliki izin memantau portal psikolog dan biro
          const isSuperAdmin = userRole === "ADMIN"

          if (userRole && !allowedRoles.includes(userRole) && !isSuperAdmin) {
            // Role tidak sesuai dan bukan superadmin
            router.replace("/login")
            return
          }
        }
      } catch {
        // Abaikan parse error
      }
    }

    setIsAuthorized(true)
  }, [router, rolesKey])

  // Jangan render apapun sebelum mounted di client untuk menghindari perbedaan DOM dengan SSR (Hydration error)
  if (!isMounted || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBFBFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#561269] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500 font-medium">Memverifikasi sesi login...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

