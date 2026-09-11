"use client"
import { useEffect } from "react"
import { useAuthStore } from "@/store/authStore"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Bisa tambahkan token validation / refresh saat app mount
  }, [isAuthenticated])

  return <>{children}</>
}

