import AdminEventDetailClient from "@/features/admin/event/components/AdminEventDetailClient"

interface Props {
  params: { id: string }
}

export default function AdminEventDetailPage({ params }: Props) {
  return <AdminEventDetailClient eventId={params.id} />
}
