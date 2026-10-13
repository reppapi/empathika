import { Suspense } from "react"
import AdminDetailPsikologClient from "@/features/psikolog/components/admin/AdminDetailPsikologClient"

export const metadata = {
  title: "Detail Profil Tenaga Ahli - Admin Empathika",
  description: "Halaman kelola profil dan monitoring tenaga ahli oleh Admin Utama",
}

interface Props {
  params: { id: string }
}

export default function AdminDetailPsikologPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="p-6 text-gray-400 font-poppins text-sm">Memuat profil...</div>}>
      <AdminDetailPsikologClient psikologId={params.id} />
    </Suspense>
  )
}
