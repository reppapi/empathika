"use client"

import { useState, useEffect, useMemo } from "react"
import { BookedAssessment } from "@/features/konseling/types"
import { layananService } from "@/services/layanan.service"
import { getStoredLayanan } from "@/features/layanan/data/adminLayananData"

export const DEFAULT_LAYANAN_ASESMEN = [
  "Semua Layanan Asesmen",
  "Asesmen Psikologi Klinis",
  "Asesmen Minat Bakat",
  "Asesmen Perkembangan Anak",
  "Tes Potensi Akademik & Minat Bakat",
]

export interface UseJadwalAsesmenPickerProps {
  date: Date | undefined
  bookedSessions?: BookedAssessment[]
  onBooking: (times: string[], metode: "Online" | "Offline" | "Keduanya", layanan?: string) => void | Promise<void>
  timeSlots?: string[]
}

export const isAsesmenSession = (s: any): boolean => {
  if (!s) return false
  const tipe = (s.tipe_jadwal || "").toUpperCase()
  if (tipe === "ASESMEN") return true
  if (tipe === "KONSULTASI") return false
  const layanan = (s.layanan || "").toLowerCase()
  if (
    layanan.includes("konsultasi") ||
    layanan.includes("konseling") ||
    layanan.includes("individu") ||
    layanan.includes("pasangan") ||
    layanan.includes("keluarga")
  ) {
    return false
  }
  return layanan.includes("asesmen") || layanan.includes("psikotes")
}

export function formatFullDateIndonesian(d: Date): string {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ]
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

