"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { psikologService, JadwalSlotItem } from "@/services/psikolog.service"
import { layananService } from "@/services/layanan.service"
import { getStoredLayanan } from "@/features/layanan/data/adminLayananData"

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

  const initialLayanan = options?.asesmenPackage?.title || searchParams?.get("layanan") || (isAsesmen ? "Asesmen Minat Bakat" : "Psikolog")
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

  // Sinkronisasi ketersediaan metode pelaksanaan & status aktif dari data layanan (Backend / Local)
  useEffect(() => {
    let isCancelled = false

    const checkServiceMethod = async () => {
      const activeName = (layanan || searchParams?.get("layanan") || "Psikolog").toLowerCase().trim()
      let matchedMetode = "Online/Offline"

      try {
        const res: any = await layananService.getAll({ kategori: "KONSULTASI" })
        const beList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        const matched = beList.find((l: any) => {
          const lName = (l.nama || "").toLowerCase()
          return lName.includes(activeName) || activeName.includes(lName)
        })

        // Cek juga di localStorage untuk respon instan antartab
        const stored = getStoredLayanan().filter((l) => l.kategoriId === "01")
        const localMatched = stored.find((l) => {
          const lName = l.layanan.toLowerCase()
          return lName.includes(activeName) || activeName.includes(lName)
        })

        const isNonaktif =
          (matched && (matched.aktif === false || matched.status === "Nonaktif")) ||
          (localMatched && localMatched.status === "Nonaktif")

        if (isNonaktif) {
          setIsLayananNonaktif(true)
          setNonaktifLayananNama(matched?.nama || localMatched?.layanan || layanan)
        } else {
          setIsLayananNonaktif(false)
        }

        if (matched?.metode) {
          matchedMetode = matched.metode
        } else if (localMatched?.metode) {
          matchedMetode = localMatched.metode
        }
      } catch {
        const stored = getStoredLayanan().filter((l) => l.kategoriId === "01")
        const localMatched = stored.find((l) => {
          const lName = l.layanan.toLowerCase()
          return lName.includes(activeName) || activeName.includes(lName)
        })
        if (localMatched && localMatched.status === "Nonaktif") {
          setIsLayananNonaktif(true)
          setNonaktifLayananNama(localMatched.layanan)
        }
      }

      if (isCancelled) return

      const norm = matchedMetode.toLowerCase()
      const hasOnline = norm.includes("online") || norm === "keduanya" || norm === "semua"
      const hasOffline = norm.includes("offline") || norm === "keduanya" || norm === "semua"

      setAllowedMethods({
        online: hasOnline,
        offline: hasOffline,
      })

      // Jika hanya salah satu metode yang didukung, otomatis pilihkan metode yang aktif
      if (hasOnline && !hasOffline) {
        setMetode("Online")
      } else if (!hasOnline && hasOffline) {
        setMetode("Offline")
      }
    }

    checkServiceMethod()

    window.addEventListener("focus", checkServiceMethod)
    window.addEventListener("storage", checkServiceMethod)

    return () => {
      isCancelled = true
      window.removeEventListener("focus", checkServiceMethod)
      window.removeEventListener("storage", checkServiceMethod)
    }
  }, [layanan, searchParams])

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

      // 2. Gabungkan slot dari LocalStorage (abaikan seed dummy)
      try {
        const raw = localStorage.getItem("empathika_custom_jadwal_slots")
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) {
            parsed
              .filter((s: any) => !s.id?.startsWith("seed_asesmen_"))
              .forEach((s: any) => {
              const slotType = (s.tipe_jadwal || "KONSULTASI").toUpperCase()
              const matchType = slotType === effectiveTipeJadwal.toUpperCase()
              const isTersedia = (s.status || "TERSEDIA").toUpperCase() === "TERSEDIA"
              const matchPsi =
                effectiveTipeJadwal === "ASESMEN"
                  ? true
                  : !psikologIdParam ||
                    s.id_psikolog === psikologIdParam ||
                    (selectedPsikolog &&
                      (s.nama_psikolog === selectedPsikolog.nama_gelar ||
                        s.nama_psikolog === selectedPsikolog.nama ||
                        s.nama_psikolog === selectedPsikolog.account?.nama)) ||
                    (psikologNameParam &&
                      s.nama_psikolog &&
                      (s.nama_psikolog.toLowerCase().includes(psikologNameParam.toLowerCase()) ||
                        psikologNameParam.toLowerCase().includes(s.nama_psikolog.toLowerCase())))

              if (matchType && matchPsi && s.tanggal && isTersedia) {
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
  }, [psikologIdParam, psikologNameParam, selectedPsikolog, tanggalParam, today, effectiveTipeJadwal, options?.initialDate])

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

        const slotMetode = (slot.metode || "Keduanya").toLowerCase()
        const isMatch =
          slotMetode === "keduanya" ||
          slotMetode === "online & offline" ||
          slotMetode === "semua" ||
          slotMetode === targetMetode

        if (isMatch) {
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
  }, [date, psikologIdParam, metode, psikologNameParam, selectedPsikolog, effectiveTipeJadwal])

  const selectedSlot = availableSlots.find((s) => s.jam_mulai === waktu)
  const activePsikologName =
    mode === "asesmen"
      ? null
      : selectedSlot?.nama_psikolog ||
        selectedPsikolog?.nama_gelar ||
        selectedPsikolog?.account?.nama ||
        searchParams.get("psikologName") ||
        null

  const activePrice =
    mode === "asesmen"
      ? selectedOfflinePlan === "weekday"
        ? options?.asesmenPackage?.weekday || "Rp 400.000"
        : options?.asesmenPackage?.weekend || "Rp 500.000"
      : null

  const buildBayarUrl = () => {
    if (!date || !waktu) return "#"
    const dayStr = String(date.getDate()).padStart(2, "0")
    const monthStr = String(date.getMonth() + 1).padStart(2, "0")
    const timeDisplay = `${waktu.substring(0, 5)} WIB`

    if (mode === "asesmen") {
      const selectedPrice = activePrice || "Rp 400.000"
      const planName = selectedOfflinePlan === "weekday" ? "Weekday" : "Weekend"
      const asesmenTitle = options?.asesmenPackage?.title || layanan || "Asesmen Minat Bakat"

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
      return `/konseling/bayar?${params.toString()}`
    }

    const psiName = activePsikologName || ""
    const params = new URLSearchParams({
      layanan,
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
    return `/konseling/bayar?${params.toString()}`
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
  }
}
