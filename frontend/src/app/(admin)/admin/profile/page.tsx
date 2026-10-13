import { Suspense } from "react"
import ProfileAdminClient from "@/features/profile/components/admin/ProfileAdminClient"

export const metadata = {
  title: "Pengaturan Profil - Admin Empathika",
  description: "Kelola profil akun Admin Biro dan Psikolog Empathika",
}

export default function AdminProfilePage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-400 font-poppins text-sm">Memuat pengaturan profil...</div>}>
      <ProfileAdminClient role="admin" />
    </Suspense>
  )
}
