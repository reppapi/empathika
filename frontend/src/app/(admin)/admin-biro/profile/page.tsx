import { Suspense } from "react"
import ProfilBiroClient from "@/features/profile/components/admin-biro/ProfilBiroClient"
import BiroLoadingState from "@/components/shared/BiroLoadingState"

export const metadata = {
  title: "Pengaturan Profil Biro - Admin Biro Empathika",
  description: "Kelola informasi identitas dan keamanan akun biro mitra Empathika",
}

export default function AdminBiroProfilePage() {
  return (
    <Suspense fallback={<BiroLoadingState message="Memuat pengaturan profil biro..." minHeight="min-h-[50vh]" />}>
      <ProfilBiroClient />
    </Suspense>
  )
}
