"use client"

import { useState, useCallback } from "react"
import { bookingService } from "@/services/booking.service"
import { adminService } from "@/services/admin.service"
import {
  recordCancelledSession,
  canCancelSession,
  recordRescheduledSession,
  canRescheduleSession,
} from "@/features/konseling/utils/cancellationSync"
import { ClientSessionToday, ClientSessionStatus } from "@/features/konseling/types"
import { formatWhatsAppMessage } from "@/features/konseling/data/jadwalAdminData"
import { BookedSession, MetodeKonsultasi } from "../../components/psikolog/types"
import { isSessionPastOrCompleted } from "../../components/psikolog/utils/psikologDateUtils"

interface SessionActionsProps {
  activePsikolog: any
  user: any
  resolvedPsikologId: string
  bookedSessions: BookedSession[]
  setBookedSessions: React.Dispatch<React.SetStateAction<BookedSession[]>>
  deletedCustomSlots: string[]
  setTimeSlots: React.Dispatch<React.SetStateAction<string[]>>
  loadScheduleForPsikolog: () => Promise<void>
}

export function usePsikologSessionActions({
  activePsikolog,
  user,
  resolvedPsikologId,
  bookedSessions,
  setBookedSessions,
  deletedCustomSlots,
  setTimeSlots,
  loadScheduleForPsikolog,
}: SessionActionsProps) {
  const [selectedDetailSession, setSelectedDetailSession] = useState<ClientSessionToday | null>(null)
  const [sessionToReschedule, setSessionToReschedule] = useState<ClientSessionToday | null>(null)
  const [actionToast, setActionToast] = useState<{ message: string; type: "success" | "danger" } | null>(null)

  const triggerToast = (message: string, type: "success" | "danger" = "success") => {
    setActionToast({ message, type })
    setTimeout(() => setActionToast(null), 3500)
  }

  const convertSessionToDetail = useCallback(
    (s: BookedSession): ClientSessionToday => {
      const isPastOrDone = isSessionPastOrCompleted(s.date, s.waktu, s.status)
      let statusSession: ClientSessionStatus = "Menunggu Jadwal"
      if (s.isCancelled || s.status === "Dibatalkan" || s.status === "CANCELLED") {
        statusSession = "Dibatalkan"
      } else if (s.status === "Reschedule" || s.isRescheduled) {
        statusSession = "Reschedule"
      } else if (isPastOrDone || s.status === "Selesai" || s.status === "COMPLETED") {
        statusSession = "Selesai"
      }

      const isClient = !s.isAvailableSlot && s.namaKlien && s.namaKlien !== "Tersedia"
      return {
        id: s.id,
        date: s.date,
        tanggal: s.date,
        waktu: s.waktu,
        namaKlien: isClient && s.namaKlien ? s.namaKlien : s.namaKlien || "",
        klienId: s.klienId || "",
        kontak: s.kontak || undefined,
        psikolog:
          s.namaPsikolog ||
          activePsikolog?.nama_gelar ||
          (activePsikolog as any)?.account?.nama ||
          user?.name ||
          "",
        idPsikolog: s.id_psikolog || activePsikolog?.id,
        noTeleponPsikolog: (activePsikolog as any)?.no_telepon || "",
        layanan: s.layanan || "Konsultasi Psikologi",
        tipe: s.metode === "Online" ? "Online [Zoom]" : "Offline [Klinik]",
        catatan: s.catatan,
        status: statusSession,
        isPaid: true,
      }
    },
    [activePsikolog, user]
  )

  const handleSelectDetailSession = (s: BookedSession) => {
    setSelectedDetailSession(convertSessionToDetail(s))
  }

  const handleCancelClientBooking = async (sessionOrItem: BookedSession | ClientSessionToday) => {
    const targetId = sessionOrItem.id
    const targetDate = sessionOrItem.date || (sessionOrItem as any).tanggal || ""
    const targetTime = sessionOrItem.waktu
    const clientName = sessionOrItem.namaKlien || "Klien"
    const psikologName =
      (sessionOrItem as any).namaPsikolog ||
      (sessionOrItem as any).psikolog ||
      activePsikolog?.nama_gelar ||
      "Psikolog"

    if (!canCancelSession(targetDate)) {
      triggerToast("Pembatalan sesi hanya dapat dilakukan maksimal H-3 jam sebelum jadwal sesi.", "danger")
      return
    }

    setBookedSessions((prev) =>
      prev.map((s) => {
        const isMatch =
          (targetId && s.id === targetId) || (s.date === targetDate && s.waktu === targetTime)
        if (isMatch) {
          return { ...s, isCancelled: true, status: "Dibatalkan" }
        }
        return s
      })
    )

    recordCancelledSession({
      id: targetId,
      date: targetDate,
      waktu: targetTime,
      namaKlien: clientName,
      psikolog: psikologName,
    })

    const bookingUuid =
      (sessionOrItem as any).id_booking ||
      (sessionOrItem as any).booking?.id_booking ||
      (sessionOrItem as any).bookingId ||
      targetId

    if (
      bookingUuid &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(bookingUuid)
    ) {
      try {
        await bookingService.cancelBooking(bookingUuid)
      } catch (err: any) {
        console.warn("Backend cancel notice:", err?.response?.data?.message || err.message)
      }
    }
    if (
      targetId &&
      targetId !== bookingUuid &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(targetId)
    ) {
      try {
        await bookingService.cancelBooking(targetId)
      } catch (err: any) {
        console.warn("Backend cancel slot notice:", err?.response?.data?.message || err.message)
      }
    }

    triggerToast(`Sesi ${clientName} (${targetTime}) berhasil dibatalkan.`, "danger")
    loadScheduleForPsikolog()
  }

  const handleConfirmReschedule = async (
    id: string,
    newDate: string,
    newWaktu: string,
    alasan?: string
  ) => {
    const target = bookedSessions.find((s) => s.id === id)
    const targetDate = target?.date || sessionToReschedule?.date || sessionToReschedule?.tanggal || ""
    const targetTime = target?.waktu || sessionToReschedule?.waktu || ""
    const clientName = target?.namaKlien || sessionToReschedule?.namaKlien || "Klien"
    const psikologName =
      target?.namaPsikolog ||
      sessionToReschedule?.psikolog ||
      activePsikolog?.nama_gelar ||
      "Psikolog"

    if (!canRescheduleSession(targetDate, targetTime)) {
      triggerToast(
        "Reschedule tidak dapat dilakukan karena batas waktu maksimal reschedule (H-3 jam sebelum sesi dimulai) telah terlewati.",
        "danger"
      )
      return
    }

    try {
      await adminService.rescheduleBooking(id, {
        newDate,
        newWaktu,
        alasan,
      })

      recordRescheduledSession({
        id,
        date: targetDate,
        waktu: targetTime,
        newDate,
        newWaktu,
        namaKlien: clientName,
        psikolog: psikologName,
        idPsikolog: target?.id_psikolog || resolvedPsikologId,
        layanan: target?.layanan,
        metode: target?.metode,
        alasan,
      })

      triggerToast(
        `Sesi ${clientName} berhasil dijadwalkan ulang (Reschedule) ke ${newDate} (${newWaktu}).`,
        "success"
      )
      setSessionToReschedule(null)
      if (selectedDetailSession && selectedDetailSession.id === id) {
        setSelectedDetailSession(null)
      }

      setBookedSessions((prev) => {
        const next = prev.map((s) => {
          if (
            (id && s.id === id) ||
            (targetDate && targetTime && s.date === targetDate && s.waktu === targetTime)
          ) {
            return {
              ...s,
              status: "Reschedule",
              isRescheduled: true,
              isAvailableSlot: false,
            }
          }
          return s
        })

        const newExists = next.some((s) => s.date === newDate && s.waktu === newWaktu)
        if (!newExists) {
          next.push({
            id: `resched-new-${newDate}-${newWaktu}`,
            date: newDate,
            waktu: newWaktu,
            layanan: target?.layanan || sessionToReschedule?.layanan || "Konsultasi Psikologi",
            metode: (target?.metode ||
              (sessionToReschedule?.tipe?.includes("Offline") ? "Offline" : "Online") ||
              "Online") as MetodeKonsultasi,
            namaKlien: clientName,
            id_psikolog: target?.id_psikolog || sessionToReschedule?.idPsikolog || resolvedPsikologId,
            namaPsikolog: psikologName,
            isAvailableSlot: false,
            status: "Aktif",
            isRescheduled: false,
          })
        }
        return next
      })

      if (newWaktu && !deletedCustomSlots.includes(newWaktu)) {
        setTimeSlots((prev) => (prev.includes(newWaktu) ? prev : [...prev, newWaktu].sort()))
      }

      await loadScheduleForPsikolog()
    } catch (err: any) {
      console.error("Gagal reschedule booking ke database:", err)
      const msg = err?.response?.data?.message || err?.message || "Gagal menjadwalkan ulang sesi."
      triggerToast(msg, "danger")
    }
  }

  const handleMarkCompleted = async (id: string, namaKlien: string) => {
    if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      try {
        await adminService.updateBookingStatus(id, "COMPLETED")
      } catch (err: any) {
        console.warn("Update status error:", err?.response?.data?.message || err.message)
      }
    }

    setBookedSessions((prev) => prev.map((s) => (s.id === id ? { ...s, status: "Selesai" } : s)))
    triggerToast(`Sesi ${namaKlien} berhasil ditandai Selesai!`, "success")
    loadScheduleForPsikolog()
  }

  const handleCopyWhatsAppMessage = (session: ClientSessionToday) => {
    const text = formatWhatsAppMessage(session)
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text)
    }
    triggerToast(`Pesan jadwal untuk ${session.namaKlien} berhasil disalin ke clipboard!`, "success")
  }

  return {
    selectedDetailSession,
    setSelectedDetailSession,
    sessionToReschedule,
    setSessionToReschedule,
    actionToast,
    triggerToast,
    handleSelectDetailSession,
    handleCancelClientBooking,
    handleConfirmReschedule,
    handleMarkCompleted,
    handleCopyWhatsAppMessage,
  }
}
