"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { psikologService, JadwalSlotItem } from "@/services/psikolog.service"
import { layananService } from "@/services/layanan.service"
import { getStoredLayanan } from "@/features/layanan/data/adminLayananData"
import { useTenantContext } from "@/context/TenantContext"

export const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
]

// Helper format YYYY-MM-DD
export function formatDateToKey(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function parseDateParam(param?: string | null): Date | undefined {
  if (!param) return undefined
  try {
    if (param.includes("-")) {
      const parts = param.split("-")
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
        d.setHours(0, 0, 0, 0)
        return isNaN(d.getTime()) ? undefined : d
      }
    }
    if (param.includes("/")) {
      const parts = param.split("/")
      if (parts.length >= 2) {
        const day = parseInt(parts[0], 10)
        const month = parseInt(parts[1], 10) - 1
        const year = parts.length === 3 ? parseInt(parts[2], 10) : new Date().getFullYear()
        const d = new Date(year, month, day)
        d.setHours(0, 0, 0, 0)
        return isNaN(d.getTime()) ? undefined : d
      }
    }
  } catch {}
  return undefined
}

export function extractMinutes(timeStr?: string): number {
  if (!timeStr) return -1
  const match = timeStr.match(/(\d{1,2}):(\d{2})/)
  if (!match) return -1
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10)
}

export interface AvailableProfessionOption {
  id: string
  key: "psikolog" | "konselor" | "peer"
  label: string
  sub: string
  badge: string
  badgeBg: string
  badgeText: string
}

export interface UseJadwalClientOptions {
  mode?: "konseling" | "asesmen"
  tipeJadwal?: "KONSULTASI" | "ASESMEN"
  initialMetode?: string
  asesmenPackage?: {
    id: string
    title: string
    weekday: string
    weekend: string
    shortTitle?: string
    [key: string]: any
  }
  initialDate?: Date
  initialOfflinePlan?: "weekday" | "weekend"
  onDateChange?: (date: Date) => void
  onOfflinePlanChange?: (plan: "weekday" | "weekend") => void
  onMetodeChange?: (metode: string) => void
}

