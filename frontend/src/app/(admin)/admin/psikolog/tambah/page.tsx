import { Suspense } from "react"
import AdminTambahPsikologClient from "@/features/psikolog/components/admin/AdminTambahPsikologClient"

export const metadata = {
  title: "Tambah Tenaga Ahli - Admin Empathika",
  description: "Form pendaftaran tenaga ahli dan pembuatan akun login baru",
}

export default function TambahPsikologPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-400 font-poppins text-sm">Memuat form...</div>}>
      <AdminTambahPsikologClient />
    </Suspense>
  )
}
