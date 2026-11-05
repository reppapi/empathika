"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { useTenantContext } from "@/context/TenantContext"
import { ASESMEN_PACKAGES, type AsesmenPackage } from "../data/asesmenData"
import { getStoredLayanan } from "@/features/layanan/data/adminLayananData"

export function useAsesmenClient() {
  const searchParams = useSearchParams()
  const paketParam = searchParams.get("paket")
  const metodeParam = searchParams.get("metode")
  const hariParam = searchParams.get("hari") || searchParams.get("plan")
  const bannerParam = searchParams.get("banner")
  const { withBiro } = useTenantContext()

  // State asesmen aktif
  const [selectedAsesmenId, setSelectedAsesmenId] = useState<string>("asesmen-minat-bakat")
  // State metode pelaksanaan: "offline" | "online"
  const [metode, setMetode] = useState<"offline" | "online">("offline")

  // State tanggal sesi tatap muka (offline)
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    d.setHours(0, 0, 0, 0)
    return d
  })

  // State paket offline: "weekday" | "weekend"
  const [selectedOfflinePlan, setSelectedOfflinePlan] = useState<"weekday" | "weekend">(
    hariParam?.toLowerCase() === "weekend" ? "weekend" : "weekday"
  )
  // State paket online: "gratis" | "berbayar"
  const [selectedOnlinePlan, setSelectedOnlinePlan] = useState<"gratis" | "berbayar">("berbayar")
  // State banner kustom dari dashboard admin layanan
  const [customBanner, setCustomBanner] = useState<string | null>(bannerParam || null)

  // Handler memilih tanggal & sinkronisasi otomatis ke paket harga
  const handleSelectDate = (newDate: Date) => {
    setSelectedDate(newDate)
    const day = newDate.getDay() // 0 = Minggu, 6 = Sabtu
    if (day === 0 || day === 6) {
      setSelectedOfflinePlan("weekend")
    } else {
      setSelectedOfflinePlan("weekday")
    }
  }

  // Handler memilih paket harga & menyesuaikan tanggal terdekat
  const handleSelectOfflinePlan = (plan: "weekday" | "weekend") => {
    setSelectedOfflinePlan(plan)
    const currentDay = selectedDate.getDay()
    const isCurrentWeekend = currentDay === 0 || currentDay === 6
    if (plan === "weekend" && !isCurrentWeekend) {
      const nextSat = new Date(selectedDate)
      const diff = (6 - currentDay + 7) % 7 || 7
      nextSat.setDate(selectedDate.getDate() + diff)
      setSelectedDate(nextSat)
    } else if (plan === "weekday" && isCurrentWeekend) {
      const nextMon = new Date(selectedDate)
      const diff = currentDay === 6 ? 2 : 1
      nextMon.setDate(selectedDate.getDate() + diff)
      setSelectedDate(nextMon)
    }
  }

  // Inisialisasi paket asesmen, metode, & hari dari search parameters
  useEffect(() => {
    if (paketParam) {
      const normalized = paketParam.toLowerCase().replace(/\s+/g, "-")
      const matched = ASESMEN_PACKAGES.find(
        (a) =>
          a.id.toLowerCase() === normalized ||
          a.title.toLowerCase() === paketParam.toLowerCase() ||
          a.title.toLowerCase().includes(paketParam.toLowerCase()) ||
          a.shortTitle.toLowerCase() === paketParam.toLowerCase()
      )
      if (matched) {
        setSelectedAsesmenId(matched.id)
      }
    }

    if (metodeParam) {
      const m = metodeParam.toLowerCase()
      if (m === "online" || m === "offline") {
        setMetode(m)
      }
    }

    if (hariParam) {
      const h = hariParam.toLowerCase()
      if (h === "weekday" || h === "weekend") {
        setSelectedOfflinePlan(h)
      }
    }
  }, [paketParam, metodeParam, hariParam])

  // Dapatkan data detail paket asesmen terpilih
  const selectedAsesmen: AsesmenPackage = useMemo(() => {
    return (
      ASESMEN_PACKAGES.find((a) => a.id === selectedAsesmenId) ||
      ASESMEN_PACKAGES[0]
    )
  }, [selectedAsesmenId])

  // Cek apakah Admin telah memasukkan foto awal / banner khusus di dashboard admin layanan
  useEffect(() => {
    const syncAdminBanner = () => {
      try {
        const list = getStoredLayanan()
        const targetTitle = selectedAsesmen.title.toLowerCase().trim()
        const match = list.find((item) => {
          const name = item.layanan.toLowerCase().trim()
          return name === targetTitle || name.includes(targetTitle) || targetTitle.includes(name)
        })

        if (match?.bannerUrl?.trim()) {
          setCustomBanner(match.bannerUrl.trim())
          return
        }
      } catch (err) {
        console.error("Gagal memuat banner kustom admin:", err)
      }

      if (bannerParam) {
        setCustomBanner(bannerParam)
        return
      }

      setCustomBanner(null)
    }

    syncAdminBanner()

    if (typeof window !== "undefined") {
      window.addEventListener("storage", syncAdminBanner)
      return () => window.removeEventListener("storage", syncAdminBanner)
    }
  }, [selectedAsesmen.title, bannerParam])

  const activeHeroImage = customBanner || bannerParam || selectedAsesmen.image

  // URL checkout sesi tatap muka (offline) -> diarahkan ke pemilihan jadwal terlebih dahulu
  const offlineCheckoutUrl = useMemo(() => {
    const planName = selectedOfflinePlan === "weekday" ? "weekday" : "weekend"
    return withBiro(
      `/asesmen/jadwal?paket=${encodeURIComponent(selectedAsesmen.id)}&layanan=${encodeURIComponent(selectedAsesmen.title)}&hari=${encodeURIComponent(planName)}&metode=offline`
    )
  }, [selectedAsesmen.id, selectedAsesmen.title, selectedOfflinePlan, withBiro])

  // URL checkout sesi digital (online)
  const onlineCheckoutUrl = useMemo(() => {
    return withBiro(
      `/psikotes/checkout?testId=${selectedAsesmen.id}&judul=${encodeURIComponent(selectedAsesmen.title + " (Online)")}&harga=${encodeURIComponent(selectedAsesmen.onlinePrice)}&kategori=Asesmen&subjudul=${encodeURIComponent(selectedAsesmen.subtitle)}`
    )
  }, [
    selectedAsesmen.id,
    selectedAsesmen.title,
    selectedAsesmen.onlinePrice,
    selectedAsesmen.subtitle,
    withBiro,
  ])

  return {
    selectedAsesmen,
    metode,
    setMetode,
    selectedDate,
    setSelectedDate: handleSelectDate,
    selectedOfflinePlan,
    setSelectedOfflinePlan: handleSelectOfflinePlan,
    selectedOnlinePlan,
    setSelectedOnlinePlan,
    activeHeroImage,
    offlineCheckoutUrl,
    onlineCheckoutUrl,
    withBiro,
  }
}

