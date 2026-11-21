"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { useTenantContext } from "@/context/TenantContext"
import { buildAsesmenPackageFromLayanan, type AsesmenPackage } from "../data/asesmenData"
import { layananService, type LayananApiResponse } from "@/services/layanan.service"

export function useAsesmenClient() {
  const searchParams = useSearchParams()
  const paketParam = searchParams.get("paket")
  const metodeParam = searchParams.get("metode")
  const hariParam = searchParams.get("hari") || searchParams.get("plan")
  const bannerParam = searchParams.get("banner")
  const { withBiro } = useTenantContext()

  // State metode pelaksanaan: "offline" | "online"
  const [metode, setMetode] = useState<"offline" | "online">("offline")

  // State layanan dari backend database
  const [backendLayanan, setBackendLayanan] = useState<LayananApiResponse[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isError, setIsError] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Ambil nama paket / layanan target dari search parameters
  const rawTargetName = useMemo(() => {
    const fromParam =
      searchParams.get("paket") ||
      searchParams.get("layanan") ||
      searchParams.get("title") ||
      searchParams.get("nama") ||
      ""
    return fromParam.trim()
  }, [searchParams])

  // Fetch real-time data layanan kategori ASESMEN dari backend database
  const fetchBackendAsesmen = useCallback(() => {
    setIsLoading(true)
    setIsError(false)
    setErrorMessage(null)

    layananService
      .getAll({ kategori: "ASESMEN" })
      .then((res: any) => {
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        setBackendLayanan(list)

        const activeList = list.filter(
          (item: any) => item.aktif !== false && item.status !== "Nonaktif"
        )

        if (activeList.length === 0) {
          setIsError(true)
          setErrorMessage("Belum ada layanan asesmen yang aktif di database.")
          return
        }

        if (rawTargetName) {
          const targetQuery = rawTargetName.toLowerCase().trim()
          const cleanTarget = targetQuery.replace(/asesmen/g, "").replace(/[^a-z0-9]/g, "")
          const exists = activeList.some((item: any) => {
            const name = (item.nama || item.layanan || "").toLowerCase().trim()
            const id = String(item.id || "").toLowerCase().trim()
            if (id === targetQuery || name === targetQuery) return true
            if (name.includes(targetQuery) || targetQuery.includes(name)) return true
            const cleanName = name.replace(/asesmen/g, "").replace(/[^a-z0-9]/g, "")
            if (cleanTarget && cleanName && (cleanName.includes(cleanTarget) || cleanTarget.includes(cleanName))) return true
            return false
          })

          if (!exists) {
            setIsError(true)
            setErrorMessage(`Layanan asesmen "${rawTargetName}" tidak ditemukan atau telah dinonaktifkan oleh admin.`)
          }
        }
      })
      .catch((err: any) => {
        console.warn("useAsesmenClient: Gagal memuat layanan asesmen dari backend:", err?.message)
        setIsError(true)
        setErrorMessage("Terjadi kendala saat menghubungkan ke database server. Silakan muat ulang atau periksa koneksi Anda.")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [rawTargetName])

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
  // State banner kustom
  const [customBanner, setCustomBanner] = useState<string | null>(bannerParam || null)

  // Inisialisasi metode & hari dari search parameters
  useEffect(() => {
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
  }, [metodeParam, hariParam])

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

  // Temukan item konfigurasi layanan dari Backend database murni
  const matchedService = useMemo(() => {
    if (backendLayanan.length === 0) return null

    const activeList = backendLayanan.filter(
      (item: any) => item.aktif !== false && item.status !== "Nonaktif"
    )
    if (activeList.length === 0) return null

    if (!rawTargetName) {
      return activeList[0]
    }

    const targetQuery = rawTargetName.toLowerCase().trim()
    const cleanTarget = targetQuery.replace(/asesmen/g, "").replace(/[^a-z0-9]/g, "")

    const found = activeList.find((item: any) => {
      const name = (item.nama || item.layanan || "").toLowerCase().trim()
      const id = String(item.id || "").toLowerCase().trim()
      if (id === targetQuery || name === targetQuery) return true
      if (name.includes(targetQuery) || targetQuery.includes(name)) return true
      const cleanName = name.replace(/asesmen/g, "").replace(/[^a-z0-9]/g, "")
      if (cleanTarget && cleanName && (cleanName.includes(cleanTarget) || cleanTarget.includes(cleanName))) return true
      return false
    })

    return found || null
  }, [backendLayanan, rawTargetName])

  // Dapatkan data detail paket asesmen terpilih (murni dibangun dari database)
  const selectedAsesmen: AsesmenPackage | null = useMemo(() => {
    if (!matchedService) return null
    return buildAsesmenPackageFromLayanan(matchedService)
  }, [matchedService])

  // Update banner kustom jika ada di database
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

  const activeHeroImage = customBanner || bannerParam || selectedAsesmen?.image || ""

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
    if (!selectedAsesmen) return "#"
    const planName = selectedOfflinePlan === "weekday" ? "weekday" : "weekend"
    const priceVal = selectedOfflinePlan === "weekday" ? selectedAsesmen.weekday : selectedAsesmen.weekend
    return withBiro(
      `/asesmen/jadwal?paket=${encodeURIComponent(selectedAsesmen.id)}&layanan=${encodeURIComponent(selectedAsesmen.title)}&hari=${encodeURIComponent(planName)}&harga=${encodeURIComponent(priceVal)}&weekday=${encodeURIComponent(selectedAsesmen.weekday)}&weekend=${encodeURIComponent(selectedAsesmen.weekend)}&metode=offline`
    )
  }, [selectedAsesmen, selectedOfflinePlan, withBiro])

  // URL checkout sesi digital (online)
  const onlineCheckoutUrl = useMemo(() => {
    if (!selectedAsesmen) return "#"
    return withBiro(
      `/psikotes/checkout?testId=${selectedAsesmen.id}&judul=${encodeURIComponent(selectedAsesmen.title + " (Online)")}&harga=${encodeURIComponent(selectedAsesmen.onlinePrice)}&kategori=Asesmen&subjudul=${encodeURIComponent(selectedAsesmen.subtitle)}`
    )
  }, [selectedAsesmen, withBiro])

  return {
    selectedAsesmen,
    isLoading,
    isError,
    errorMessage,
    refetch: fetchBackendAsesmen,
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
