"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { psikologService, JadwalSlotItem } from "@/services/psikolog.service"
import { adminService } from "@/services/admin.service"
import { bookingService } from "@/services/booking.service"
import { useAuthStore } from "@/store/authStore"
import {
  getCancelledSessions,
  isSessionCancelled,
  recordCancelledSession,
  canCancelSession,
  recordRescheduledSession,
  getRescheduledSessions,
  removeRescheduledSession,
  canRescheduleSession,
} from "@/features/konseling/utils/cancellationSync"
import { ClientSessionToday, ClientSessionStatus } from "@/features/konseling/types"
import { formatWhatsAppMessage } from "@/features/konseling/data/jadwalAdminData"
import { layananService } from "@/services/layanan.service"
import { getStoredLayanan } from "@/features/layanan/data/adminLayananData"
import {
  DEFAULT_LAYANAN_KONSULTASI,
  MetodeKonsultasi,
  BookedSession,
} from "../components/psikolog/types"
import {
  getMonday,
  formatDateKey,
  isSessionPastOrCompleted,
  matchPsikologSession,
} from "../components/psikolog/utils/psikologDateUtils"

const INITIAL_BOOKINGS: BookedSession[] = []

export function usePsikologJadwal() {
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const { user } = useAuthStore()

  const resolveActivePsikolog = useCallback(() => {
    if (typeof window === "undefined") {
      return { id: "0", nama_gelar: user?.name || "Psikolog Empathika", kategori: "psikolog" }
    }
    const savedName = localStorage.getItem("active_psikolog_name")
    const savedId = localStorage.getItem("active_psikolog_id")
    const isInvalid = !savedName || savedName.toLowerCase().includes("admin")

    const savedKat = typeof window !== "undefined" ? localStorage.getItem("active_psikolog_kategori") : null

    if (user?.role === "PSIKOLOG" && user?.name && !user.name.toLowerCase().includes("admin")) {
      return { id: user.id || "0", nama_gelar: user.name, kategori: savedKat || "psikolog" }
    }
    if (!isInvalid && savedName) {
      return { id: savedId || "0", nama_gelar: savedName, kategori: savedKat || "psikolog" }
    }
    return { id: "0", nama_gelar: user?.name || "Psikolog Empathika", kategori: savedKat || "psikolog" }
  }, [user])

  // State profil psikolog aktif
  const [activePsikolog, setActivePsikolog] = useState<{
    id: string
    nama_gelar: string
    kategori?: string
    account?: any
  } | null>(resolveActivePsikolog)

  const currentPsi = resolveActivePsikolog()
  const resolvedPsikologId =
    activePsikolog?.id && activePsikolog.id !== "0"
      ? activePsikolog.id
      : currentPsi?.id && currentPsi.id !== "0"
      ? currentPsi.id
      : typeof window !== "undefined"
      ? localStorage.getItem("active_psikolog_id") || "0"
      : "0"
  const resolvedPsikologName =
    activePsikolog?.nama_gelar ||
    activePsikolog?.account?.nama ||
    currentPsi?.nama_gelar ||
    (currentPsi as any)?.account?.nama ||
    (typeof window !== "undefined" ? localStorage.getItem("active_psikolog_name") || "" : "") ||
    user?.name ||
    ""
  const resolvedAccountId =
    (activePsikolog as any)?.id_account ||
    (activePsikolog as any)?.account?.id ||
    user?.id ||
    (typeof window !== "undefined" ? localStorage.getItem("active_psikolog_account_id") || "" : "")

  const [selectedLayanan, setSelectedLayanan] = useState<string>("Semua Layanan Konsultasi")
  const [layananOptions, setLayananOptions] = useState<string[]>(DEFAULT_LAYANAN_KONSULTASI)
  const [serviceItems, setServiceItems] = useState<any[]>([])
  const [selectedMetode, setSelectedMetode] = useState<MetodeKonsultasi>("Online")

  // Menentukan metode konsultasi yang diperbolehkan berdasarkan pengaturan layanan
  const allowedMetode = useMemo(() => {
    let targetServices = serviceItems
    if (selectedLayanan && selectedLayanan !== "Semua Layanan Konsultasi") {
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

  // Sinkronkan metode otomatis jika metode aktif tidak didukung
  useEffect(() => {
    if (allowedMetode.both) return
    if (allowedMetode.online && !allowedMetode.offline) {
      if (selectedMetode !== "Online") setSelectedMetode("Online")
    } else if (!allowedMetode.online && allowedMetode.offline) {
      if (selectedMetode !== "Offline") setSelectedMetode("Offline")
    }
  }, [allowedMetode, selectedMetode])

  const [selectedTimes, setSelectedTimes] = useState<string[]>([])
  const [date, setDate] = useState<Date | undefined>(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [currentWeekMonday, setCurrentWeekMonday] = useState<Date>(() => getMonday(new Date()))
  const [bookedSessions, setBookedSessions] = useState<BookedSession[]>(INITIAL_BOOKINGS)
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null)

  // Indikator tanggal yang sudah memiliki jadwal aktif
  const datesWithSchedules = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
      today.getDate()
    ).padStart(2, "0")}`

    const dates: Date[] = []
    const dateSet = new Set<string>()
    bookedSessions.forEach((s) => {
      if ((s as any).tipe_jadwal === "ASESMEN" || (s.layanan || "").toLowerCase().includes("asesmen")) return

      if (s.date && s.date >= todayKey && !s.isCancelled && s.status !== "Dibatalkan") {
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

  // Opsi input jam kustom
  const [isCustomTime, setIsCustomTime] = useState(false)
  const [customStart, setCustomStart] = useState("")
  const [customEnd, setCustomEnd] = useState("")

  // Daftar slot waktu bawaan awal
  const [timeSlots, setTimeSlots] = useState<string[]>([
    "09:00 - 10:00",
    "10:00 - 11:00",
    "13:30 - 14:30",
    "14:30 - 15:30",
    "15:30 - 16:30",
  ])

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

  // Daftar slot kustom yang telah dihapus oleh pengguna
  const [deletedCustomSlots, setDeletedCustomSlots] = useState<string[]>([])

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

  // State detail sesi yang sedang dipilih untuk pop-up modal
  const [selectedDetailSession, setSelectedDetailSession] = useState<ClientSessionToday | null>(null)
  const [sessionToReschedule, setSessionToReschedule] = useState<ClientSessionToday | null>(null)

  // Toast feedback aksi sesi
  const [actionToast, setActionToast] = useState<{ message: string; type: "success" | "danger" } | null>(null)

  const triggerToast = (message: string, type: "success" | "danger" = "success") => {
    setActionToast({ message, type })
    setTimeout(() => setActionToast(null), 3500)
  }

  // Konversi BookedSession ke bentuk ClientSessionToday untuk ModalDetailSesiKlien
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

  // Pembatalan otomatis sesi klien
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

  const isFetchingRef = useRef(false)

  // Sinkronkan jadwal dari Database PostgreSQL, Admin Overview, dan LocalStorage
  const loadScheduleForPsikolog = useCallback(async () => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true

    try {
      const currentPsi = resolveActivePsikolog()
      const resolvedPsikologId = currentPsi?.id || ""
      const resolvedPsikologName =
        currentPsi?.nama_gelar || (currentPsi as any)?.account?.nama || user?.name || "Tenaga Ahli"

      let res: any = null
      try {
        res = await psikologService.getJadwalSaya({ id_psikolog: resolvedPsikologId })
      } catch (err: any) {
        console.warn("Notice getJadwalSaya notice:", err?.message)
      }

      if (res && res.psikolog) {
        setActivePsikolog(res.psikolog)
        if (typeof window !== "undefined") {
          localStorage.setItem("active_psikolog_id", res.psikolog.id)
          localStorage.setItem("active_psikolog_name", res.psikolog.nama_gelar)
          if (res.psikolog.kategori) {
            localStorage.setItem("active_psikolog_kategori", res.psikolog.kategori)
          }
        }
      } else if (!activePsikolog && currentPsi) {
        setActivePsikolog(currentPsi)
      }

      const sessionMap = new Map<string, BookedSession>()

      if (res && res.slots && Array.isArray(res.slots)) {
        res.slots.forEach((s: any) => {
          if ((s.tipe_jadwal || "").toUpperCase() === "ASESMEN") return

          const mapKey = `${s.date}_${s.waktu}`
          const isCancelled =
            Boolean(s.is_cancelled) ||
            s.booking?.is_cancelled ||
            s.booking?.status_booking === "CANCELLED" ||
            s.status === "Dibatalkan"
          const isAvailable = s.status === "TERSEDIA" || isCancelled
          const hasActiveBooking = Boolean(
            s.booking &&
              !isCancelled &&
              s.booking.nama_klien &&
              s.booking.nama_klien.toLowerCase() !== "tersedia"
          )
          const clientPhone = s.booking?.no_telepon_klien || s.booking?.kontak || undefined

          const existing = sessionMap.get(mapKey)
          if (!existing || (existing.isAvailableSlot && hasActiveBooking)) {
            sessionMap.set(mapKey, {
              id: s.id,
              date: s.date,
              waktu: s.waktu,
              layanan: isAvailable ? "Slot Tersedia" : s.booking?.layanan || "Konsultasi Psikologi",
              metode: (s.booking?.metode
                ? s.booking.metode === "OFFLINE"
                  ? "Offline"
                  : "Online"
                : s.metode === "OFFLINE"
                ? "Offline"
                : s.metode === "KEDUANYA"
                ? "Keduanya"
                : "Online") as MetodeKonsultasi,
              namaKlien: isAvailable ? "Tersedia" : s.booking?.nama_klien || "Tersedia",
              kontak: isAvailable ? undefined : clientPhone,
              klienId: isAvailable ? undefined : s.booking?.klien_id,
              catatan: isAvailable ? undefined : s.booking?.deskripsi_trauma,
              id_psikolog: res.psikolog?.id || resolvedPsikologId,
              namaPsikolog: res.psikolog?.nama_gelar || resolvedPsikologName,
              isAvailableSlot: isAvailable,
              isCancelled: false,
              status: isAvailable ? "TERSEDIA" : "Aktif",
            })
          }
        })
      }

      try {
        const adminRes: any = await adminService.getJadwal({ date: date ? formatDateKey(date) : undefined })
        if (adminRes) {
          if (Array.isArray(adminRes.todaySessions)) {
            adminRes.todaySessions.forEach((t: any) => {
              if (
                (t.tipe_jadwal || "").toUpperCase() === "ASESMEN" ||
                (t.layanan || "").toLowerCase().includes("asesmen")
              )
                return

              const isMatch = matchPsikologSession(
                { idPsikolog: t.idPsikolog || t.id_psikolog, psikolog: t.psikolog },
                resolvedPsikologId,
                resolvedPsikologName,
                resolvedAccountId
              )

              if (isMatch && t.tanggal && t.waktuRange) {
                const mapKey = `${t.tanggal}_${t.waktuRange}`
                const isCancelled =
                  t.status === "Dibatalkan" || t.status === "Dibatalkan (Refund)" || Boolean(t.isCancelled)
                const hasActiveBooking =
                  Boolean(t.namaKlien && t.namaKlien.toLowerCase() !== "tersedia") && !isCancelled
                const existing = sessionMap.get(mapKey)

                if (!existing || (existing.isAvailableSlot && hasActiveBooking)) {
                  sessionMap.set(mapKey, {
                    id: t.id,
                    date: t.tanggal,
                    waktu: t.waktuRange,
                    layanan: t.layanan || "Konsultasi Psikologi",
                    metode: t.tipe?.includes("Offline") ? "Offline" : "Online",
                    namaKlien: isCancelled ? "Tersedia" : t.namaKlien || "",
                    kontak: isCancelled ? "" : t.kontak || "",
                    klienId: isCancelled ? "" : t.klienId || "",
                    catatan: isCancelled ? undefined : t.catatan,
                    id_psikolog: t.idPsikolog || resolvedPsikologId,
                    namaPsikolog: t.psikolog || resolvedPsikologName,
                    isAvailableSlot: isCancelled,
                    isCancelled: false,
                    status: isCancelled ? "TERSEDIA" : t.status,
                  })
                }
              }
            })
          }

          if (Array.isArray(adminRes.weeklyGrid)) {
            adminRes.weeklyGrid.forEach((w: any) => {
              if (
                (w.tipe_jadwal || "").toUpperCase() === "ASESMEN" ||
                (w.layanan || "").toLowerCase().includes("asesmen")
              )
                return

              const isMatch = matchPsikologSession(
                { id_psikolog: w.id_psikolog, psikologName: w.psikologName },
                resolvedPsikologId,
                resolvedPsikologName,
                resolvedAccountId
              )

              if (isMatch && w.date && w.timeSlot) {
                const mapKey = `${w.date}_${w.timeSlot}`
                const isBookingCancelled =
                  w.status === "Dibatalkan" ||
                  Boolean(w.isCancelled) ||
                  (w as any).booking_status === "CANCELLED"
                const hasActiveBooking =
                  Boolean(w.clientName && w.clientName.toLowerCase() !== "tersedia") && !isBookingCancelled
                const isAvailable =
                  (w.statusSlot === "TERSEDIA" && (!w.clientName || w.clientName === "Tersedia")) ||
                  isBookingCancelled
                const clientPhone = w.kontak || w.no_telepon || undefined
                const existing = sessionMap.get(mapKey)

                if (!existing || (existing.isAvailableSlot && hasActiveBooking)) {
                  sessionMap.set(mapKey, {
                    id: w.id,
                    date: w.date,
                    waktu: w.timeSlot,
                    layanan: isAvailable ? "Slot Tersedia" : w.layanan || "Konsultasi Psikologi",
                    metode: w.metode === "Offline" ? "Offline" : w.metode === "Keduanya" ? "Keduanya" : "Online",
                    namaKlien: isAvailable ? "Tersedia" : w.clientName || w.namaKlien || "",
                    kontak: isAvailable ? undefined : clientPhone,
                    klienId: isAvailable ? undefined : w.klienId || undefined,
                    catatan: isAvailable ? undefined : w.catatan,
                    id_psikolog: resolvedPsikologId,
                    namaPsikolog: w.psikologName || resolvedPsikologName,
                    isAvailableSlot: isAvailable,
                    isCancelled: false,
                    status: isAvailable ? "TERSEDIA" : "Aktif",
                  })
                }
              }
            })
          }
        }
      } catch (err: any) {
        console.warn("Notice loading admin weekly sessions fallback:", err?.message)
      }

      try {
        const raw = localStorage.getItem("empathika_custom_jadwal_slots")
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) {
            parsed.forEach((s: any) => {
              if (
                (s.tipe_jadwal || "").toUpperCase() === "ASESMEN" ||
                (s.layanan || "").toLowerCase().includes("asesmen")
              )
                return

              const isMatch = matchPsikologSession(
                { id_psikolog: s.id_psikolog, nama_psikolog: s.nama_psikolog },
                resolvedPsikologId,
                resolvedPsikologName,
                resolvedAccountId
              )

              if (isMatch && s.tanggal && s.jam_mulai) {
                const timeStr =
                  s.label_waktu ||
                  `${s.jam_mulai.substring(0, 5)} - ${(s.jam_selesai || "10:00").substring(0, 5)}`
                const mapKey = `${s.tanggal}_${timeStr}`
                if (!sessionMap.has(mapKey)) {
                  const isTersedia = (s.status || "TERSEDIA").toUpperCase() === "TERSEDIA"
                  sessionMap.set(mapKey, {
                    id: s.id,
                    date: s.tanggal,
                    waktu: timeStr,
                    layanan: s.layanan || "Konseling Individu",
                    metode: s.metode === "Offline" ? "Offline" : s.metode === "Keduanya" ? "Keduanya" : "Online",
                    namaKlien: isTersedia ? "Tersedia" : s.namaKlien || "",
                    id_psikolog: s.id_psikolog || resolvedPsikologId,
                    namaPsikolog: s.nama_psikolog || resolvedPsikologName,
                    isAvailableSlot: isTersedia,
                    status: s.status || "TERSEDIA",
                  })
                }
              }
            })
          }
        }
      } catch { }

      try {
        const cancelledList = getCancelledSessions()
        if (cancelledList.length > 0) {
          sessionMap.forEach((item, key) => {
            if (isSessionCancelled(item, cancelledList)) {
              sessionMap.set(key, {
                ...item,
                isCancelled: false,
                isAvailableSlot: true,
                namaKlien: "Tersedia",
                status: "TERSEDIA",
              })
            }
          })
        }
      } catch { }

      try {
        const rescheduledList = getRescheduledSessions()
        if (rescheduledList.length > 0) {
          rescheduledList.forEach((r) => {
            if (!r.date || !r.waktu) return

            const isMatch = matchPsikologSession(
              { id_psikolog: r.idPsikolog, psikologName: r.psikolog },
              resolvedPsikologId,
              resolvedPsikologName,
              resolvedAccountId
            )

            if (!r.psikolog || isMatch) {
              const oldKey = `${r.date}_${r.waktu}`
              const existing = sessionMap.get(oldKey)

              sessionMap.set(oldKey, {
                id: r.id || existing?.id || `resched-${r.date}-${r.waktu}`,
                date: r.date,
                waktu: r.waktu,
                layanan: r.layanan || existing?.layanan || "Konsultasi Psikologi",
                metode: (r.metode === "Offline"
                  ? "Offline"
                  : r.metode === "Keduanya"
                  ? "Keduanya"
                  : existing?.metode || "Online") as MetodeKonsultasi,
                namaKlien: r.namaKlien || existing?.namaKlien || "",
                kontak: existing?.kontak || undefined,
                klienId: existing?.klienId || undefined,
                catatan: existing?.catatan,
                id_psikolog: r.idPsikolog || resolvedPsikologId,
                namaPsikolog: r.psikolog || resolvedPsikologName,
                isAvailableSlot: false,
                status: "Reschedule",
                isRescheduled: true,
              })

              if (r.newDate && r.newWaktu) {
                const newKey = `${r.newDate}_${r.newWaktu}`
                const existingNew = sessionMap.get(newKey)
                sessionMap.set(newKey, {
                  id: r.id || existingNew?.id || `resched-new-${r.newDate}-${r.newWaktu}`,
                  date: r.newDate,
                  waktu: r.newWaktu,
                  layanan:
                    r.layanan || existingNew?.layanan || existing?.layanan || "Konsultasi Psikologi",
                  metode: (r.metode === "Offline"
                    ? "Offline"
                    : r.metode === "Keduanya"
                    ? "Keduanya"
                    : existingNew?.metode || existing?.metode || "Online") as MetodeKonsultasi,
                  namaKlien:
                    r.namaKlien || existingNew?.namaKlien || existing?.namaKlien || "Klien Terdaftar",
                  kontak: existingNew?.kontak || existing?.kontak,
                  klienId: existingNew?.klienId || existing?.klienId,
                  catatan: existingNew?.catatan || existing?.catatan,
                  id_psikolog: r.idPsikolog || resolvedPsikologId,
                  namaPsikolog: r.psikolog || resolvedPsikologName,
                  isAvailableSlot: false,
                  status: "Aktif",
                  isRescheduled: false,
                })
              }
            }
          })
        }
      } catch (err) {
        console.warn("Gagal menerapkan status reschedule:", err)
      }

      const allSessions = Array.from(sessionMap.values())
      setBookedSessions(allSessions)

      allSessions.forEach((s) => {
        if (s.waktu && !deletedCustomSlots.includes(s.waktu)) {
          setTimeSlots((prev) => (prev.includes(s.waktu) ? prev : [...prev, s.waktu].sort()))
        }
      })
    } catch (err: any) {
      console.warn("Notice loading schedule:", err?.message)
    } finally {
      isFetchingRef.current = false
    }
  }, [date, deletedCustomSlots, user, resolveActivePsikolog, activePsikolog])

  useEffect(() => {
    loadScheduleForPsikolog()
  }, [loadScheduleForPsikolog, currentWeekMonday])

  useEffect(() => {
    let isMounted = true
    const myRole = (activePsikolog?.kategori || "").toLowerCase()
    const cleanRole = myRole.includes("peer") ? "peer" : myRole.includes("konselor") ? "konselor" : "psikolog"

    layananService
      .getAll({ kategori: "KONSULTASI", kategori_tenaga: cleanRole })
      .then((res: any) => {
        if (!isMounted) return
        const raw = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        const activeServices: any[] = []
        const activeNames: string[] = []

        raw.forEach((l: any) => {
          if (l.aktif === false || l.status === "Nonaktif") return
          const profs: string[] = l.profesi_tersedia || []
          let matchProf = true
          if (profs.length > 0) {
            matchProf = profs.includes(cleanRole)
          } else {
            const t = l.tarif_tenaga_ahli
            if (cleanRole === "psikolog") {
              matchProf = Boolean(
                (t?.psikolog && (Number(t.psikolog.weekday) > 0 || Number(t.psikolog.weekend) > 0)) ||
                  (!t && (Number(l.harga_weekday) > 0 || Number(l.harga_weekend) > 0))
              )
            } else if (cleanRole === "konselor") {
              matchProf = Boolean(t?.konselor && (Number(t.konselor.weekday) > 0 || Number(t.konselor.weekend) > 0))
            } else if (cleanRole === "peer") {
              matchProf = Boolean(t?.peer && (Number(t.peer.weekday) > 0 || Number(t.peer.weekend) > 0))
            }
          }
          if (matchProf) {
            activeServices.push(l)
            if (l.nama) activeNames.push(l.nama.trim())
          }
        })

        try {
          const stored = getStoredLayanan().filter(
            (item: any) =>
              (item.kategoriId === "01" || (item.kategori || "").toUpperCase() === "KONSULTASI") &&
              item.status !== "Nonaktif"
          )
          stored.forEach((item: any) => {
            const itemTitle = (item.layanan || item.nama || "").trim()
            if (!itemTitle) return
            const alreadyExists = activeServices.some(
              (s) => (s.nama || s.layanan || "").trim().toLowerCase() === itemTitle.toLowerCase()
            )
            if (!alreadyExists) {
              const t = item.tarif_tenaga_ahli
              let isMatch = true
              if (t && typeof t === "object") {
                if (cleanRole === "psikolog")
                  isMatch = Boolean(t.psikolog && (t.psikolog.weekday || t.psikolog.weekend))
                else if (cleanRole === "konselor")
                  isMatch = Boolean(t.konselor && (t.konselor.weekday || t.konselor.weekend))
                else if (cleanRole === "peer")
                  isMatch = Boolean(t.peer && (t.peer.weekday || t.peer.weekend))
              }
              if (isMatch) {
                activeServices.push(item)
                activeNames.push(itemTitle)
              }
            }
          })
        } catch { }

        if (activeServices.length === 0) {
          activeServices.push({
            id: "konsultasi-individu-01",
            nama: "Konsultasi Individu",
            layanan: "Konsultasi Individu",
            metode: "Online/Offline",
            status: "Aktif",
          })
          activeNames.push("Konsultasi Individu")
        }

        setServiceItems(activeServices)

        const uniqueNames: string[] = Array.from(new Set<string>(activeNames))
        if (uniqueNames.length > 0) {
          setLayananOptions(["Semua Layanan Konsultasi", ...uniqueNames])
        } else {
          setLayananOptions(["Semua Layanan Konsultasi"])
        }
      })
      .catch((err) => {
        console.warn("Gagal memuat layanan konsultasi:", err?.message)
      })

    return () => {
      isMounted = false
    }
  }, [activePsikolog?.kategori])

  useEffect(() => {
    const handleSyncCancelled = (e?: any) => {
      const cancelledList = getCancelledSessions()
      const newCancelled = e?.detail

      setBookedSessions((prev) =>
        prev.map((s) => {
          const matchDetail =
            newCancelled &&
            (s.id === newCancelled.id ||
              (newCancelled.date && s.date === newCancelled.date && s.waktu === newCancelled.waktu) ||
              (newCancelled.namaKlien &&
                s.namaKlien &&
                s.namaKlien.toLowerCase() === newCancelled.namaKlien.toLowerCase() &&
                s.waktu === newCancelled.waktu))

          if (matchDetail || isSessionCancelled(s, cancelledList)) {
            return { ...s, isCancelled: false, isAvailableSlot: true, namaKlien: "Tersedia", status: "TERSEDIA" }
          }
          return s
        })
      )
    }

    const handleAutoRefetch = () => {
      loadScheduleForPsikolog()
    }

    handleSyncCancelled()
    window.addEventListener("storage", handleSyncCancelled)
    window.addEventListener("storage", loadScheduleForPsikolog)
    window.addEventListener("empathika_session_cancelled", handleSyncCancelled as EventListener)
    window.addEventListener("empathika_session_rescheduled", loadScheduleForPsikolog as EventListener)
    window.addEventListener("empathika_booking_created", handleAutoRefetch as EventListener)
    window.addEventListener("focus", handleAutoRefetch)
    document.addEventListener("visibilitychange", handleAutoRefetch)

    const pollInterval = setInterval(handleAutoRefetch, 12000)

    return () => {
      window.removeEventListener("storage", handleSyncCancelled)
      window.removeEventListener("storage", loadScheduleForPsikolog)
      window.removeEventListener("empathika_session_cancelled", handleSyncCancelled as EventListener)
      window.removeEventListener("empathika_session_rescheduled", loadScheduleForPsikolog as EventListener)
      window.removeEventListener("empathika_booking_created", handleAutoRefetch as EventListener)
      window.removeEventListener("focus", handleAutoRefetch)
      document.removeEventListener("visibilitychange", handleAutoRefetch)
      clearInterval(pollInterval)
    }
  }, [loadScheduleForPsikolog])

  const handleSelectDate = (newDate: Date | undefined) => {
    if (newDate) {
      if (newDate < today) return
      setDate(newDate)
      setCurrentWeekMonday(getMonday(newDate))
      setSelectedTimes([])
      setIsCustomTime(false)
      setBookingSuccessMsg(null)
    }
  }

  const weekDays = useMemo(() => {
    const dayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]
    const monthNamesShort = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agus", "Sep", "Okt", "Nov", "Des",
    ]

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(currentWeekMonday)
      d.setDate(currentWeekMonday.getDate() + i)
      const dateKey = formatDateKey(d)
      return {
        dayName: dayNames[i],
        dateKey,
        dateLabel: `${d.getDate()} ${monthNamesShort[d.getMonth()]}`,
        isSameAsSelected: date ? dateKey === formatDateKey(date) : false,
      }
    })
  }, [currentWeekMonday, date])

  const weekRangeLabel = useMemo(() => {
    const start = new Date(currentWeekMonday)
    const end = new Date(currentWeekMonday)
    end.setDate(currentWeekMonday.getDate() + 6)

    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ]

    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} - ${end.getDate()} ${monthNames[start.getMonth()]} ${start.getFullYear()}`
    } else {
      return `${start.getDate()} ${monthNames[start.getMonth()].slice(0, 4)} - ${end.getDate()} ${
        monthNames[end.getMonth()]
      } ${end.getFullYear()}`
    }
  }, [currentWeekMonday])

  const firstMondayOfMonth = useMemo(() => {
    const now = new Date()
    const d = getMonday(new Date(now.getFullYear(), now.getMonth(), 1))
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const maxNavMonday = useMemo(() => {
    const now = new Date()
    const defaultEndMonday = getMonday(new Date(now.getFullYear(), now.getMonth() + 1, 0))
    defaultEndMonday.setHours(0, 0, 0, 0)

    let furthest = defaultEndMonday

    bookedSessions.forEach((s) => {
      if (s.date && !s.isCancelled && s.status !== "Dibatalkan") {
        const parts = s.date.split("-").map(Number)
        if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
          const sessionDate = new Date(parts[0], parts[1] - 1, parts[2])
          sessionDate.setHours(0, 0, 0, 0)
          const sessionMonday = getMonday(sessionDate)
          sessionMonday.setHours(0, 0, 0, 0)
          if (sessionMonday.getTime() > furthest.getTime()) {
            furthest = sessionMonday
          }
        }
      }
    })

    if (date) {
      const selectedMonday = getMonday(date)
      selectedMonday.setHours(0, 0, 0, 0)
      if (selectedMonday.getTime() > furthest.getTime()) {
        furthest = selectedMonday
      }
    }

    return furthest
  }, [bookedSessions, date])

  const canGoPrevWeek = useMemo(() => {
    const prevMonday = new Date(currentWeekMonday)
    prevMonday.setDate(prevMonday.getDate() - 7)
    prevMonday.setHours(0, 0, 0, 0)
    return prevMonday >= firstMondayOfMonth
  }, [currentWeekMonday, firstMondayOfMonth])

  const canGoNextWeek = useMemo(() => {
    const nextMonday = new Date(currentWeekMonday)
    nextMonday.setDate(nextMonday.getDate() + 7)
    nextMonday.setHours(0, 0, 0, 0)
    return nextMonday <= maxNavMonday
  }, [currentWeekMonday, maxNavMonday])

  const currentWeekMondayToday = useMemo(() => {
    const d = getMonday(new Date())
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const isCurrentWeek = useMemo(() => {
    const cur = new Date(currentWeekMonday)
    cur.setHours(0, 0, 0, 0)
    return cur.getTime() === currentWeekMondayToday.getTime()
  }, [currentWeekMonday, currentWeekMondayToday])

  const goToCurrentWeek = () => {
    const now = new Date()
    setCurrentWeekMonday(getMonday(now))
    setDate(now)
    setSelectedTimes([])
    setIsCustomTime(false)
    setBookingSuccessMsg(null)
  }

  const goToPrevWeek = () => {
    if (!canGoPrevWeek) return
    const prev = new Date(currentWeekMonday)
    prev.setDate(currentWeekMonday.getDate() - 7)
    setCurrentWeekMonday(prev)
    setSelectedTimes([])
    setIsCustomTime(false)
    setBookingSuccessMsg(null)
  }

  const goToNextWeek = () => {
    if (!canGoNextWeek) return
    const next = new Date(currentWeekMonday)
    next.setDate(currentWeekMonday.getDate() + 7)
    setCurrentWeekMonday(next)
    setSelectedTimes([])
    setIsCustomTime(false)
    setBookingSuccessMsg(null)
  }

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
