import { EventListClient } from "@/features/event/components/client/EventListClient"

export const metadata = {
  title: "Event & Workshop – Empathika",
  description: "Rangkaian kegiatan webinar, workshop, event aktif, dan riwayat kegiatan dari Empathika.",
}

export default function EventPage() {
  return <EventListClient />
}
