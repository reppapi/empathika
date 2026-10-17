import { Suspense } from "react"
import AdminLayananView from "@/features/layanan/components/admin/AdminLayananView"

export default function AdminLayananPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-400 font-poppins">Memuat data layanan...</div>}>
      <AdminLayananView />
    </Suspense>
  )
}
