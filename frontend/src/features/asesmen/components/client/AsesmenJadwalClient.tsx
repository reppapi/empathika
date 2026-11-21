"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { BookingJadwalShared } from "@/components/shared/BookingJadwalShared"
import { ASESMEN_PACKAGES } from "../../data/asesmenData"
import { layananService, type LayananApiResponse } from "@/services/layanan.service"
import { getStoredLayanan } from "@/features/layanan/data/adminLayananData"

export default function AsesmenJadwalClient() {
  const searchParams = useSearchParams()
  const paketParam = searchParams?.get("paket") || "asesmen-minat-bakat"
  const layananParam = searchParams?.get("layanan") || ""
  const hariParam = searchParams?.get("hari") === "weekend" ? "weekend" : "weekday"
  const hargaParam = searchParams?.get("harga") || ""
  const weekdayParam = searchParams?.get("weekday") || ""
  const weekendParam = searchParams?.get("weekend") || ""

  const [backendLayanan, setBackendLayanan] = useState<LayananApiResponse[]>([])

  useEffect(() => {
    layananService
      .getAll({ kategori: "ASESMEN" })
      .then((res: any) => {
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        if (list.length > 0) {
          setBackendLayanan(list)
        }
      })
      .catch(() => {})
  }, [])

  const baseAsesmen = useMemo(() => {
    const rawTarget = (layananParam || paketParam || "").toLowerCase().trim()
    return (
      ASESMEN_PACKAGES.find(
        (p) =>
          p.id.toLowerCase() === rawTarget ||
          p.title.toLowerCase().includes(rawTarget) ||
          rawTarget.includes(p.id.toLowerCase()) ||
          rawTarget.includes(p.title.toLowerCase())
      ) || ASESMEN_PACKAGES[0]
    )
  }, [layananParam, paketParam])

  // Cari data layanan aktual dari backend atau local storage
  const matchedDbService = useMemo(() => {
    const rawTarget = (layananParam || paketParam || baseAsesmen.title).toLowerCase().trim()

    const isMatch = (item: any) => {
      if (!item) return false
      if (item.aktif === false || item.status === "Nonaktif") return false
      const name = (item.nama || item.layanan || "").toLowerCase().trim()
      const id = String(item.id || "").toLowerCase().trim()
      if (id === rawTarget || name === rawTarget) return true
      if (name.includes(rawTarget) || rawTarget.includes(name)) return true
      const cRaw = rawTarget.replace(/asesmen/g, "").replace(/[^a-z0-9]/g, "")
      const cName = name.replace(/asesmen/g, "").replace(/[^a-z0-9]/g, "")
      return Boolean(cRaw && cName && (cName.includes(cRaw) || cRaw.includes(cName)))
    }

    if (backendLayanan.length > 0) {
      const found = backendLayanan.find(isMatch)
      if (found) return found
      const firstActive = backendLayanan.find((i: any) => i.aktif !== false && i.status !== "Nonaktif")
      if (firstActive) return firstActive
    }

    try {
      const stored = getStoredLayanan().filter((l) => l.kategoriId === "05" || (l as any).kategori === "ASESMEN")
      const found = stored.find(isMatch)
      if (found) return found
      const firstStored = stored.find((i: any) => i.status !== "Nonaktif" && i.aktif !== false)
      if (firstStored) return firstStored
    } catch {}

    return null
  }, [backendLayanan, layananParam, paketParam, baseAsesmen.title])

  const formatRp = (val: any, fallbackStr: string): string => {
    if (val === undefined || val === null || val === "") return fallbackStr
    const str = String(val).trim()
    if (str.startsWith("Rp")) return str
    const num = Number(str.replace(/[^\d]/g, ""))
    if (isNaN(num) || num <= 0) return fallbackStr
    return `Rp ${num.toLocaleString("id-ID")}`
  }

  // Paket asesmen dinamis lengkap dengan harga yang ditentukan oleh Admin
  const dynamicAsesmenPackage = useMemo(() => {
    const m = matchedDbService as any
    const t = m?.tarif_tenaga_ahli || {}

    const dbOfflineWk =
      m?.tarif_asesmen?.offline_weekday ??
      t?.asesmen?.offline?.weekday ??
      t?.offline?.weekday ??
      m?.harga_weekday ??
      m?.weekday

    const dbOfflineWknd =
      m?.tarif_asesmen?.offline_weekend ??
      t?.asesmen?.offline?.weekend ??
      t?.offline?.weekend ??
      m?.harga_weekend ??
      m?.weekend

    const finalWeekday = formatRp(
      weekdayParam || (hariParam === "weekday" && hargaParam ? hargaParam : undefined) || dbOfflineWk,
      baseAsesmen.weekday
    )

    const finalWeekend = formatRp(
      weekendParam || (hariParam === "weekend" && hargaParam ? hargaParam : undefined) || dbOfflineWknd,
      baseAsesmen.weekend
    )

    const resolvedTitle = m?.nama || m?.layanan || layananParam || baseAsesmen.title

    return {
      ...baseAsesmen,
      id: m?.id || baseAsesmen.id,
      title: resolvedTitle,
      shortTitle: resolvedTitle,
      weekday: finalWeekday,
      weekend: finalWeekend,
    }
  }, [matchedDbService, weekdayParam, weekendParam, hariParam, hargaParam, baseAsesmen, layananParam])

  return (
    <BookingJadwalShared
      mode="asesmen"
      showStepper={true}
      title="Jadwalkan layanan anda"
      subtitle="Pilih metode dan jadwal sesi asesmen tatap muka yang Anda inginkan. Slot waktu hanya dapat dipilih jika telah dibuka oleh admin klinik."
      asesmenPackage={dynamicAsesmenPackage}
      initialMetode="Offline"
      initialOfflinePlan={hariParam}
    />
  )
}

