"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAuthCookie, setAuthCookie, removeAuthCookie } from "@/lib/cookie"

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

    // 1. Cek mode "Ingat Saya"
    const isRemembered =
      typeof window !== "undefined" &&
      localStorage.getItem("remember_me") === "true"

    // Cek keberadaan nilai cookie access_token yang tidak kosong
    const cookieToken = getAuthCookie("access_token")

    // Jika "Ingat Saya" dicentang: token bertahan di localStorage / cookie (7 hari)
    // Jika TIDAK dicentang: token dicek dari sessionStorage atau cookie aktif
    let validToken =
      typeof window !== "undefined"
        ? isRemembered
          ? (localStorage.getItem("access_token") || cookieToken)
          : (sessionStorage.getItem("access_token") || cookieToken)
        : null

    // Dual-Sync: jika mode Ingat Saya aktif, pastikan cookie dan localStorage saling tersinkronisasi
    if (isRemembered && typeof window !== "undefined") {
      if (!localStorage.getItem("access_token") && cookieToken) {
        localStorage.setItem("access_token", cookieToken)
      } else if (localStorage.getItem("access_token") && !cookieToken) {
        setAuthCookie("access_token", localStorage.getItem("access_token")!, 604800)
      }
    }

    if (!validToken || validToken.trim() === "") {
      // Sesi habis / tab ditutup tanpa "Ingat Saya": bersihkan sisa-sisa sesi dan lempar ke /login
      removeAuthCookie("access_token")
      removeAuthCookie("remember_me")
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token")
        localStorage.removeItem("remember_me")
        localStorage.removeItem("empathika-auth")
        sessionStorage.removeItem("access_token")
        sessionStorage.removeItem("user_role")
      }
      router.replace("/login")
      return
    }

    // 2. Jika ada pembatasan role tertentu, cek data di authStore / storage
    if (allowedRoles && allowedRoles.length > 0) {
      try {
        let userRole: string | undefined = undefined
        if (isRemembered) {
          const authDataStr = typeof window !== "undefined" ? localStorage.getItem("empathika-auth") : null
          if (authDataStr) userRole = JSON.parse(authDataStr)?.state?.user?.role
        } else {
          userRole = typeof window !== "undefined" ? (sessionStorage.getItem("user_role") || undefined) : undefined
        }

        // Superadmin handling: Akun ADMIN memiliki izin memantau portal psikolog dan biro
        const isSuperAdmin = userRole === "ADMIN"

        if (userRole && !allowedRoles.includes(userRole as any) && !isSuperAdmin) {
          // Role tidak sesuai dan bukan superadmin
          router.replace("/login")
          return
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

