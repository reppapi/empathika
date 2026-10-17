import { Suspense } from "react"
import dynamic from "next/dynamic"

const AdminKerjaSamaClient = dynamic(
  () => import("@/features/kerja-sama/components/admin/AdminKerjaSamaClient"),
  { ssr: false }
)

export default function AdminKerjaSamaPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-400 font-poppins">Memuat data kerja sama...</div>}>
      <AdminKerjaSamaClient />
    </Suspense>
  )
}
