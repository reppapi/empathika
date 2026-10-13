import { Suspense } from "react"
import AdminPsikologClient from "@/features/psikolog/components/admin/AdminPsikologClient"

export const metadata = {
  title: "Data Psikolog & Tenaga Ahli - Admin Empathika",
  description: "Manajemen data profil, aktivasi izin akses web, dan klasifikasi psikolog/konselor Empathika",
}

export default function AdminPsikologPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-400 font-poppins text-sm">Memuat data psikolog...</div>}>
      <AdminPsikologClient />
    </Suspense>
  )
}
