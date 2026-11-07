"use client"

import { useSearchParams } from "next/navigation"
import { BookingJadwalShared } from "@/components/shared/BookingJadwalShared"
import { ASESMEN_PACKAGES } from "@/features/asesmen/data/asesmenData"

export default function JadwalClient() {
  const searchParams = useSearchParams()
  const paketParam = searchParams?.get("paket")
  const layananParam = searchParams?.get("layanan")
  const isAsesmen =
    searchParams?.get("mode") === "asesmen" ||
    Boolean(paketParam && (paketParam.toLowerCase().includes("asesmen") || paketParam.toLowerCase().includes("bakat") || paketParam.toLowerCase().includes("iq"))) ||
    Boolean(layananParam && layananParam.toLowerCase().includes("asesmen"))
  const mode = isAsesmen ? "asesmen" : "konseling"
  const hariParam = searchParams?.get("hari") === "weekend" ? "weekend" : "weekday"

  const selectedAsesmen = (isAsesmen || paketParam)
    ? (paketParam
        ? ASESMEN_PACKAGES.find(
            (p) =>
              p.id.toLowerCase() === paketParam.toLowerCase() ||
              p.title.toLowerCase().includes(paketParam.toLowerCase()) ||
              paketParam.toLowerCase().includes(p.id.toLowerCase())
          )
        : (layananParam
            ? ASESMEN_PACKAGES.find(
                (p) =>
                  p.title.toLowerCase().includes(layananParam.toLowerCase()) ||
                  layananParam.toLowerCase().includes(p.title.toLowerCase())
              )
            : undefined)) || ASESMEN_PACKAGES[0]
    : undefined

  return (
    <BookingJadwalShared
      mode={mode}
      asesmenPackage={selectedAsesmen}
      initialOfflinePlan={hariParam}
    />
  )
}
