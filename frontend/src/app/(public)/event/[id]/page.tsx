"use client"

import { useState, useEffect } from "react"
import EventDetailClient from "@/features/event/components/client/EventDetailClient"
import WorkshopDetailClient from "@/features/event/components/client/WorkshopDetailClient"
import GoesToSchoolDetailClient from "@/features/event/components/client/GoesToSchoolDetailClient"
import { AdminEventData, mapApiToAdminEvent } from "@/features/event/data/adminEventData"
import { eventService } from "@/services/event.service"

interface PageProps {
  params: { id: string }
}

export default function EventDetailPage({ params }: PageProps) {
  const { id } = params
  const [event, setEvent] = useState<AdminEventData | undefined>(undefined)

  useEffect(() => {
    // Jika ID bukan slug statis (workshop/goes-to-school/seminar), ambil data dari API
    if (id !== "workshop" && id !== "goes-to-school" && id !== "seminar" && id !== "1" && id !== "2" && id !== "3" && id !== "4") {
      eventService
        .getById(id)
        .then((res) => {
          if (res?.data) {
            setEvent(mapApiToAdminEvent(res.data))
          }
        })
        .catch(() => {})
    }
  }, [id])

  // Goes To School (id=3 dari card ke-3 layanan, id=4, atau slug goes-to-school / egts)
  if (
    id === "goes-to-school" ||
    id === "egts" ||
    id === "3" ||
    id === "4" ||
    event?.judul?.toLowerCase().includes("goes to school") ||
    event?.subjudul?.toLowerCase().includes("goes to school")
  ) {
    return <GoesToSchoolDetailClient id={id} event={event} />
  }

  // Workshop (id=2 dari card ke-2 layanan, slug workshop, atau jenis Workshop)
  if (
    id === "workshop" ||
    id === "2" ||
    id === "1" ||
    event?.jenis === "Workshop" ||
    event?.judul?.toLowerCase().includes("workshop")
  ) {
    return <WorkshopDetailClient id={id} event={event} />
  }

  // Default — Seminar (id=seminar atau jenis Seminar / Webinar)
  return <EventDetailClient id={id} event={event} />
}