export function useJadwalAsesmenPicker({
  date,
  bookedSessions = [],
  onBooking,
  timeSlots = [
    "09:00 - 10:00",
    "10:00 - 11:00",
    "13:00 - 14:00",
    "14:30 - 15:30",
    "15:30 - 16:30",
  ],
}: UseJadwalAsesmenPickerProps) {
  const DEFAULT_SLOTS = useMemo(
    () => [
      "09:00 - 10:00",
      "10:00 - 11:00",
      "13:00 - 14:00",
      "14:30 - 15:30",
      "15:30 - 16:30",
    ],
    []
  )

  const [availableSlots, setAvailableSlots] = useState<string[]>(timeSlots)
  const [deletedCustomSlots, setDeletedCustomSlots] = useState<string[]>([])

  useEffect(() => {
    setAvailableSlots((prev) => {
      const merged = new Set([...DEFAULT_SLOTS, ...timeSlots, ...prev])
      bookedSessions.forEach((s) => {
        if (isAsesmenSession(s) && s.waktu) merged.add(s.waktu)
      })
      const filtered = Array.from(merged).filter((t) => !deletedCustomSlots.includes(t))
      return filtered.sort()
    })
  }, [timeSlots, bookedSessions, deletedCustomSlots, DEFAULT_SLOTS])

  const handleDeleteCustomSlot = (timeToRemove: string) => {
    setDeletedCustomSlots((prev) => [...prev, timeToRemove])
    setAvailableSlots((prev) => prev.filter((t) => t !== timeToRemove))
    setSelectedTimes((prev) => prev.filter((t) => t !== timeToRemove))
  }

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  // Indikator tanggal yang memiliki slot / sesi aktif
  const datesWithSlots = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

    const dates: Date[] = []
    const dateSet = new Set<string>()
    bookedSessions.forEach((s) => {
      if (isAsesmenSession(s) && s.date && s.date >= todayKey && s.status !== "Dibatalkan" && !s.isCancelled) {
        dateSet.add(s.date)
      }
    })
    dateSet.forEach((dateStr) => {
      const parts = dateStr.split("-").map(Number)
      if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
        const d = new Date(parts[0], parts[1] - 1, parts[2])
        d.setHours(0, 0, 0, 0)
        if (d >= today) {
          dates.push(d)
        }
      }
    })
    return dates
  }, [bookedSessions])

  // Pilihan metode sesi: Online (Zoom), Offline (Klinik), atau Keduanya
  const [metode, setMetode] = useState<"Online" | "Offline" | "Keduanya">("Online")

  // Pilihan Layanan Asesmen
  const [selectedLayanan, setSelectedLayanan] = useState<string>("Semua Layanan Asesmen")
  const [layananOptions, setLayananOptions] = useState<string[]>(DEFAULT_LAYANAN_ASESMEN)
  const [serviceItems, setServiceItems] = useState<any[]>([])

  // Ambil daftar layanan kategori ASESMEN dari database / API & local storage
  useEffect(() => {
    let isMounted = true
    layananService
      .getAll({ kategori: "ASESMEN" })
      .then((res: any) => {
        if (!isMounted) return
        const beList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        const activeServices: any[] = []
        const activeNames: string[] = []

        beList.forEach((l: any) => {
          if (l.aktif !== false && l.status !== "Nonaktif") {
            activeServices.push(l)
            if (l.nama) activeNames.push(l.nama.trim())
          }
        })

        try {
          const stored = getStoredLayanan().filter(
            (item: any) =>
              (item.kategoriId === "05" || (item.kategori || "").toUpperCase() === "ASESMEN") &&
              item.status !== "Nonaktif"
          )
          stored.forEach((item: any) => {
            const itemTitle = (item.layanan || item.nama || "").trim()
            if (!itemTitle) return
            const alreadyExists = activeServices.some(
              (s) => (s.nama || s.layanan || "").trim().toLowerCase() === itemTitle.toLowerCase()
            )
            if (!alreadyExists) {
              activeServices.push(item)
              activeNames.push(itemTitle)
            }
          })
        } catch {}

        if (activeServices.length === 0) {
          activeServices.push(
            { id: "asesmen-minat-bakat-01", nama: "Asesmen Minat Bakat", layanan: "Asesmen Minat Bakat", metode: "Online/Offline", status: "Aktif" },
            { id: "asesmen-kesiapan-sekolah-01", nama: "Asesmen Kesiapan Sekolah", layanan: "Asesmen Kesiapan Sekolah", metode: "Online/Offline", status: "Aktif" },
            { id: "asesmen-klinis-01", nama: "Asesmen Klinis", layanan: "Asesmen Klinis", metode: "Online/Offline", status: "Aktif" }
          )
          activeNames.push("Asesmen Minat Bakat", "Asesmen Kesiapan Sekolah", "Asesmen Klinis")
        }

        setServiceItems(activeServices)

        const uniqueNames: string[] = Array.from(new Set<string>(activeNames))
        if (uniqueNames.length > 0) {
          setLayananOptions(["Semua Layanan Asesmen", ...uniqueNames])
        } else {
          setLayananOptions(DEFAULT_LAYANAN_ASESMEN)
        }
      })
      .catch((err) => {
        console.warn("Gagal memuat layanan asesmen:", err?.message)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Menentukan metode asesmen yang diperbolehkan berdasarkan pengaturan layanan di Admin
  const allowedMetode = useMemo(() => {
    let targetServices = serviceItems
    if (selectedLayanan && selectedLayanan !== "Semua Layanan Asesmen") {
      const found = serviceItems.filter(
        (s) => (s.nama || s.layanan || "").trim().toLowerCase() === selectedLayanan.trim().toLowerCase()
      )
      if (found.length > 0) {
        targetServices = found
      }
    }

    if (targetServices.length === 0) {
      return { online: true, offline: true, both: true }
    }

    let hasOnline = false
    let hasOffline = false

    targetServices.forEach((s) => {
      const m = (s.metode || "Online/Offline").toLowerCase()
      if (m.includes("online") || m.includes("keduanya") || m === "semua") {
        hasOnline = true
      }
      if (m.includes("offline") || m.includes("keduanya") || m === "semua") {
        hasOffline = true
      }
    })

    return {
      online: hasOnline,
      offline: hasOffline,
      both: hasOnline && hasOffline,
    }
  }, [selectedLayanan, serviceItems])

  // Sinkronkan metode otomatis jika metode aktif tidak didukung oleh layanan asesmen yang dipilih
  useEffect(() => {
    if (allowedMetode.both) return
    if (allowedMetode.online && !allowedMetode.offline) {
      if (metode !== "Online") setMetode("Online")
    } else if (!allowedMetode.online && allowedMetode.offline) {
      if (metode !== "Offline") setMetode("Offline")
    }
  }, [allowedMetode, metode])

  // Multi-select slot jam & jam kustom
  const [selectedTimes, setSelectedTimes] = useState<string[]>([])
  const [isCustomTime, setIsCustomTime] = useState(false)
  const [customStart, setCustomStart] = useState("")
  const [customEnd, setCustomEnd] = useState("")

  // Reset pilihan centang saat tanggal berganti
  useEffect(() => {
    setSelectedTimes([])
    setIsCustomTime(false)
    setCustomStart("")
    setCustomEnd("")
  }, [date])

  const toggleTimeSlot = (time: string) => {
    setSelectedTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    )
  }

  const toggleSelectAll = () => {
    if (selectedTimes.length === availableSlots.length) {
      setSelectedTimes([])
    } else {
      setSelectedTimes([...availableSlots])
    }
  }

  const handleAddCustomTime = () => {
    if (!customStart || !customEnd || customEnd <= customStart) {
      alert("Jam selesai harus lebih akhir dari jam mulai.")
      return
    }
    const customFormatted = `${customStart} - ${customEnd}`
    if (!availableSlots.includes(customFormatted)) {
      setAvailableSlots((prev) => [...prev, customFormatted].sort())
    }
    if (!selectedTimes.includes(customFormatted)) {
      setSelectedTimes((prev) => [...prev, customFormatted])
    }
    setDeletedCustomSlots((prev) => prev.filter((t) => t !== customFormatted))
    setIsCustomTime(false)
    setCustomStart("")
    setCustomEnd("")
  }

  const handleBookingClick = () => {
    const timesToBook = [...selectedTimes]
    if (isCustomTime && customStart && customEnd) {
      if (customEnd <= customStart) {
        alert("Jam selesai harus lebih akhir dari jam mulai.")
        return
      }
      const customFormatted = `${customStart} - ${customEnd}`
      if (!timesToBook.includes(customFormatted)) {
        timesToBook.push(customFormatted)
      }
      if (!availableSlots.includes(customFormatted)) {
        setAvailableSlots((prev) => [...prev, customFormatted].sort())
      }
      setDeletedCustomSlots((prev) => prev.filter((t) => t !== customFormatted))
    }
    if (timesToBook.length > 0) {
      onBooking(timesToBook, metode, selectedLayanan)
      setSelectedTimes([])
      setIsCustomTime(false)
      setCustomStart("")
      setCustomEnd("")
    }
  }

  const isCustomValid = isCustomTime && Boolean(customStart) && Boolean(customEnd) && customEnd > customStart
  const isFormValid = selectedTimes.length > 0 || isCustomValid

  return {
    DEFAULT_SLOTS,
    availableSlots,
    datesWithSlots,
    deletedCustomSlots,
    today,
    metode,
    setMetode,
    selectedLayanan,
    setSelectedLayanan,
    layananOptions,
    selectedTimes,
    setSelectedTimes,
    isCustomTime,
    setIsCustomTime,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    handleDeleteCustomSlot,
    toggleTimeSlot,
    toggleSelectAll,
    handleAddCustomTime,
    handleBookingClick,
    isFormValid,
    allowedMetode,
    serviceItems,
  }
}

