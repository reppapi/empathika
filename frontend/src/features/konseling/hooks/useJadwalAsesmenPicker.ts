"use client"

import { useState, useEffect, useMemo } from "react"
import { BookedAssessment } from "@/features/konseling/types"

export interface UseJadwalAsesmenPickerProps {
  date: Date | undefined
  bookedSessions?: BookedAssessment[]
  onBooking: (times: string[], metode: "Online" | "Offline" | "Keduanya") => void | Promise<void>
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
        if (s.waktu) merged.add(s.waktu)
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

  // Pilihan metode sesi: Online (Zoom), Offline (Klinik), atau Keduanya
  const [metode, setMetode] = useState<"Online" | "Offline" | "Keduanya">("Online")

  // Multi-select slot jam & jam kustom
  const [selectedTimes, setSelectedTimes] = useState<string[]>([])
  const [isCustomTime, setIsCustomTime] = useState(false)
  const [customStart, setCustomStart] = useState("08:00")
  const [customEnd, setCustomEnd] = useState("09:00")

  // Reset pilihan centang saat tanggal berganti
  useEffect(() => {
    setSelectedTimes([])
    setIsCustomTime(false)
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
      onBooking(timesToBook, metode)
      setSelectedTimes([])
      setIsCustomTime(false)
    }
  }

  const isFormValid = selectedTimes.length > 0 || (isCustomTime && customStart && customEnd)

  return {
    DEFAULT_SLOTS,
    availableSlots,
    deletedCustomSlots,
    today,
    metode,
    setMetode,
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

