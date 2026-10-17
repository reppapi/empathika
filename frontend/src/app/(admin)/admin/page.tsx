import { Suspense } from "react"
import dynamic from "next/dynamic"

export const metadata = {
  title: "Ringkasan Operasional - Admin Empathika",
  description: "Ringkasan operasional dan aktivitas layanan Empathika",
}

const AdminDashboardClient = dynamic(
  () => import("@/features/dashboard/components/admin/AdminDashboardClient"),
  { ssr: false }
)

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-400 font-poppins">Memuat ringkasan operasional...</div>}>
      <AdminDashboardClient />
    </Suspense>
  )
}