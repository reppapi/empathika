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

    // 1. Cek mode "Ingat Saya"
    const isRemembered =
      typeof window !== "undefined" &&
      localStorage.getItem("remember_me") === "true"

    const cookieToken =
      typeof document !== "undefined"
        ? document.cookie
            .split(";")
            .map((item) => item.trim())
            .find((item) => item.startsWith("access_token="))
            ?.split("=")[1]
        : null

    // Jika "Ingat Saya" dicentang: token bertahan di localStorage / cookie (7 hari)
    // Jika TIDAK dicentang: token WAJIB ada di sessionStorage (otomatis musnah saat tab / browser ditutup)
    const validToken =
      typeof window !== "undefined"
        ? isRemembered
          ? (localStorage.getItem("access_token") || cookieToken)
          : sessionStorage.getItem("access_token")
        : null

    if (!validToken || validToken.trim() === "") {
      // Sesi habis / tab ditutup tanpa "Ingat Saya": bersihkan sisa-sisa sesi dan lempar ke /login
      if (typeof document !== "undefined") {
        document.cookie = "access_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT;"
        document.cookie = "remember_me=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT;"
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token")
        localStorage.removeItem("remember_me")
        localStorage.removeItem("empathika-auth")
        sessionStorage.removeItem("access_token")
      }
      router.replace("/login")
      return
    }

    // 2. Jika ada pembatasan role tertentu, cek data di authStore / storage
    if (allowedRoles && allowedRoles.length > 0) {
      try {
        let userRole: string | undefined = undefined
        if (isRemembered) {
          const authDataStr = localStorage.getItem("empathika-auth")
          if (authDataStr) userRole = JSON.parse(authDataStr)?.state?.user?.role
        } else {
          userRole = sessionStorage.getItem("user_role") || undefined
        }

        if (userRole && !allowedRoles.includes(userRole as any)) {
          // Role tidak sesuai
          router.replace("/login")
          return
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

