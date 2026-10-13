import dynamic from "next/dynamic"

const AdminKerjaSamaClient = dynamic(
  () => import("@/features/kerja-sama/components/admin/AdminKerjaSamaClient"),
  { ssr: false }
)

export default function AdminKerjaSamaPage() {
  return <AdminKerjaSamaClient />
}
