import { Suspense } from "react"
import { EventListClient } from "@/features/event/components/client/EventListClient"

export const metadata = {
  title: "Event & Workshop – Empathika",
  description: "Rangkaian kegiatan webinar, workshop, event aktif, dan riwayat kegiatan dari Empathika.",
}

export default function EventPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FDFBF9] pt-28" />}>
      <EventListClient />
    </Suspense>
  )
}
