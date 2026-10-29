// File: frontend/src/app/(psikolog-web)/psikolog-web/pengaturan-akun/page.tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PengaturanAkunPsikologPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/psikolog-web/profile")
  }, [router])

  return (
    <div className="p-8 text-center font-poppins text-sm text-gray-500">
      Mengarahkan ke Pengaturan Profil & Keamanan Akun...
    </div>
  )
}
