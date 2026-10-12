import { Suspense } from "react"
import ProfilBiroClient from "@/features/admin-biro/profile/components/ProfilBiroClient"

export const metadata = {
  title: "Pengaturan Profil Biro - Admin Biro Empathika",
  description: "Kelola informasi identitas dan keamanan akun biro mitra Empathika",
}

export default function AdminBiroProfilePage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-400 font-poppins text-sm">Memuat pengaturan profil...</div>}>
      <ProfilBiroClient />
    </Suspense>
  )
}
