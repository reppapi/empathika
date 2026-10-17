import { Suspense } from "react"
import AdminEditPsikologClient from "@/features/psikolog/components/admin/AdminEditPsikologClient"

interface Props {
  params: { id: string }
}

export const metadata = {
  title: "Edit Tenaga Ahli - Admin Empathika",
  description: "Halaman edit data dan akun tenaga ahli oleh Admin Utama",
}

export default function AdminEditPsikologPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="p-6 text-gray-400 font-poppins text-sm">Memuat form edit...</div>}>
      <AdminEditPsikologClient psikologId={params.id} />
    </Suspense>
  )
}
