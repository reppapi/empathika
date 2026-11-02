import { Suspense } from "react"
import AdminDokumentasiFormClient from "@/features/event/components/admin/AdminDokumentasiFormClient"

export const metadata = {
  title: "Tambah Dokumentasi Event - Admin Empathika",
  description: "Formulir penambahan dokumentasi event yang telah selesai",
}

export default function TambahDokumentasiPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-400 font-poppins text-sm">Memuat formulir...</div>}>
      <AdminDokumentasiFormClient />
    </Suspense>
  )
}