export function useJadwalClient(options?: UseJadwalClientOptions) {
  const searchParams = useSearchParams()
  const { slug } = useTenantContext()

  const rawMode = options?.mode || searchParams?.get("mode")
  const paketParam = searchParams?.get("paket")
  const layananParam = searchParams?.get("layanan")
  const isAsesmen =
    rawMode === "asesmen" ||
    Boolean(options?.asesmenPackage) ||
    Boolean(paketParam && (paketParam.toLowerCase().includes("asesmen") || paketParam.toLowerCase().includes("bakat") || paketParam.toLowerCase().includes("iq"))) ||
    Boolean(layananParam && layananParam.toLowerCase().includes("asesmen"))

  const mode = isAsesmen ? "asesmen" : "konseling"
  const effectiveTipeJadwal = options?.tipeJadwal || (isAsesmen ? "ASESMEN" : "KONSULTASI")

  // Resolusi nama layanan induk (misal: "Pasangan", "Konsultasi Pasangan", dsb.)
  const serviceQueryParam = (options as any)?.serviceName || searchParams?.get("layanan") || searchParams?.get("service") || ""

  const isProfessionName = (name: string) => {
    const n = (name || "").toLowerCase().trim()
    return (
      n === "psikolog" ||
      n === "psikolog klinis" ||
      n === "konselor" ||
      n === "peer konselor" ||
      n === "peer" ||
      n === "p" ||
      n === "k" ||
      n === "pk"
    )
  }

  // State nama layanan induk (bukan nama profesi)
  const [serviceName, setServiceName] = useState<string>(() => {
    if (serviceQueryParam && !isProfessionName(serviceQueryParam)) {
      return serviceQueryParam
    }
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("empathika_last_selected_layanan")
      if (stored && !isProfessionName(stored)) {
        if (mode === "konseling" && stored.toLowerCase().includes("asesmen")) {
          return "Konsultasi Individu"
        }
        return stored
      }
    }
    return mode === "konseling" ? "Konsultasi Individu" : ""
  })

  const [currentServiceData, setCurrentServiceData] = useState<any>(null)

  // Pilihan opsi profesi aktif untuk Box 3
  const initialLayanan = (() => {
    if (isAsesmen) {
      return options?.asesmenPackage?.title || searchParams?.get("layanan") || "Asesmen Minat Bakat"
    }
    const param = searchParams?.get("layanan") || searchParams?.get("profesi") || ""
    if (param && isProfessionName(param)) {
      const p = param.toLowerCase()
      if (p.includes("peer")) return "Peer Konselor"
      if (p.includes("konselor")) return "Konselor"
      return "Psikolog"
    }
    return "Psikolog"
  })()

  const psikologIdParam = searchParams?.get("psikologId") || undefined
  const psikologNameParam = searchParams?.get("psikologName") || undefined
  const tanggalParam = searchParams?.get("tanggal") || searchParams?.get("date") || undefined

  // Batas tanggal hari ini (pukul 00:00:00) agar tanggal masa lalu tidak bisa diklik
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  // Inisialisasi metode: default Offline jika asesmen offline, atau dari props/param
  const [metode, setMetode] = useState(() => {
    if (options?.initialMetode) return options.initialMetode
    const paramMetode = searchParams?.get("metode") || searchParams?.get("metodeKonseling")
    if (paramMetode) {
      return paramMetode.toLowerCase() === "offline" ? "Offline" : "Online"
    }
    return mode === "asesmen" ? "Offline" : "Online"
  })

  const [layanan, setLayanan] = useState(initialLayanan)
  const [isLayananNonaktif, setIsLayananNonaktif] = useState(false)
  const [nonaktifLayananNama, setNonaktifLayananNama] = useState("")

  // Batasan metode yang didukung oleh layanan yang dipilih (Online / Offline / Keduanya)
  const [allowedMethods, setAllowedMethods] = useState<{ online: boolean; offline: boolean }>({
    online: true,
    offline: true,
  })

  // Daftar opsi tenaga ahli/layanan konsultasi yang tersedia berdasarkan harga yang diatur
  const [availableCategories, setAvailableCategories] = useState<AvailableProfessionOption[]>([
    {
      id: "Psikolog",
      key: "psikolog",
      label: "Psikolog Klinis",
      sub: "Konsultasi mendalam dengan psikolog klinis profesional berlisensi STR & SIPP.",
      badge: "P",
      badgeBg: "bg-purple-100",
      badgeText: "text-purple-600",
    },
    {
      id: "Konselor",
      key: "konselor",
      label: "Konselor",
      sub: "Konseling terarah bersama tenaga konselor berpengalaman.",
      badge: "K",
      badgeBg: "bg-yellow-100",
      badgeText: "text-yellow-700",
    },
    {
      id: "Peer Konselor",
      key: "peer",
      label: "Peer Konselor",
      sub: "Pendampingan teman sebaya yang terlatih, nyaman, dan terbuka tanpa stigma.",
      badge: "PK",
      badgeBg: "bg-emerald-100",
      badgeText: "text-emerald-700",
    },
  ])

  // Sinkronisasi ketersediaan metode pelaksanaan, kategori tenaga ahli & status aktif dari data layanan (Backend / Local)
  useEffect(() => {
    let isCancelled = false

    const checkServiceMethod = async () => {
      // Tentukan nama layanan target yang ingin dicocokkan (bukan nama profesi)
      let activeServiceName = ""
      if (serviceQueryParam && !isProfessionName(serviceQueryParam)) {
        activeServiceName = serviceQueryParam
      } else if (serviceName && !isProfessionName(serviceName)) {
        activeServiceName = serviceName
      } else if (typeof window !== "undefined") {
        const stored = localStorage.getItem("empathika_last_selected_layanan")
        if (stored && !isProfessionName(stored)) {
          if (mode === "konseling" && stored.toLowerCase().includes("asesmen")) {
            activeServiceName = "Konsultasi Individu"
          } else if (mode === "asesmen" && (stored.toLowerCase().includes("konsultasi") || stored.toLowerCase().includes("konseling"))) {
            activeServiceName = ""
          } else {
            activeServiceName = stored
          }
        }
      }

      if (!activeServiceName) {
        if (mode === "konseling") {
          activeServiceName = "Konsultasi Individu"
        } else if (mode === "asesmen") {
          activeServiceName = options?.asesmenPackage?.title || options?.asesmenPackage?.shortTitle || "Asesmen Minat Bakat"
        }
      }

      const activeNorm = activeServiceName.toLowerCase().trim()
      let matchedMetode = "Online/Offline"
      let targetService: any = null

      try {
        const categoryFilter = mode === "asesmen" ? "ASESMEN" : "KONSULTASI"
        const res: any = await layananService.getAll({ kategori: categoryFilter })
        const beList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []

        // Fungsi pencocokan cerdas antara nama di database dan target layanan
        const isMatch = (itemNama: string) => {
          if (!itemNama) return false
          const lName = (itemNama || "").toLowerCase().trim()
          if (!activeNorm) {
            return mode === "asesmen"
              ? lName.includes("asesmen") || lName.includes("bakat")
              : lName.includes("individu") || lName.includes("konsultasi")
          }
          if (lName === activeNorm) return true
          if (lName.includes(activeNorm) || activeNorm.includes(lName)) return true
          const lClean = lName.replace(/konsultasi|asesmen/g, "").replace(/[^a-z0-9]/g, "")
          const tClean = activeNorm.replace(/konsultasi|asesmen/g, "").replace(/[^a-z0-9]/g, "")
          return Boolean(lClean && tClean && (lClean === tClean || lClean.includes(tClean) || tClean.includes(lClean)))
        }

        const matched = beList.find((l: any) => isMatch(l.nama))

        // Cek juga di localStorage untuk respon instan antartab
        const storedCategory = mode === "asesmen" ? "05" : "01"
        const stored = getStoredLayanan().filter((l) => l.kategoriId === storedCategory)
        const localMatched = stored.find((l) => isMatch(l.layanan))

        targetService = matched || localMatched

        // Fallback jika belum cocok persis
        if (!targetService) {
          if (mode === "konseling") {
            targetService =
              beList.find((l: any) => l.aktif !== false && (l.nama || "").toLowerCase().includes("individu")) ||
              stored.find((l: any) => l.status !== "Nonaktif" && (l.layanan || "").toLowerCase().includes("individu")) ||
              beList.find((l: any) => l.aktif !== false && (l.metode || "").toLowerCase().includes("online")) ||
              stored.find((l: any) => l.status !== "Nonaktif" && (l.metode || "").toLowerCase().includes("online")) ||
              beList[0] ||
              stored[0] ||
              { nama: "Konsultasi Individu", layanan: "Konsultasi Individu", metode: "Online/Offline", aktif: true }
          } else {
            targetService =
              beList.find((l: any) => l.aktif !== false && isMatch(l.nama)) ||
              stored.find((l: any) => l.status !== "Nonaktif" && isMatch(l.layanan)) ||
              beList.find((l: any) => l.aktif !== false) ||
              stored[0] ||
              beList[0] ||
              { nama: activeServiceName, layanan: activeServiceName, metode: "Online/Offline", aktif: true }
          }
        }

        if (targetService) {
          const resolvedName = targetService.nama || targetService.layanan || activeServiceName
          setServiceName(resolvedName)
          setCurrentServiceData(targetService)
          if (typeof window !== "undefined" && resolvedName) {
            localStorage.setItem("empathika_last_selected_layanan", resolvedName)
          }
        }

        const isNonaktif =
          (matched && (matched.aktif === false || matched.status === "Nonaktif")) ||
          (localMatched && localMatched.status === "Nonaktif")

        if (isNonaktif) {
          setIsLayananNonaktif(true)
          setNonaktifLayananNama(matched?.nama || localMatched?.layanan || activeServiceName)
        } else {
          setIsLayananNonaktif(false)
        }

        if (targetService?.metode) {
          matchedMetode = targetService.metode
        } else if (matched?.metode) {
          matchedMetode = matched.metode
        } else if (localMatched?.metode) {
          matchedMetode = localMatched.metode
        } else {
          matchedMetode = "Online/Offline"
        }
      } catch {
        const storedCategory = mode === "asesmen" ? "05" : "01"
        const stored = getStoredLayanan().filter((l) => l.kategoriId === storedCategory)
        const localMatched = stored.find((l) => {
          if (!activeNorm) {
            return mode === "asesmen"
              ? (l.layanan || "").toLowerCase().includes("bakat")
              : (l.layanan || "").toLowerCase().includes("individu")
          }
          const lName = (l.layanan || "").toLowerCase().trim()
          return lName.includes(activeNorm) || activeNorm.includes(lName)
        })
        targetService =
          localMatched ||
          (mode === "asesmen"
            ? stored.find((l: any) => l.status !== "Nonaktif") || stored[0] || {
                layanan: activeServiceName || "Asesmen Minat Bakat",
                metode: "Online/Offline",
                status: "Aktif",
              }
            : stored.find((l: any) => l.status !== "Nonaktif" && (l.layanan || "").toLowerCase().includes("individu")) ||
              stored[0] || {
                layanan: "Konsultasi Individu",
                metode: "Online/Offline",
                status: "Aktif",
              })
        if (targetService) {
          setServiceName(targetService.layanan || activeServiceName)
          setCurrentServiceData(targetService)
        }
        if (localMatched && localMatched.status === "Nonaktif") {
          setIsLayananNonaktif(true)
          setNonaktifLayananNama(localMatched.layanan)
        }
        matchedMetode = targetService?.metode || "Online/Offline"
      }

      if (isCancelled) return

      // Hitung opsi tenaga ahli yang muncul di Box 3 sesuai konfigurasi harga (tarif_tenaga_ahli)
      if (mode === "konseling" && targetService) {
        const t = targetService.tarif_tenaga_ahli
        const profList: string[] = targetService.profesi_tersedia || []

        const parsePrice = (val: any): number => {
          if (!val && val !== 0) return 0
          if (typeof val === "number") return val
          const cleanStr = String(val).replace(/[,.]00$/, "").replace(/[^0-9]/g, "")
          return parseInt(cleanStr || "0", 10)
        }

        const hasPsi =
          profList.includes("psikolog") ||
          (t?.psikolog && (parsePrice(t.psikolog.weekday) > 0 || parsePrice(t.psikolog.weekend) > 0)) ||
          (!t && (parsePrice(targetService.harga_weekday) > 0 || parsePrice(targetService.harga_weekend) > 0))
        const hasKon =
          profList.includes("konselor") ||
          (t?.konselor && (parsePrice(t.konselor.weekday) > 0 || parsePrice(t.konselor.weekend) > 0))
        const hasPeer =
          profList.includes("peer") ||
          (t?.peer && (parsePrice(t.peer.weekday) > 0 || parsePrice(t.peer.weekend) > 0))

        const dynamicCategories: AvailableProfessionOption[] = []
        if (hasPsi) {
          dynamicCategories.push({
            id: "Psikolog",
            key: "psikolog",
            label: "Psikolog Klinis",
            sub: "Konsultasi mendalam dengan psikolog klinis profesional berlisensi STR & SIPP.",
            badge: "P",
            badgeBg: "bg-purple-100",
            badgeText: "text-purple-600",
          })
        }
        if (hasKon) {
          dynamicCategories.push({
            id: "Konselor",
            key: "konselor",
            label: "Konselor",
            sub: "Konseling terarah bersama tenaga konselor berpengalaman.",
            badge: "K",
            badgeBg: "bg-yellow-100",
            badgeText: "text-yellow-700",
          })
        }
        if (hasPeer) {
          dynamicCategories.push({
            id: "Peer Konselor",
            key: "peer",
            label: "Peer Konselor",
            sub: "Pendampingan teman sebaya yang terlatih, nyaman, dan terbuka tanpa stigma.",
            badge: "PK",
            badgeBg: "bg-emerald-100",
            badgeText: "text-emerald-700",
          })
        }

        const effectiveCategories: AvailableProfessionOption[] = dynamicCategories.length > 0 ? dynamicCategories : [
          {
            id: "Psikolog",
            key: "psikolog",
            label: "Psikolog Klinis",
            sub: "Konsultasi mendalam dengan psikolog klinis profesional berlisensi STR & SIPP.",
            badge: "P",
            badgeBg: "bg-purple-100",
            badgeText: "text-purple-600",
          }
        ]

        setAvailableCategories(effectiveCategories)

        // Validasi dan sinkronkan pilihan profesi aktif dengan kategori yang memiliki tarif
        setLayanan((cur) => {
          const curLower = (cur || "").toLowerCase().trim()
          const matchedCategory = effectiveCategories.find((c) => {
            if (c.key === "psikolog" && (curLower.includes("psikolog") || curLower === "p")) return true
            if (c.key === "konselor" && curLower.includes("konselor") && !curLower.includes("peer")) return true
            if (c.key === "peer" && curLower.includes("peer")) return true
            return c.id.toLowerCase() === curLower || c.label.toLowerCase() === curLower
          })

          if (matchedCategory) {
            return matchedCategory.id
          }
          return effectiveCategories[0].id
        })
      }

      const norm = matchedMetode.toLowerCase()
      const hasOnline = norm.includes("online") || norm === "keduanya" || norm === "semua"
      const hasOffline = norm.includes("offline") || norm === "keduanya" || norm === "semua"

      setAllowedMethods({
        online: hasOnline,
        offline: hasOffline,
      })

      // Jika hanya salah satu metode yang didukung, otomatis sesuaikan metode aktif
      // Namun jika kedua metode didukung (Online & Offline), pertahankan metode yang sedang aktif
      setMetode((currentMetode) => {
        if (hasOnline && !hasOffline) {
          return "Online"
        } else if (!hasOnline && hasOffline) {
          return "Offline"
        } else if (hasOnline && hasOffline) {
          if (currentMetode === "Online" || currentMetode === "Offline") {
            return currentMetode
          }
          return "Online"
        }
        return currentMetode || "Online"
      })
    }

    checkServiceMethod()

    window.addEventListener("focus", checkServiceMethod)
    window.addEventListener("storage", checkServiceMethod)

    return () => {
      isCancelled = true
      window.removeEventListener("focus", checkServiceMethod)
      window.removeEventListener("storage", checkServiceMethod)
    }
  }, [serviceQueryParam, serviceName, mode])

  // Waktu & slot terpilih (hanya boleh terisi jika slot TERSEDIA)
  const [waktu, setWaktu] = useState<string | null>(null)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)

  // Calendar state: default tanggal dari URL param, options, atau hari ini
  const [date, setDate] = useState<Date | undefined>(() => {
    if (options?.initialDate && options.initialDate >= today) return options.initialDate
    const fromParam = parseDateParam(tanggalParam)
    if (fromParam && fromParam >= today) return fromParam
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })

  // State paket offline: weekday vs weekend untuk asesmen
  const [selectedOfflinePlan, setSelectedOfflinePlan] = useState<"weekday" | "weekend">(() => {
    if (options?.initialOfflinePlan) return options.initialOfflinePlan
    const curDate = options?.initialDate || parseDateParam(tanggalParam) || today
    const day = curDate.getDay()
    return day === 0 || day === 6 ? "weekend" : "weekday"
  })

  // Bersihkan seed dummy asesmen lama jika ada di localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("empathika_custom_jadwal_slots")
        if (raw) {
          const list: any[] = JSON.parse(raw)
          if (Array.isArray(list)) {
            const cleaned = list.filter((s: any) => !s.id?.startsWith("seed_asesmen_"))
            if (cleaned.length !== list.length) {
              localStorage.setItem("empathika_custom_jadwal_slots", JSON.stringify(cleaned))
              window.dispatchEvent(new Event("storage"))
            }
          }
        }
      } catch {}
    }
  }, [])

  // Handler pergantian tanggal kalender dengan auto-sinkronisasi paket hari asesmen
  const handleSetDate = (newDate: Date | undefined) => {
    setDate(newDate)
    if (newDate) {
      options?.onDateChange?.(newDate)
      if (mode === "asesmen") {
        const day = newDate.getDay()
        const autoPlan = day === 0 || day === 6 ? "weekend" : "weekday"
        setSelectedOfflinePlan(autoPlan)
        options?.onOfflinePlanChange?.(autoPlan)
      }
    }
  }

  // Handler pergantian paket biaya (weekday/weekend) dengan auto-sesuaikan tanggal
  const handleSetOfflinePlan = (plan: "weekday" | "weekend") => {
    setSelectedOfflinePlan(plan)
    options?.onOfflinePlanChange?.(plan)
    if (date) {
      const currentDay = date.getDay()
      const isCurrentWeekend = currentDay === 0 || currentDay === 6
      if (plan === "weekend" && !isCurrentWeekend) {
        const nextSat = new Date(date)
        const diff = (6 - currentDay + 7) % 7 || 7
        nextSat.setDate(date.getDate() + diff)
        setDate(nextSat)
        options?.onDateChange?.(nextSat)
      } else if (plan === "weekday" && isCurrentWeekend) {
        const nextMon = new Date(date)
        const diff = currentDay === 6 ? 2 : 1
        nextMon.setDate(date.getDate() + diff)
        setDate(nextMon)
        options?.onDateChange?.(nextMon)
      }
    }
  }

  const handleSetMetode = (newMetode: string) => {
    setMetode(newMetode)
    options?.onMetodeChange?.(newMetode)
  }

  // Daftar tanggal yang memiliki slot ketersediaan (untuk indikator titik kalender & auto-jump)
  const [datesWithSlots, setDatesWithSlots] = useState<Date[]>([])
  const [earliestAvailableDate, setEarliestAvailableDate] = useState<Date | null>(null)

  // Dynamic slots dari database backend
  const [availableSlots, setAvailableSlots] = useState<JadwalSlotItem[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [selectedPsikolog, setSelectedPsikolog] = useState<any>(null)

  useEffect(() => {
    if (psikologIdParam && effectiveTipeJadwal !== "ASESMEN") {
      psikologService
        .getBySlug(psikologIdParam)
        .then((res: any) => {
          if (res) setSelectedPsikolog(res)
        })
        .catch(() => {})
    }
  }, [psikologIdParam, effectiveTipeJadwal])

  // Helper: Validasi apakah slot ketersediaan sah untuk layanan dan metode yang dipilih klien
  const isSlotApplicableToService = useCallback(
    (slot: any, service: any, chosenMetode: string): boolean => {
      const defaultLayanan = mode === "asesmen" ? (options?.asesmenPackage?.title || "Asesmen Minat Bakat") : "Konsultasi Individu"
      const defaultAllSlot = mode === "asesmen" ? "semua layanan asesmen" : "semua layanan konsultasi"

      const slotLayanan = (slot.layanan || defaultAllSlot).trim()
      const serviceNameNorm = ((service?.nama || service?.layanan || serviceName || defaultLayanan) as string)
        .toLowerCase()
        .trim()
      const slotLayananNorm = slotLayanan.toLowerCase()

      // 1. Cek kecocokan Layanan:
      // Jika slot dibuka untuk "Semua Layanan ...", slot berlaku umum untuk kategori tersebut.
      // Jika slot dibuka untuk layanan spesifik, namanya harus cocok.
      const isGenericSlot =
        !slotLayanan ||
        slotLayananNorm === defaultAllSlot ||
        slotLayananNorm === "semua layanan" ||
        slotLayananNorm === "semua" ||
        slotLayananNorm === "semua layanan konsultasi" ||
        slotLayananNorm === "semua layanan asesmen" ||
        (mode === "konseling" && slotLayananNorm === "konsultasi") ||
        (mode === "asesmen" && slotLayananNorm === "asesmen")

      if (!isGenericSlot) {
        const matchSpecific =
          slotLayananNorm === serviceNameNorm ||
          slotLayananNorm.includes(serviceNameNorm) ||
          serviceNameNorm.includes(slotLayananNorm)
        if (!matchSpecific) {
          return false
        }
      }

      // 2. Cek apakah Layanan yang dipilih klien memang MENDUKUNG metode slot ini (sesuai aturan Admin):
      const serviceMetode = (service?.metode || "Online/Offline").toLowerCase()
      const serviceSupportsOnline =
        serviceMetode.includes("online") || serviceMetode.includes("keduanya") || serviceMetode === "semua"
      const serviceSupportsOffline =
        serviceMetode.includes("offline") || serviceMetode.includes("keduanya") || serviceMetode === "semua"

      const slotMetode = (slot.metode || "Keduanya").toLowerCase()
      const slotIsOnline = slotMetode.includes("online") || slotMetode === "keduanya" || slotMetode === "semua"
      const slotIsOffline = slotMetode.includes("offline") || slotMetode === "keduanya" || slotMetode === "semua"

      // Jika slot hanya offline, tetapi layanan admin HANYA online (tidak dibuka offline):
      // SLOT TIDAK BOLEH KEBUKA untuk layanan ini!
      if (slotMetode === "offline" && !serviceSupportsOffline) {
        return false
      }

      // Jika slot hanya online, tetapi layanan admin HANYA offline (tidak dibuka online):
      // SLOT TIDAK BOLEH KEBUKA untuk layanan ini!
      if (slotMetode === "online" && !serviceSupportsOnline) {
        return false
      }

      // 3. Cek kecocokan dengan metode yang sedang dipilih oleh klien di UI:
      const targetMetode = chosenMetode.toLowerCase()
      if (targetMetode === "online") {
        if (!slotIsOnline || !serviceSupportsOnline) return false
      } else if (targetMetode === "offline") {
        if (!slotIsOffline || !serviceSupportsOffline) return false
      }

      return true
    },
    [mode, serviceName, options?.asesmenPackage?.title]
  )

  // Deteksi semua tanggal yang memiliki slot jadwal
  useEffect(() => {
    let isCancelled = false

    const loadAllAvailableDates = async () => {
      const datesFound = new Set<string>()

      const now = new Date()
      const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
      const currentMinutes = now.getHours() * 60 + now.getMinutes()

      // 1. Ambil seluruh slot ketersediaan dari Backend Database
      try {
        const slots = await psikologService.getJadwalTersedia({
          id_psikolog: effectiveTipeJadwal === "ASESMEN" ? undefined : psikologIdParam,
          tipe_jadwal: effectiveTipeJadwal,
        })
        if (Array.isArray(slots)) {
          slots.forEach((s) => {
            if (s.tanggal && s.status === "TERSEDIA") {
              if (!isSlotApplicableToService(s, currentServiceData, metode)) return
              if (s.tanggal > todayKey) {
                datesFound.add(s.tanggal)
              } else if (s.tanggal === todayKey) {
                const startMinutes = extractMinutes(s.jam_mulai)
                if (startMinutes !== -1 && currentMinutes < startMinutes) {
                  datesFound.add(s.tanggal)
                }
              }
            }
          })
        }
      } catch {}

      if (isCancelled) return

      const sortedDateStrings = Array.from(datesFound).sort()
      const dateObjects: Date[] = []
      let earliest: Date | null = null

      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      for (const dStr of sortedDateStrings) {
        const parts = dStr.split("-")
        if (parts.length === 3) {
          const dObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
          dObj.setHours(0, 0, 0, 0)
          if (!isNaN(dObj.getTime())) {
            dateObjects.push(dObj)
            if (!earliest && dObj >= todayStart) {
              earliest = dObj
            }
          }
        }
      }

      setDatesWithSlots(dateObjects)
      setEarliestAvailableDate(earliest)

      // Jika tanggal belum ditentukan dari URL search param dan hari ini tidak memiliki slot,
      // otomatis alihkan kalender ke tanggal terdekat yang memiliki slot
      if (!tanggalParam && !options?.initialDate) {
        setDate((currentDate) => {
          if (!currentDate) return earliest || todayStart
          const currentKey = formatDateToKey(currentDate)
          if (!datesFound.has(currentKey) && earliest) {
            return earliest
          }
          return currentDate
        })
      }
    }

    loadAllAvailableDates()

    window.addEventListener("focus", loadAllAvailableDates)
    window.addEventListener("storage", loadAllAvailableDates)

    return () => {
      isCancelled = true
      window.removeEventListener("focus", loadAllAvailableDates)
      window.removeEventListener("storage", loadAllAvailableDates)
    }
  }, [psikologIdParam, psikologNameParam, selectedPsikolog, tanggalParam, today, effectiveTipeJadwal, options?.initialDate, metode, currentServiceData, serviceName, isSlotApplicableToService])

  // Fetch slot ketersediaan dari Backend saat tanggal berubah
  useEffect(() => {
    if (!date) return

    const dateKey = formatDateToKey(date)

    const fetchSlots = async () => {
      setIsLoadingSlots(true)

      // 1. Ambil slot dari Backend API (hanya yang berstatus TERSEDIA murni dari database)
      let apiSlots: JadwalSlotItem[] = []
      try {
        apiSlots =
          (await psikologService.getJadwalTersedia({
            tanggal: dateKey,
            id_psikolog: effectiveTipeJadwal === "ASESMEN" ? undefined : psikologIdParam,
            tipe_jadwal: effectiveTipeJadwal,
          })) || []
      } catch (_err) {
        apiSlots = []
      }

      // 2. Kumpulkan slot resmi yang berstatus TERSEDIA
      const candidateSlotsMap = new Map<string, JadwalSlotItem>()

      apiSlots.forEach((slot) => {
        if (slot.status && slot.status !== "TERSEDIA") return

        const timeKey = (slot.jam_mulai || "").trim().substring(0, 5)
        const effectiveMetode = slot.metode || "Keduanya"
        candidateSlotsMap.set(timeKey, {
          ...slot,
          jam_mulai: timeKey,
          jam_selesai: (slot.jam_selesai || "").trim().substring(0, 5),
          metode: effectiveMetode,
        })
      })

      // 3. FILTER KETAT: Status TERSEDIA, Jam belum lewat hari ini, dan Metode Konseling
      const now = new Date()
      const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
      const currentMinutes = now.getHours() * 60 + now.getMinutes()
      const targetMetode = metode.toLowerCase()
      const matchingSlots: JadwalSlotItem[] = []

      candidateSlotsMap.forEach((slot) => {
        if (slot.status && slot.status !== "TERSEDIA") return

        if (dateKey === todayKey) {
          const startMinutes = extractMinutes(slot.jam_mulai)
          if (startMinutes !== -1 && currentMinutes >= startMinutes) return
        } else if (dateKey < todayKey) {
          return
        }

        if (isSlotApplicableToService(slot, currentServiceData, metode)) {
          matchingSlots.push(slot)
        }
      })

      matchingSlots.sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai))
      setAvailableSlots(matchingSlots)

      if (matchingSlots.length > 0) {
        const stillValid = matchingSlots.find((s) => s.jam_mulai === waktu)
        if (stillValid) {
          setWaktu(stillValid.jam_mulai)
          setSelectedSlotId(stillValid.id)
        } else {
          setWaktu(matchingSlots[0].jam_mulai)
          setSelectedSlotId(matchingSlots[0].id)
        }
      } else {
        setWaktu(null)
        setSelectedSlotId(null)
      }
      setIsLoadingSlots(false)
    }

    fetchSlots()

    window.addEventListener("focus", fetchSlots)
    window.addEventListener("storage", fetchSlots)

    return () => {
      window.removeEventListener("focus", fetchSlots)
      window.removeEventListener("storage", fetchSlots)
    }
  }, [date, psikologIdParam, metode, psikologNameParam, selectedPsikolog, effectiveTipeJadwal, currentServiceData, serviceName, isSlotApplicableToService])

  const selectedSlot = availableSlots.find((s) => s.jam_mulai === waktu)
  const activePsikologName =
    mode === "asesmen"
      ? null
      : selectedSlot?.nama_psikolog ||
        selectedPsikolog?.nama_gelar ||
        selectedPsikolog?.account?.nama ||
        searchParams.get("psikologName") ||
        null

  const activePrice = useMemo(() => {
    if (mode === "asesmen") {
      const isWeekend = selectedOfflinePlan === "weekend"

      // 1. Ambil dari asesmenPackage dinamis yang dikirimkan oleh halaman
      if (options?.asesmenPackage) {
        const pkgPrice = isWeekend ? options.asesmenPackage.weekend : options.asesmenPackage.weekday
        if (pkgPrice && pkgPrice.trim()) return pkgPrice.trim()
      }

      // 2. Ambil dari data database backend jika ada
      if (currentServiceData) {
        const t = (currentServiceData as any).tarif_tenaga_ahli || {}
        const bePrice = isWeekend
          ? (currentServiceData as any).tarif_asesmen?.offline_weekend ??
            t?.asesmen?.offline?.weekend ??
            t?.offline?.weekend ??
            currentServiceData.harga_weekend
          : (currentServiceData as any).tarif_asesmen?.offline_weekday ??
            t?.asesmen?.offline?.weekday ??
            t?.offline?.weekday ??
            currentServiceData.harga_weekday

        if (bePrice !== undefined && bePrice !== null && bePrice !== "") {
          const num = Number(String(bePrice).replace(/[^\d]/g, ""))
          if (!isNaN(num) && num > 0) {
            return `Rp ${num.toLocaleString("id-ID")}`
          }
        }
      }

      // 3. Fallback ke search params jika membawa harga
      const qHarga = searchParams?.get("harga")
      if (qHarga && qHarga.startsWith("Rp")) {
        return qHarga
      }

      return isWeekend ? "Rp 500.000" : "Rp 400.000"
    }

    if (!currentServiceData || !date) return null

    const day = date.getDay()
    const isWeekend = day === 0 || day === 6
    const t = currentServiceData.tarif_tenaga_ahli

    const formatRp = (num: any) => {
      if (!num && num !== 0) return null
      const n = typeof num === "string" ? parseInt(num.replace(/[,.]00$/, "").replace(/[^0-9]/g, "") || "0", 10) : num
      return `Rp ${n.toLocaleString("id-ID")}`
    }

    const roleKey: "psikolog" | "konselor" | "peer" =
      layanan.toLowerCase().includes("peer")
        ? "peer"
        : layanan.toLowerCase().includes("konselor")
        ? "konselor"
        : "psikolog"

    if (t?.[roleKey]) {
      const price = isWeekend ? t[roleKey].weekend : t[roleKey].weekday
      return formatRp(price)
    }

    const fallbackPrice = isWeekend ? currentServiceData.harga_weekend : currentServiceData.harga_weekday
    return formatRp(fallbackPrice)
  }, [mode, selectedOfflinePlan, options?.asesmenPackage, currentServiceData, date, layanan])

  const buildBayarUrl = () => {
    if (!date || !waktu) return "#"
    const dayStr = String(date.getDate()).padStart(2, "0")
    const monthStr = String(date.getMonth() + 1).padStart(2, "0")
    const timeDisplay = `${waktu.substring(0, 5)} WIB`

    const biroParam = slug ? `&biro=${encodeURIComponent(slug)}` : ""

    if (mode === "asesmen") {
      const selectedPrice = activePrice || "Rp 400.000"
      const planName = selectedOfflinePlan === "weekday" ? "Weekday" : "Weekend"
      const asesmenTitle = options?.asesmenPackage?.title || serviceName || layanan || "Asesmen Minat Bakat"

      const params = new URLSearchParams({
        layanan: `${asesmenTitle} (${planName})`,
        metode: metode.toLowerCase(),
        metodeKonseling: metode,
        tanggal: `${dayStr}/${monthStr}`,
        tahun: String(date.getFullYear()),
        waktu: waktu.substring(0, 5),
        ...(selectedSlotId && { slotId: selectedSlotId }),
        harga: selectedPrice,
        hari: planName,
        bottomDate: `${date.getDate()} ${MONTHS[date.getMonth()].substring(0, 3)} ${date.getFullYear()}`,
        bottomTime: `${timeDisplay} (${metode})`,
      })
      return `/konseling/bayar?${params.toString()}${biroParam}`
    }

    const psiName = activePsikologName || ""
    const params = new URLSearchParams({
      layanan: serviceName || layanan,
      profesi: layanan,
      metode,
      tanggal: `${dayStr}/${monthStr}`,
      tahun: String(date.getFullYear()),
      waktu: waktu.substring(0, 5),
      ...(selectedSlotId && { slotId: selectedSlotId }),
      ...(psiName && { psikologName: psiName }),
      ...((selectedSlot?.id_psikolog || psikologIdParam) && {
        psikologId: selectedSlot?.id_psikolog || psikologIdParam,
      }),
      bottomDate: `${date.getDate()} ${MONTHS[date.getMonth()].substring(0, 3)} ${date.getFullYear()}`,
      bottomTime: `${timeDisplay} (${metode})${psiName ? ` • ${psiName}` : ""}`,
    })
    return `/konseling/bayar?${params.toString()}${biroParam}`
  }

  const isSlotReady = Boolean(date && waktu)

  return {
    mode,
    MONTHS,
    today,
    date,
    setDate: handleSetDate,
    metode,
    setMetode: handleSetMetode,
    layanan,
    setLayanan,
    serviceName,
    waktu,
    setWaktu,
    selectedSlotId,
    setSelectedSlotId,
    datesWithSlots,
    earliestAvailableDate,
    availableSlots,
    isLoadingSlots,
    activePsikologName,
    selectedOfflinePlan,
    setSelectedOfflinePlan: handleSetOfflinePlan,
    activePrice,
    buildBayarUrl,
    isSlotReady,
    isOnlineAllowed: allowedMethods.online,
    isOfflineAllowed: allowedMethods.offline,
    isLayananNonaktif,
    nonaktifLayananNama,
    availableCategories,
  }
}
