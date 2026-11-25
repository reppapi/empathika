import AdminInternshipFormClient from "@/features/internship/components/admin/AdminInternshipFormClient"

interface Props {
  params: { id: string }
}

export const metadata = {
  title: "Edit Posisi Internship - Admin Empathika",
  description: "Halaman edit posisi lowongan internship Empathika",
}

export default function AdminEditInternshipPage({ params }: Props) {
  return <AdminInternshipFormClient positionId={params.id} />
}
