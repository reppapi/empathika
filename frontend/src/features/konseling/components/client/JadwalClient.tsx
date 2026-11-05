"use client"

import { useSearchParams } from "next/navigation"
import { BookingJadwalShared } from "@/components/shared/BookingJadwalShared"
import { ASESMEN_PACKAGES } from "@/features/asesmen/data/asesmenData"

export default function JadwalClient() {
  const searchParams = useSearchParams()
  const mode = searchParams?.get("mode") === "asesmen" ? "asesmen" : "konseling"
  const paketParam = searchParams?.get("paket")
  const hariParam = searchParams?.get("hari") === "weekend" ? "weekend" : "weekday"

  const selectedAsesmen = paketParam
    ? ASESMEN_PACKAGES.find(
        (p) =>
          p.id.toLowerCase() === paketParam.toLowerCase() ||
          p.title.toLowerCase().includes(paketParam.toLowerCase()) ||
          paketParam.toLowerCase().includes(p.id.toLowerCase())
      ) || ASESMEN_PACKAGES[0]
    : undefined

  return (
    <BookingJadwalShared
      mode={mode}
      asesmenPackage={selectedAsesmen}
      initialOfflinePlan={hariParam}
    />
  )
}
