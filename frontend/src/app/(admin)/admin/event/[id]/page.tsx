import AdminEventDetailClient from "@/features/event/components/admin/AdminEventDetailClient"

interface Props {
  params: { id: string }
}

export default function AdminEventDetailPage({ params }: Props) {
  return <AdminEventDetailClient eventId={params.id} />
}
