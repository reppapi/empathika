import AdminKerjaSamaFormClient from "@/features/kerja-sama/components/admin/AdminKerjaSamaFormClient"

interface Props {
  params: { id: string }
}

export const metadata = {
  title: "Edit Program Kerja Sama - Admin Empathika",
  description: "Halaman edit program kerja sama dan kolaborasi Empathika",
}

export default function AdminEditKerjaSamaPage({ params }: Props) {
  return <AdminKerjaSamaFormClient programId={params.id} />
}
