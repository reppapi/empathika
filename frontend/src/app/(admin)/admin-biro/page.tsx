import { Suspense } from "react"
import dynamic from "next/dynamic"
import BiroLoadingState from "@/components/shared/BiroLoadingState"

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
    <Suspense fallback={<BiroLoadingState message="Memuat ringkasan operasional biro..." minHeight="min-h-[50vh]" />}>
      <AdminBiroDashboardClient />
    </Suspense>
  )
}
