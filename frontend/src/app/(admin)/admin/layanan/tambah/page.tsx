import { Suspense } from "react"
import TambahLayananView from "@/features/layanan/components/admin/TambahLayananView"

export default function AdminTambahLayananPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-400 font-poppins">Memuat formulir layanan...</div>}>
      <TambahLayananView />
    </Suspense>
  )
}
