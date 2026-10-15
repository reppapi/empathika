import { Suspense } from "react"
import ProfilePsikologClient from "@/features/profile/components/psikolog/ProfilePsikologClient"

export const metadata = {
  title: "Profil Saya - Psikolog Empathika",
  description: "Kelola profil dan data praktik profesional psikolog",
}

export default function PsikologWebProfilePage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-400 font-poppins text-sm">Memuat profil psikolog...</div>}>
      <ProfilePsikologClient role="psikolog" />
    </Suspense>
  )
}
