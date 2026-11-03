import { Suspense } from "react"
import AdminDokumentasiFormClient from "@/features/event/components/admin/AdminDokumentasiFormClient"

export const metadata = {
  title: "Edit Dokumentasi Event - Admin Empathika",
  description: "Formulir edit dokumentasi event yang telah selesai",
}

interface EditDokumentasiPageProps {
  params: {
    id: string
  }
}

export default function EditDokumentasiPage({ params }: EditDokumentasiPageProps) {
  return (
    <Suspense fallback={<div className="p-6 text-gray-400 font-poppins text-sm">Memuat formulir...</div>}>
      <AdminDokumentasiFormClient id={params.id} />
    </Suspense>
  )
}

