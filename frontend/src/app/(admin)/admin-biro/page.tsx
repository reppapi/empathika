import { Suspense } from "react"
import dynamic from "next/dynamic"

export const metadata = {
  title: "Ringkasan Operasional - Admin Biro Empathika",
  description: "Ringkasan operasional dan pemantauan aktivitas klien biro mitra Empathika",
}

const AdminBiroDashboardClient = dynamic(
  () => import("@/features/dashboard/components/admin-biro/AdminBiroDashboardClient"),
  { ssr: false }
)

export default function AdminBiroDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-400 font-poppins">Memuat ringkasan operasional biro...</div>}>
      <AdminBiroDashboardClient />
    </Suspense>
  )
}
