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

  useEffect(() => {
    setIsMounted(true)

    // 1. Cek token di localStorage dan Cookie
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null

    // Helper cek cookie access_token
    const hasTokenCookie = typeof document !== "undefined" && document.cookie
      .split(";")
      .some((item) => item.trim().startsWith("access_token="))

    if (!token && !hasTokenCookie) {
      // Jika tidak ada token sama sekali, paksa redirect ke /login
      router.replace("/login")
      return
    }

    // 2. Jika ada pembatasan role tertentu, cek data di authStore / localStorage
    if (allowedRoles && allowedRoles.length > 0) {
      try {
        const authDataStr = localStorage.getItem("empathika-auth")
        if (authDataStr) {
          const authData = JSON.parse(authDataStr)
          const userRole = authData?.state?.user?.role
          if (userRole && !allowedRoles.includes(userRole)) {
            // Role tidak sesuai
            router.replace("/login")
            return
          }
        }
      } catch {
        // Abaikan parse error
      }
    }

    setIsAuthorized(true)
  }, [router, allowedRoles])

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

