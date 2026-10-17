import AdminBiroFormClient from "@/features/biro/components/admin/AdminBiroFormClient"

interface Props {
  params: { id: string }
}

export const metadata = {
  title: "Edit Biro & Komunitas - Admin Empathika",
  description: "Halaman edit biro dan konfigurasi tenant Empathika",
}

export default function AdminEditBiroPage({ params }: Props) {
  return <AdminBiroFormClient biroId={params.id} />
}
