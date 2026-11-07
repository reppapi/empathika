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

export function useJadwalClient() {
  const searchParams = useSearchParams()
  const initialLayanan = searchParams?.get("layanan") || "Psikolog"
  const psikologIdParam = searchParams?.get("psikologId") || undefined
  const psikologNameParam = searchParams?.get("psikologName") || undefined
  const tanggalParam = searchParams?.get("tanggal") || searchParams?.get("date") || undefined

  // Batas tanggal hari ini (pukul 00:00:00) agar tanggal masa lalu tidak bisa diklik
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const [metode, setMetode] = useState("Online")
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

  // Calendar state: default tanggal dari URL param atau hari ini
  const [date, setDate] = useState<Date | undefined>(() => {
    const fromParam = parseDateParam(tanggalParam)
    if (fromParam && fromParam >= today) return fromParam
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })

  // Daftar tanggal yang memiliki slot ketersediaan (untuk indikator titik kalender & auto-jump)
  const [datesWithSlots, setDatesWithSlots] = useState<Date[]>([])
  const [earliestAvailableDate, setEarliestAvailableDate] = useState<Date | null>(null)

  // Dynamic slots dari database backend
  const [availableSlots, setAvailableSlots] = useState<JadwalSlotItem[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [selectedPsikolog, setSelectedPsikolog] = useState<any>(null)

  useEffect(() => {
    if (psikologIdParam) {
      psikologService
        .getBySlug(psikologIdParam)
        .then((res: any) => {
          if (res) setSelectedPsikolog(res)
        })
        .catch(() => {})
    }
  }, [psikologIdParam])

  // Deteksi semua tanggal yang memiliki slot jadwal untuk psikolog ini
  useEffect(() => {
    let isCancelled = false

    const loadAllAvailableDates = async () => {
      const datesFound = new Set<string>()

      const now = new Date()
      const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
      const currentMinutes = now.getHours() * 60 + now.getMinutes()

      // 1. Ambil seluruh slot ketersediaan murni dari Backend Database
      try {
        const slots = await psikologService.getJadwalTersedia({
          id_psikolog: psikologIdParam,
          tipe_jadwal: "KONSULTASI",
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
      if (!tanggalParam) {
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
  }, [psikologIdParam, psikologNameParam, selectedPsikolog, tanggalParam, today])

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
            id_psikolog: psikologIdParam,
            tipe_jadwal: "KONSULTASI",
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

      // 4. FILTER KETAT: Status TERSEDIA, Jam belum lewat hari ini, dan Metode Konseling
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
  }, [date, psikologIdParam, metode, psikologNameParam, selectedPsikolog])

  const selectedSlot = availableSlots.find((s) => s.jam_mulai === waktu)
  const activePsikologName =
    selectedSlot?.nama_psikolog ||
    selectedPsikolog?.nama_gelar ||
    selectedPsikolog?.account?.nama ||
    searchParams.get("psikologName") ||
    null

  const buildBayarUrl = () => {
    if (!date || !waktu) return "#"
    const dayStr = String(date.getDate()).padStart(2, "0")
    const monthStr = String(date.getMonth() + 1).padStart(2, "0")
    const timeDisplay = `${waktu.substring(0, 5)} WIB`
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
    MONTHS,
    today,
    date,
    setDate,
    metode,
    setMetode,
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
    buildBayarUrl,
    isSlotReady,
    isOnlineAllowed: allowedMethods.online,
    isOfflineAllowed: allowedMethods.offline,
    isLayananNonaktif,
    nonaktifLayananNama,
  }
}

