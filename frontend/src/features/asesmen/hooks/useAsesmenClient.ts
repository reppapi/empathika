"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { useTenantContext } from "@/context/TenantContext"
import { ASESMEN_PACKAGES, type AsesmenPackage } from "../data/asesmenData"
import { getStoredLayanan } from "@/features/layanan/data/adminLayananData"
import { layananService, type LayananApiResponse } from "@/services/layanan.service"

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

  // State layanan dari backend database
  const [backendLayanan, setBackendLayanan] = useState<LayananApiResponse[]>([])
  const [isLoadingBackend, setIsLoadingBackend] = useState<boolean>(true)

  // Fetch real-time data layanan kategori ASESMEN dari backend database
  const fetchBackendAsesmen = useCallback(() => {
    layananService
      .getAll({ kategori: "ASESMEN" })
      .then((res: any) => {
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        if (list.length > 0) {
          setBackendLayanan(list)
        }
      })
      .catch((err) => {
        console.warn("useAsesmenClient: Gagal memuat layanan asesmen dari backend:", err?.message)
      })
      .finally(() => {
        setIsLoadingBackend(false)
      })
  }, [])

  useEffect(() => {
    fetchBackendAsesmen()

    const handleUpdated = () => {
      fetchBackendAsesmen()
    }

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleUpdated)
      window.addEventListener("layanan_updated", handleUpdated)
      return () => {
        window.removeEventListener("storage", handleUpdated)
        window.removeEventListener("layanan_updated", handleUpdated)
      }
    }
  }, [fetchBackendAsesmen])

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

  // Temukan item konfigurasi layanan dari Backend atau LocalStorage
  const matchedService = useMemo(() => {
    const base =
      ASESMEN_PACKAGES.find((a) => a.id === selectedAsesmenId) ||
      ASESMEN_PACKAGES[0]
    const targetTitle = base.title.toLowerCase().trim()
    const targetId = base.id.toLowerCase().trim()

    // 1. Cek di daftar backend database terlebih dahulu
    if (backendLayanan.length > 0) {
      const found = backendLayanan.find((item: any) => {
        if (item.aktif === false || item.status === "Nonaktif") return false
        const name = (item.nama || item.layanan || "").toLowerCase().trim()
        const id = (item.id || "").toLowerCase().trim()
        return (
          id === targetId ||
          name === targetTitle ||
          name.includes(targetTitle) ||
          targetTitle.includes(name)
        )
      })
      if (found) return found
    }

    // 2. Fallback ke local storage admin data jika database belum siap
    try {
      const stored = getStoredLayanan()
      const found = stored.find((item: any) => {
        if (item.status === "Nonaktif" || item.aktif === false) return false
        const name = (item.layanan || item.nama || "").toLowerCase().trim()
        const id = (String(item.id) || "").toLowerCase().trim()
        return (
          id === targetId ||
          name === targetTitle ||
          name.includes(targetTitle) ||
          targetTitle.includes(name)
        )
      })
      if (found) return found
    } catch {}

    return null
  }, [selectedAsesmenId, backendLayanan])

  // Dapatkan data detail paket asesmen terpilih (Harga dan Konten selalu mengikuti Inputan Admin)
  const selectedAsesmen: AsesmenPackage = useMemo(() => {
    const base =
      ASESMEN_PACKAGES.find((a) => a.id === selectedAsesmenId) ||
      ASESMEN_PACKAGES[0]

    if (!matchedService) return base

    const m = matchedService as any
    const t = m.tarif_tenaga_ahli || {}

    // Ambil harga dari inputan admin:
    const onlineVal =
      m.tarif_asesmen?.online ??
      t?.asesmen?.online ??
      t?.online ??
      ((m.metode || "").toLowerCase().includes("online") && !(m.metode || "").toLowerCase().includes("offline")
        ? m.harga_weekday
        : null)

    const offlineWk =
      m.tarif_asesmen?.offline_weekday ??
      t?.asesmen?.offline?.weekday ??
      t?.offline?.weekday ??
      m.harga_weekday ??
      m.weekday

    const offlineWknd =
      m.tarif_asesmen?.offline_weekend ??
      t?.asesmen?.offline?.weekend ??
      t?.offline?.weekend ??
      m.harga_weekend ??
      m.weekend

    const formatRp = (val: any, fallbackStr: string): string => {
      if (val === undefined || val === null || val === "") return fallbackStr
      const str = String(val).trim()
      if (str.startsWith("Rp")) return str
      const num = Number(str.replace(/[^\d]/g, ""))
      if (isNaN(num) || num <= 0) return fallbackStr
      return `Rp ${num.toLocaleString("id-ID")}`
    }

    return {
      ...base,
      subtitle: m.deskripsi ? m.deskripsi.split("\n")[0] : base.subtitle,
      description: m.deskripsi || base.description,
      onlinePrice: formatRp(onlineVal, base.onlinePrice),
      weekday: formatRp(offlineWk, base.weekday),
      weekend: formatRp(offlineWknd, base.weekend),
    }
  }, [selectedAsesmenId, matchedService])

  // Cek apakah Admin telah memasukkan foto awal / banner khusus di dashboard admin layanan
  useEffect(() => {
    const rawBanner = (matchedService as any)?.banner_url || (matchedService as any)?.bannerUrl
    if (typeof rawBanner === "string" && rawBanner.trim()) {
      setCustomBanner(rawBanner.trim())
      return
    }
    if (bannerParam) {
      setCustomBanner(bannerParam)
      return
    }
    setCustomBanner(null)
  }, [matchedService, bannerParam])

  const activeHeroImage = customBanner || bannerParam || selectedAsesmen.image

  // Batasan metode yang didukung oleh layanan asesmen terpilih (Online / Offline / Keduanya)
  // Sepenuhnya mencerminkan inputan Admin di database
  const allowedMetode = useMemo(() => {
    if (matchedService?.metode) {
      const m = String(matchedService.metode).toLowerCase().trim()
      const hasOnline = m.includes("online") || m.includes("keduanya") || m === "semua"
      const hasOffline = m.includes("offline") || m.includes("keduanya") || m === "semua"
      return { online: hasOnline, offline: hasOffline }
    }
    return { online: true, offline: true }
  }, [matchedService])

  // Sinkronkan metode otomatis jika metode aktif tidak didukung oleh pengaturan layanan admin
  useEffect(() => {
    if (allowedMetode.online && !allowedMetode.offline) {
      if (metode !== "online") setMetode("online")
    } else if (!allowedMetode.online && allowedMetode.offline) {
      if (metode !== "offline") setMetode("offline")
    }
  }, [allowedMetode, metode])

  // URL checkout sesi tatap muka (offline) -> diarahkan ke pemilihan jadwal terlebih dahulu
  const offlineCheckoutUrl = useMemo(() => {
    const planName = selectedOfflinePlan === "weekday" ? "weekday" : "weekend"
    const priceVal = selectedOfflinePlan === "weekday" ? selectedAsesmen.weekday : selectedAsesmen.weekend
    return withBiro(
      `/asesmen/jadwal?paket=${encodeURIComponent(selectedAsesmen.id)}&layanan=${encodeURIComponent(selectedAsesmen.title)}&hari=${encodeURIComponent(planName)}&harga=${encodeURIComponent(priceVal)}&metode=offline`
    )
  }, [selectedAsesmen.id, selectedAsesmen.title, selectedAsesmen.weekday, selectedAsesmen.weekend, selectedOfflinePlan, withBiro])

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
    allowsOnline: allowedMetode.online,
    allowsOffline: allowedMetode.offline,
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

