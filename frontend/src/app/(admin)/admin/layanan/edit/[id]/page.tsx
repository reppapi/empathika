import { Suspense } from "react"
import EditLayananView from "@/features/layanan/components/admin/EditLayananView"

export const metadata = {
  title: "Edit Layanan - Admin Empathika",
  description: "Halaman edit layanan Empathika",
}

interface Props {
  params: { id: string }
}

export default function AdminEditLayananPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-400 font-poppins">Memuat formulir edit...</div>}>
      <EditLayananView layananId={params.id} />
    </Suspense>
  )
}
