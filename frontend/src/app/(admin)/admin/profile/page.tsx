import { Suspense } from "react"
import ProfileManagementClient from "@/features/admin/profile/components/ProfileManagementClient"

export const metadata = {
  title: "Pengaturan Profil - Admin Empathika",
  description: "Kelola profil akun Admin Biro dan Psikolog Empathika",
}

export default function AdminProfilePage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-400 font-poppins text-sm">Memuat pengaturan profil...</div>}>
      <ProfileManagementClient role="admin" />
    </Suspense>
  )
}
