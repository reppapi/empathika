import { Suspense } from "react"
import ProfileManagementClient from "@/features/admin/profile/components/ProfileManagementClient"

export const metadata = {
  title: "Profil Saya - Psikolog Empathika",
  description: "Kelola profil dan data praktik profesional psikolog",
}

export default function PsikologWebProfilePage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-400 font-poppins text-sm">Memuat profil psikolog...</div>}>
      <ProfileManagementClient role="psikolog" />
    </Suspense>
  )
}
