import EventDetailClient from "@/features/event/components/client/EventDetailClient"
import WorkshopDetailClient from "@/features/event/components/client/WorkshopDetailClient"
import GoesToSchoolDetailClient from "@/features/event/components/client/GoesToSchoolDetailClient"
import { INITIAL_ADMIN_EVENTS } from "@/features/event/data/adminEventData"

interface PageProps {
  params: { id: string }
}

export default function EventDetailPage({ params }: PageProps) {
  const { id } = params

  // Cari data event dari data terpusat
  const event = INITIAL_ADMIN_EVENTS.find((e) => e.id === id)

  // Goes To School (id=4 atau slug)
  if (id === "4" || id === "goes-to-school" || id === "egts") {
    return <GoesToSchoolDetailClient id={id} event={event} />
  }

  // Workshop SEFT (id=1)
  if (id === "1" || id === "workshop" || id === "2") {
    return <WorkshopDetailClient id={id} event={event} />
  }

  // Default — Seminar (id=3 dst)
  return <EventDetailClient id={id} event={event} />
}
