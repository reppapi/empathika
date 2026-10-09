import AdminEventFormClient from "@/features/admin/event/components/AdminEventFormClient"

interface Props {
  params: { id: string }
}

export const metadata = {
  title: "Edit Event - Admin Empathika",
  description: "Halaman edit event Empathika",
}

export default function AdminEditEventPage({ params }: Props) {
  return <AdminEventFormClient eventId={params.id} />
}
