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
  return <AdminDashboardClient />
}