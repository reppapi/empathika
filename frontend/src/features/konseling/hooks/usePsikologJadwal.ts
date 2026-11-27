"use client"

import { useState, useMemo } from "react"
import { psikologService, JadwalSlotItem } from "@/services/psikolog.service"
import { bookingService } from "@/services/booking.service"
import { useAuthStore } from "@/store/authStore"
import {
  isSessionCancelled,
  removeRescheduledSession,
} from "@/features/konseling/utils/cancellationSync"
import { BookedSession } from "../components/psikolog/types"
import { formatDateKey, matchPsikologSession } from "../components/psikolog/utils/psikologDateUtils"
import { usePsikologProfileAndServices } from "./psikolog/usePsikologProfileAndServices"
import { usePsikologWeekNavigation } from "./psikolog/usePsikologWeekNavigation"
import { usePsikologSessionActions } from "./psikolog/usePsikologSessionActions"
import { usePsikologScheduleData } from "./psikolog/usePsikologScheduleData"

export function usePsikologJadwal() {
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const { user } = useAuthStore()

  // 1. Sub-hook: Profil Psikolog & Pilihan Layanan
  const {
    activePsikolog,
    setActivePsikolog,
    resolveActivePsikolog,
    resolvedPsikologId,
    resolvedPsikologName,
    resolvedAccountId,
    selectedLayanan,
    setSelectedLayanan,
    layananOptions,
    selectedMetode,
    setSelectedMetode,
    allowedMetode,
  } = usePsikologProfileAndServices(user)

  // 2. State slot waktu & tanggal terpilih
  const [selectedTimes, setSelectedTimes] = useState<string[]>([])
  const [date, setDate] = useState<Date | undefined>(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null)
  const [isCustomTime, setIsCustomTime] = useState(false)
  const [customStart, setCustomStart] = useState("")
  const [customEnd, setCustomEnd] = useState("")
  const [deletedCustomSlots, setDeletedCustomSlots] = useState<string[]>([])
  const [timeSlots, setTimeSlots] = useState<string[]>([
    "09:00 - 10:00",
    "10:00 - 11:00",
    "13:30 - 14:30",
    "14:30 - 15:30",
    "15:30 - 16:30",
  ])

  const resetSelection = () => {
    setSelectedTimes([])
    setIsCustomTime(false)
    setBookingSuccessMsg(null)
  }

  // 3. Sub-hook: Navigasi Kalender Mingguan
  const {
    currentWeekMonday,
    weekDays,
    weekRangeLabel,
    canGoPrevWeek,
    canGoNextWeek,
    isCurrentWeek,
    goToPrevWeek,
    goToNextWeek,
    goToCurrentWeek,
  } = usePsikologWeekNavigation(date, [], resetSelection, setDate)

  // 4. Sub-hook: Sinkronisasi & Data Jadwal Slot
  const {
    bookedSessions,
    setBookedSessions,
    datesWithSchedules,
    loadScheduleForPsikolog,
  } = usePsikologScheduleData({
    user,
    resolveActivePsikolog,
    activePsikolog,
    setActivePsikolog,
    resolvedPsikologId,
    resolvedPsikologName,
    resolvedAccountId,
    date,
    currentWeekMonday,
    deletedCustomSlots,
    setTimeSlots,
  })

  // 5. Sub-hook: Aksi Sesi Klien (Batal, Reschedule, Selesai, WhatsApp)
  const {
    selectedDetailSession,
    setSelectedDetailSession,
    sessionToReschedule,
    setSessionToReschedule,
    actionToast,
    handleSelectDetailSession,
    handleCancelClientBooking,
    handleConfirmReschedule,
    handleMarkCompleted,
    handleCopyWhatsAppMessage,
  } = usePsikologSessionActions({
    activePsikolog,
    user,
    resolvedPsikologId,
    bookedSessions,
    setBookedSessions,
    deletedCustomSlots,
    setTimeSlots,
    loadScheduleForPsikolog,
  })

  const handleSelectDate = (newDate: Date | undefined) => {
    if (newDate) {
      if (newDate < today) return
      setDate(newDate)
      resetSelection()
    }
  }

  const toggleTimeSlot = (time: string) => {
    setSelectedTimes((prev) => (prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]))
  }

  const toggleSelectAll = () => {
    if (selectedTimes.length === timeSlots.length) {
      setSelectedTimes([])
    } else {
      setSelectedTimes([...timeSlots])
    }
  }

  // Tutup / Hapus slot jam ketersediaan yang dibuka
  const handleRemoveSlot = async (timeToRemove: string, targetDateKey?: string) => {
    const dateKey = targetDateKey || (date ? formatDateKey(date) : "")
    if (!dateKey) return

    // 1. Optimistic UI update
    const targetSession = bookedSessions.find((s) => s.date === dateKey && s.waktu === timeToRemove)
    setBookedSessions((prev) => prev.filter((s) => !(s.date === dateKey && s.waktu === timeToRemove)))

    // 2. Hapus dari LocalStorage
    try {
      removeRescheduledSession({ date: dateKey, waktu: timeToRemove })
      const raw = localStorage.getItem("empathika_custom_jadwal_slots")
      if (raw) {
        const current = JSON.parse(raw)
        if (Array.isArray(current)) {
          const time5 = timeToRemove.split("-")[0].trim().substring(0, 5)
          const updated = current.filter((s: any) => {
            const isMatchDate = s.tanggal === dateKey
            const isMatchTime = (s.jam_mulai || "").substring(0, 5) === time5
            return !(isMatchDate && isMatchTime)
          })
          localStorage.setItem("empathika_custom_jadwal_slots", JSON.stringify(updated))
          window.dispatchEvent(new Event("storage"))
        }
      }
    } catch { }

    // 3. Hapus dari Backend Database jika memiliki slot ID riil
    if (
      targetSession &&
      targetSession.id &&
      !targetSession.id.startsWith("mock-") &&
      !targetSession.id.startsWith("slot-")
    ) {
      try {
        await psikologService.deleteJadwalSlot(targetSession.id)
      } catch (err: any) {
        console.warn("Delete slot backend notice:", err?.response?.data?.message || err.message)
      }
    }

    if (date && dateKey === formatDateKey(date)) {
      setSelectedTimes((prev) => prev.filter((t) => t !== timeToRemove))
    }
    loadScheduleForPsikolog()
  }

  // Hapus opsi jam kustom dari daftar pilihan
  const handleDeleteCustomTimeSlot = async (timeToRemove: string) => {
    setDeletedCustomSlots((prev) => [...prev, timeToRemove])
    setTimeSlots((prev) => prev.filter((t) => t !== timeToRemove))
    setSelectedTimes((prev) => prev.filter((t) => t !== timeToRemove))

    const targetDateKey = date ? formatDateKey(date) : undefined
    const sessionsToRemove = bookedSessions.filter(
      (s) => s.waktu === timeToRemove && (!targetDateKey || s.date === targetDateKey)
    )

    for (const session of sessionsToRemove) {
      if (session.id && !session.id.startsWith("mock-")) {
        try {
          await psikologService.deleteJadwalSlot(session.id)
        } catch (err: any) {
          console.warn("Delete custom slot notice:", err?.message)
        }
      }
    }

    setBookedSessions((prev) =>
      prev.filter((s) => !(s.waktu === timeToRemove && (!targetDateKey || s.date === targetDateKey)))
    )

    setBookingSuccessMsg(`Jam kustom (${timeToRemove}) berhasil dihapus dari pilihan.`)
    setTimeout(() => setBookingSuccessMsg(null), 3000)
  }

  // Buka slot ketersediaan jadwal
  const handleBooking = async () => {
    if (!date) return
    const dateKey = formatDateKey(date)

    const timesToOpen: string[] = [...selectedTimes]

    if (isCustomTime) {
      if (!customStart || !customEnd) {
        alert("Harap masukkan jam mulai dan jam selesai terlebih dahulu.")
        return
      }
      if (customEnd <= customStart) {
        alert("Jam selesai harus lebih akhir dari jam mulai.")
        return
      }
      const customSlot = `${customStart} - ${customEnd}`
      if (!timesToOpen.includes(customSlot)) {
        timesToOpen.push(customSlot)
      }
    }

    if (timesToOpen.length === 0) {
      alert("Harap pilih minimal satu jam slot terlebih dahulu.")
      return
    }

    const savedId = typeof window !== "undefined" ? localStorage.getItem("active_psikolog_id") : null
    const savedName = typeof window !== "undefined" ? localStorage.getItem("active_psikolog_name") : null
    const currentPsi = resolveActivePsikolog()
    const psikologId = activePsikolog?.id || currentPsi.id || savedId || ""
    const effectivePsikologId = psikologId && psikologId !== "0" ? psikologId : undefined
    const psikologNama =
      activePsikolog?.nama_gelar ||
      activePsikolog?.account?.nama ||
      currentPsi.nama_gelar ||
      (currentPsi as any)?.account?.nama ||
      savedName ||
      user?.name ||
      "Tenaga Ahli"

    const newSessions: BookedSession[] = []
    const newSlotItems: JadwalSlotItem[] = []

    for (const finalWaktu of timesToOpen) {
      const [start, end] = finalWaktu.split(" - ")
      const jamMulai = start?.trim() || "09:00"
      const jamSelesai = end?.trim() || "10:00"

      let savedSlotId = ""

      const matchedCancelled = bookedSessions.find(
        (s) =>
          s.date === dateKey &&
          s.waktu === finalWaktu &&
          (s.isCancelled || s.status === "Dibatalkan" || (s as any).is_cancelled)
      )
      const isLocallyCancelled = isSessionCancelled({ date: dateKey, waktu: finalWaktu })
      const isReopeningCancelledSlot = Boolean(matchedCancelled || isLocallyCancelled)

      const bookingIdToCancel =
        (matchedCancelled as any)?.id_booking ||
        (matchedCancelled as any)?.booking?.id_booking ||
        (matchedCancelled as any)?.bookingId
      if (
        bookingIdToCancel &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(bookingIdToCancel)
      ) {
        try {
          await bookingService.cancelBooking(bookingIdToCancel)
        } catch { }
      } else if (
        matchedCancelled?.id &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          matchedCancelled.id
        )
      ) {
        try {
          await bookingService.cancelBooking(matchedCancelled.id)
        } catch { }
      }

      try {
        const res: any = await psikologService.createJadwalSlot({
          id_psikolog: effectivePsikologId,
          tanggal: dateKey,
          jam_mulai: jamMulai,
          jam_selesai: jamSelesai,
          tipe_jadwal: "KONSULTASI",
          metode: selectedMetode,
          layanan: selectedLayanan,
          force_release: isReopeningCancelledSlot,
        })
        if (res && res.id) {
          savedSlotId = res.id
        } else {
          throw new Error("Gagal memperoleh ID slot dari server.")
        }
      } catch (err: any) {
        if (!isReopeningCancelledSlot && (err?.message || err?.response?.data?.message || "").includes("bentrok")) {
          try {
            const retryRes: any = await psikologService.createJadwalSlot({
              id_psikolog: effectivePsikologId,
              tanggal: dateKey,
              jam_mulai: jamMulai,
              jam_selesai: jamSelesai,
              tipe_jadwal: "KONSULTASI",
              metode: selectedMetode,
              layanan: selectedLayanan,
              force_release: true,
            })
            if (retryRes && retryRes.id) {
              savedSlotId = retryRes.id
            } else {
              throw err
            }
          } catch (retryErr: any) {
            console.error("Gagal simpan slot ke database (retry):", retryErr)
            const errMsg =
              retryErr?.response?.data?.message || retryErr?.message || "Gagal menyimpan jadwal ke database."
            alert(`Gagal membuka slot jam ${jamMulai} - ${jamSelesai}: ${errMsg}`)
            return
          }
        } else {
          console.error("Gagal simpan slot ke database:", err)
          const errMsg = err?.response?.data?.message || err?.message || "Gagal menyimpan jadwal ke database."
          alert(`Gagal membuka slot jam ${jamMulai} - ${jamSelesai}: ${errMsg}`)
          return
        }
      }

      newSlotItems.push({
        id: savedSlotId,
        id_psikolog: psikologId,
        nama_psikolog: psikologNama,
        tanggal: dateKey,
        jam_mulai: jamMulai,
        jam_selesai: jamSelesai,
        label_waktu: finalWaktu,
        metode: selectedMetode,
        layanan: selectedLayanan,
        status: "TERSEDIA",
        tipe_jadwal: "KONSULTASI",
      })

      newSessions.push({
        id: savedSlotId,
        date: dateKey,
        waktu: finalWaktu,
        layanan: selectedLayanan,
        metode: selectedMetode,
        namaKlien: "Tersedia",
        id_psikolog: psikologId,
        namaPsikolog: psikologNama,
        isAvailableSlot: true,
        status: "TERSEDIA",
      })
    }

    setBookedSessions((prev) => {
      const sessionMap = new Map<string, BookedSession>()
      prev.forEach((s) => sessionMap.set(`${s.date}_${s.waktu}`, s))
      newSessions.forEach((s) => sessionMap.set(`${s.date}_${s.waktu}`, s))
      return Array.from(sessionMap.values())
    })

    try {
      const raw = localStorage.getItem("empathika_custom_jadwal_slots")
      const current = raw ? JSON.parse(raw) : []
      const merged = Array.isArray(current) ? [...current] : []

      newSlotItems.forEach((newItem) => {
        const time5 = newItem.jam_mulai.substring(0, 5)
        const idx = merged.findIndex(
          (m: any) => m.tanggal === newItem.tanggal && (m.jam_mulai || "").substring(0, 5) === time5
        )
        if (idx >= 0) {
          merged[idx] = { ...merged[idx], ...newItem }
        } else {
          merged.push(newItem)
        }
      })
      localStorage.setItem("empathika_custom_jadwal_slots", JSON.stringify(merged))
      window.dispatchEvent(new Event("storage"))
    } catch { }

    await loadScheduleForPsikolog()

    setBookingSuccessMsg(
      `${timesToOpen.length} slot jam (${selectedMetode}) berhasil dibuka sekaligus atas nama ${psikologNama}! Slot ini sekarang aktif di database dan sistem booking klien.`
    )
    setSelectedTimes([])
    setIsCustomTime(false)
    setTimeout(() => setBookingSuccessMsg(null), 4500)
  }

  const isCurrentPsikolog = (s: BookedSession) => {
    if ((s as any).tipe_jadwal === "ASESMEN" || (s.layanan || "").toLowerCase().includes("asesmen")) {
      return false
    }
    return matchPsikologSession(s, resolvedPsikologId, resolvedPsikologName, resolvedAccountId)
  }

  return {
    today,
    date,
    setDate,
    handleSelectDate,
    datesWithSchedules,
    activePsikolog,
    selectedLayanan,
    setSelectedLayanan,
    layananOptions,
    selectedMetode,
    setSelectedMetode,
    allowedMetode,
    timeSlots,
    setTimeSlots,
    selectedTimes,
    setSelectedTimes,
    toggleTimeSlot,
    toggleSelectAll,
    isCustomTime,
    setIsCustomTime,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    deletedCustomSlots,
    setDeletedCustomSlots,
    handleRemoveSlot,
    handleDeleteCustomTimeSlot,
    bookedSessions,
    isCurrentPsikolog,
    handleBooking,
    bookingSuccessMsg,
    weekRangeLabel,
    canGoPrevWeek,
    canGoNextWeek,
    isCurrentWeek,
    goToPrevWeek,
    goToNextWeek,
    goToCurrentWeek,
    weekDays,
    currentWeekMonday,
    handleSelectDetailSession,
    handleCancelClientBooking,
    selectedDetailSession,
    setSelectedDetailSession,
    sessionToReschedule,
    setSessionToReschedule,
    handleConfirmReschedule,
    handleMarkCompleted,
    handleCopyWhatsAppMessage,
    actionToast,
  }
}
