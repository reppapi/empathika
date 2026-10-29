// File: frontend/src/app/(admin)/admin-biro/pengaturan-akun/page.tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PengaturanAkunBiroPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/admin-biro/profile")
  }, [router])

  return (
    <div className="p-8 text-center font-poppins text-sm text-gray-500">
      Mengarahkan ke Pengaturan Profil & Keamanan Akun Biro...
    </div>
  )
}
