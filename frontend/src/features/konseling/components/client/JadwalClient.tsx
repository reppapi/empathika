"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { BookingJadwalShared } from "@/components/shared/BookingJadwalShared"
import { buildAsesmenPackageFromLayanan, type AsesmenPackage } from "@/features/asesmen/data/asesmenData"
import { layananService } from "@/services/layanan.service"

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

  const [asesmenPackage, setAsesmenPackage] = useState<AsesmenPackage | undefined>(undefined)

  useEffect(() => {
    if (!isAsesmen && !paketParam) return

    layananService
      .getAll({ kategori: "ASESMEN" })
      .then((res: any) => {
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        const activeList = list.filter((item: any) => item.aktif !== false && item.status !== "Nonaktif")
        if (activeList.length === 0) return

        const target = (paketParam || layananParam || "").toLowerCase().trim()
        const matched = activeList.find((item: any) => {
          const name = (item.nama || item.layanan || "").toLowerCase().trim()
          const id = String(item.id || "").toLowerCase().trim()
          return id === target || name === target || name.includes(target) || target.includes(name)
        }) || activeList[0]

        if (matched) {
          setAsesmenPackage(buildAsesmenPackageFromLayanan(matched))
        }
      })
      .catch(() => {})
  }, [isAsesmen, paketParam, layananParam])

  return (
    <BookingJadwalShared
      mode={mode}
      asesmenPackage={asesmenPackage}
      initialOfflinePlan={hariParam}
    />
  )
}
