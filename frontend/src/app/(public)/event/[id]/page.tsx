import EventDetailClient from "@/features/event/components/EventDetailClient"
import WorkshopDetailClient from "@/features/event/components/WorkshopDetailClient"
import GoesToSchoolDetailClient from "@/features/event/components/GoesToSchoolDetailClient"

interface PageProps {
  params: { id: string }
}

export default function EventDetailPage({ params }: PageProps) {
  const { id } = params

  if (id === "2" || id === "workshop") {
    return <WorkshopDetailClient />
  }

  if (id === "3" || id === "goes-to-school" || id === "egts") {
    return <GoesToSchoolDetailClient />
  }

  // Default atau id === "1" adalah Seminar
  return <EventDetailClient />
}
