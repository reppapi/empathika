"use client"

import { useState, useEffect, useMemo } from "react"
import { BookedAssessment } from "@/features/konseling/types"
import { layananService } from "@/services/layanan.service"

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
        const isAsesmen =
          (s.tipe_jadwal || "").toUpperCase() === "ASESMEN" ||
          (s.layanan || "").toLowerCase().includes("asesmen") ||
          (s.layanan || "").toLowerCase().includes("psikotes")
        if (isAsesmen && s.waktu) merged.add(s.waktu)
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
      const isAsesmen =
        (s.tipe_jadwal || "").toUpperCase() === "ASESMEN" ||
        (s.layanan || "").toLowerCase().includes("asesmen") ||
        (s.layanan || "").toLowerCase().includes("psikotes")

      if (isAsesmen && s.date && s.date >= todayKey && s.status !== "Dibatalkan" && !s.isCancelled) {
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

  // Ambil daftar layanan kategori ASESMEN dari database / API
  useEffect(() => {
    let isMounted = true
    layananService
      .getAll({ kategori: "ASESMEN" })
      .then((res: any) => {
        if (!isMounted) return
        const raw = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        const activeNames: string[] = raw
          .filter((l: any) => l.aktif !== false && l.status !== "Nonaktif")
          .map((l: any) => (l.nama?.trim() as string))
          .filter(Boolean)

        try {
          const rawLocal = localStorage.getItem("empathika_admin_layanan_list")
          if (rawLocal) {
            const parsed = JSON.parse(rawLocal)
            if (Array.isArray(parsed)) {
              parsed.forEach((item: any) => {
                if (
                  (item.kategoriId === "02" || (item.kategori || "").toUpperCase() === "ASESMEN") &&
                  item.status !== "Nonaktif" &&
                  item.layanan
                ) {
                  activeNames.push(item.layanan.trim())
                }
              })
            }
          }
        } catch {}

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
  }
}

