import EditLayananView from "@/features/layanan/components/admin/EditLayananView"

export const metadata = {
  title: "Edit Layanan - Admin Empathika",
  description: "Halaman edit layanan Empathika",
}

interface Props {
  params: { id: string }
}

export default function AdminEditLayananPage({ params }: Props) {
  return <EditLayananView layananId={params.id} />
}
