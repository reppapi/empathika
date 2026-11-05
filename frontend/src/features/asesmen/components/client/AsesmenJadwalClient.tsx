"use client"

import { useSearchParams } from "next/navigation"
import { BookingJadwalShared } from "@/components/shared/BookingJadwalShared"
import { ASESMEN_PACKAGES } from "../../data/asesmenData"

export default function AsesmenJadwalClient() {
  const searchParams = useSearchParams()
  const paketParam = searchParams?.get("paket") || "asesmen-minat-bakat"
  const hariParam = searchParams?.get("hari") === "weekend" ? "weekend" : "weekday"

  const selectedAsesmen =
    ASESMEN_PACKAGES.find(
      (p) =>
        p.id.toLowerCase() === paketParam.toLowerCase() ||
        p.title.toLowerCase().includes(paketParam.toLowerCase()) ||
        paketParam.toLowerCase().includes(p.id.toLowerCase())
    ) || ASESMEN_PACKAGES[0]

  return (
    <BookingJadwalShared
      mode="asesmen"
      showStepper={true}
      title="Jadwalkan layanan anda"
      subtitle="Pilih metode dan jadwal sesi asesmen tatap muka yang Anda inginkan. Slot waktu hanya dapat dipilih jika telah dibuka oleh admin klinik."
      asesmenPackage={selectedAsesmen}
      initialMetode="Offline"
      initialOfflinePlan={hariParam}
    />
  )
}

