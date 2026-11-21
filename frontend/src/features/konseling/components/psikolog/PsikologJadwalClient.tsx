"use client"

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { PilihTanggalBox } from "@/components/shared/PilihTanggalBox"
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
  isSessionRescheduled,
  findOriginalRescheduledRecord,
  canRescheduleSession,
  removeCancelledSession,
} from "@/features/konseling/utils/cancellationSync"
import ModalDetailSesiKlien from "@/features/konseling/components/admin/ModalDetailSesiKlien"
import ModalRescheduleSesi from "@/features/konseling/components/admin/ModalRescheduleSesi"
import { ClientSessionToday, ClientSessionStatus } from "@/features/konseling/types"
import {
  formatWhatsAppMessage,
  formatWhatsAppPsikologReminder,
} from "@/features/konseling/data/jadwalAdminData"
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Video,
  Building2,
  Layers,
  X,
  User,
  CheckCircle2,
  Trash2,
  Sparkles,
  ChevronDown,
  AlertTriangle,
} from "lucide-react"
import { layananService } from "@/services/layanan.service"
import { getStoredLayanan } from "@/features/layanan/data/adminLayananData"

export const DEFAULT_LAYANAN_KONSULTASI = [
  "Semua Layanan Konsultasi",
]

export const DEFAULT_TIME_SLOTS = [
  "09:00 - 10:00",
  "10:00 - 11:00",
  "13:30 - 14:30",
  "14:30 - 15:30",
  "15:30 - 16:30",
]

export type MetodeKonsultasi = "Online" | "Offline" | "Keduanya"

interface BookedSession {
  id: string
  date: string // format YYYY-MM-DD
  waktu: string
  layanan: string
  metode: MetodeKonsultasi
  namaKlien?: string
  kontak?: string
  klienId?: string
  id_psikolog?: string
  namaPsikolog?: string
  noTeleponPsikolog?: string
  catatan?: string
  isAvailableSlot?: boolean
  status?: string
  isCancelled?: boolean
  isRescheduled?: boolean
}

const INITIAL_BOOKINGS: BookedSession[] = []

function getMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(date.getFullYear(), date.getMonth(), diff)
}

function formatDateKey(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatFullDateIndonesian(d: Date): string {
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ]
  return `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`
}

function isSlotPassed(dateKey?: string, waktu?: string): boolean {
  if (!dateKey) return false
  const now = new Date()
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  if (dateKey < todayKey) return true
  if (dateKey > todayKey) return false

  if (waktu) {
    const parts = waktu.split("-").map((s) => s.trim())
    const startTimeStr = parts[0]
    if (startTimeStr) {
      const [h, m] = startTimeStr.split(":").map(Number)
      if (!isNaN(h) && !isNaN(m)) {
        const currentMinutes = now.getHours() * 60 + now.getMinutes()
        const startMinutes = h * 60 + m
        return currentMinutes >= startMinutes
      }
    }
  }
  return false
}

function isSessionPastOrCompleted(dateKey?: string, waktu?: string, status?: string): boolean {
  if (status === "Selesai" || status === "COMPLETED") return true
  if (!dateKey) return false

  const now = new Date()
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`

  if (dateKey < todayKey) return true
  if (dateKey > todayKey) return false

  if (waktu) {
    const parts = waktu.split("-").map((s) => s.trim())
    const endTimeStr = parts[1] || parts[0]
    if (endTimeStr) {
      const [h, m] = endTimeStr.split(":").map(Number)
      if (!isNaN(h) && !isNaN(m)) {
        const currentMinutes = now.getHours() * 60 + now.getMinutes()
        const endMinutes = h * 60 + m
        return currentMinutes >= endMinutes
      }
    }
  }

  return false
}

function cleanRoleOrTitle(name: string): string {
  return (name || "")
    .toLowerCase()
    .replace(/\b(psikolog|konselor|peer|empathika|tenaga|ahli|admin|dr|dra|drs|m\.psi|s\.psi)\b/gi, "")
    .replace(/[^a-z0-9]/g, "")
    .trim()
}

export function matchPsikologSession(
  target: {
    id_psikolog?: string | null
    idPsikolog?: string | null
    namaPsikolog?: string | null
    psikolog?: string | null
    psikologName?: string | null
    nama_psikolog?: string | null
  },
  currentId?: string | null,
  currentName?: string | null,
  currentAccountId?: string | null
): boolean {
  const targetId = target.id_psikolog || target.idPsikolog
  const targetName = target.namaPsikolog || target.psikolog || target.psikologName || target.nama_psikolog

  // 1. Jika ada ID di target dan di psikolog login, WAJIB cocok
  if (targetId && targetId !== "0") {
    if (currentId && currentId !== "0" && targetId === currentId) return true
    if (currentAccountId && currentAccountId !== "0" && targetId === currentAccountId) return true
  }

  // 2. Jika nama cocok
  if (currentName && targetName) {
    const cleanCurrent = cleanRoleOrTitle(currentName)
    const cleanTarget = cleanRoleOrTitle(targetName)
    if (cleanCurrent.length >= 3 && cleanTarget.length >= 3) {
      if (cleanCurrent === cleanTarget || cleanCurrent.includes(cleanTarget) || cleanTarget.includes(cleanCurrent)) {
        return true
      }
    }
  }

  return false
}

export default function PsikologJadwalClient() {
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

  // State profil psikolog aktif yang diambil dari Database / LocalStorage
  const [activePsikolog, setActivePsikolog] = useState<{ id: string; nama_gelar: string; kategori?: string; account?: any } | null>(resolveActivePsikolog)

  const currentPsi = resolveActivePsikolog()
  const resolvedPsikologId = (activePsikolog?.id && activePsikolog.id !== "0")
    ? activePsikolog.id
    : (currentPsi?.id && currentPsi.id !== "0")
      ? currentPsi.id
      : (typeof window !== "undefined" ? localStorage.getItem("active_psikolog_id") || "0" : "0")
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

  // Menentukan metode konsultasi yang diperbolehkan berdasarkan pengaturan layanan di Admin
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

  // Sinkronkan metode otomatis jika metode aktif tidak didukung oleh layanan yang dipilih
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

  // Indikator tanggal yang sudah memiliki jadwal aktif di database (tanda bulatan kuning)
  // Hanya ditampilkan untuk tanggal hari ini dan berikutnya (tanggal lampau tidak dimunculkan)
  const datesWithSchedules = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

    const dates: Date[] = []
    const dateSet = new Set<string>()
    bookedSessions.forEach((s) => {
      if ((s as any).tipe_jadwal === "ASESMEN" || (s.layanan || "").toLowerCase().includes("asesmen")) return
      if (!matchPsikologSession(s, resolvedPsikologId, resolvedPsikologName, resolvedAccountId)) return

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

  // Opsi input jam kustom sendiri
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
    setSelectedTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    )
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
    setBookedSessions((prev) =>
      prev.filter((s) => !(s.date === dateKey && s.waktu === timeToRemove))
    )

    // 2. Hapus dari LocalStorage (empathika_custom_jadwal_slots)
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
    } catch {}

    // 3. Hapus dari Backend Database jika memiliki slot ID riil
    if (targetSession && targetSession.id && !targetSession.id.startsWith("mock-") && !targetSession.id.startsWith("slot-")) {
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

  // Daftar slot kustom yang telah dihapus oleh pengguna agar tidak muncul lagi di pilihan
  const [deletedCustomSlots, setDeletedCustomSlots] = useState<string[]>([])

  // Hapus opsi jam kustom dari daftar pilihan agar tampilan kembali bersih
  const handleDeleteCustomTimeSlot = async (timeToRemove: string) => {
    setDeletedCustomSlots((prev) => [...prev, timeToRemove])
    setTimeSlots((prev) => prev.filter((t) => t !== timeToRemove))
    setSelectedTimes((prev) => prev.filter((t) => t !== timeToRemove))

    // Hapus dari backend jika slot kustom ini tersimpan di database untuk tanggal yang sedang aktif
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

  // Toast feedback aksi sesi (pembatalan, salin link/pesan, selesai)
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
        namaKlien: (isClient && s.namaKlien) ? s.namaKlien : (s.namaKlien || ""),
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

  // Pembatalan otomatis sesi klien (maksimal H-3 jam)
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

    // Validasi aturan bisnis: Pembatalan hanya bisa dilakukan maksimal H-1 hari (tidak bisa di hari H)
    if (!canCancelSession(targetDate)) {
      triggerToast(
        "Pembatalan sesi hanya dapat dilakukan maksimal H-1 hari. Sesi pada hari H tidak dapat dibatalkan.",
        "danger"
      )
      return
    }

    // 1. Optimistic UI update di grid
    setBookedSessions((prev) =>
      prev.map((s) => {
        const isMatch =
          (targetId && s.id === targetId) ||
          (s.date === targetDate && s.waktu === targetTime)
        if (isMatch) {
          return { ...s, isCancelled: true, status: "Dibatalkan" }
        }
        return s
      })
    )

    // 2. Simpan ke sistem sinkronisasi pembatalan (localStorage + CustomEvent)
    recordCancelledSession({
      id: targetId,
      date: targetDate,
      waktu: targetTime,
      namaKlien: clientName,
      psikolog: psikologName,
    })

    // 3. Batalkan di backend jika ID adalah UUID booking resmi atau UUID slot
    const bookingUuid =
      (sessionOrItem as any).id_booking ||
      (sessionOrItem as any).booking?.id_booking ||
      (sessionOrItem as any).bookingId ||
      targetId

    if (bookingUuid && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(bookingUuid)) {
      try {
        await bookingService.cancelBooking(bookingUuid)
      } catch (err: any) {
        console.warn("Backend cancel notice:", err?.response?.data?.message || err.message)
      }
    }
    if (targetId && targetId !== bookingUuid && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(targetId)) {
      try {
        await bookingService.cancelBooking(targetId)
      } catch (err: any) {
        console.warn("Backend cancel slot notice:", err?.response?.data?.message || err.message)
      }
    }

    // 4. Toast notifikasi
    triggerToast(`Sesi ${clientName} (${targetTime}) berhasil dibatalkan.`, "danger")

    // 5. Muat ulang jadwal agar data konsisten
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

    // Validasi aturan bisnis: Reschedule hanya bisa dilakukan maksimal H-3 jam sebelum sesi dimulai
    if (!canRescheduleSession(targetDate, targetTime)) {
      triggerToast(
        "Reschedule tidak dapat dilakukan karena batas waktu maksimal reschedule (H-3 jam sebelum sesi dimulai) telah terlewati.",
        "danger"
      )
      return
    }

    try {
      // 1. Simpan perubahan reschedule ke database
      await adminService.rescheduleBooking(id, {
        newDate,
        newWaktu,
        alasan,
      })

      // 2. Catat reschedule untuk sinkronisasi tampilan
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
      // Optimistic update state bookedSessions
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
            metode: ((target?.metode || (sessionToReschedule?.tipe?.includes("Offline") ? "Offline" : "Online")) || "Online") as MetodeKonsultasi,
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

      // Pastikan slot baru ada di timeSlots
      if (newWaktu && !deletedCustomSlots.includes(newWaktu)) {
        setTimeSlots((prev) => (prev.includes(newWaktu) ? prev : [...prev, newWaktu].sort()))
      }

      // 3. Muat ulang jadwal langsung dari database agar slot lama kembali TERSEDIA dan berpindah ke slot baru
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

    setBookedSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "Selesai" } : s))
    )
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

  const handleCopyWhatsAppPsikologMessage = (session: ClientSessionToday) => {
    const text = formatWhatsAppPsikologReminder(session)
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text)
    }
    triggerToast(`Pesan pengingat jadwal untuk ${session.psikolog} berhasil disalin!`, "success")
  }

  const isFetchingRef = useRef(false)

  // Sinkronkan jadwal dari Database PostgreSQL, Admin Overview, dan LocalStorage
  const loadScheduleForPsikolog = useCallback(async () => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true

    try {
      const currentPsi = resolveActivePsikolog()
      const resolvedPsikologId = currentPsi?.id || ""
      const resolvedPsikologName = currentPsi?.nama_gelar || (currentPsi as any)?.account?.nama || user?.name || "Tenaga Ahli"

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

      // 1. Slot dari endpoint portal psikolog (res.slots)
      // Khusus sesi KONSULTASI psikolog (jadwal asesmen tidak dimasukkan karena asesmen langsung ke kantor Empathika)
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
          const hasActiveBooking = Boolean(s.booking && !isCancelled && s.booking.nama_klien && s.booking.nama_klien.toLowerCase() !== "tersedia")
          const clientPhone = s.booking?.no_telepon_klien || s.booking?.kontak || undefined

          const existing = sessionMap.get(mapKey)
          if (!existing || (existing.isAvailableSlot && hasActiveBooking)) {
            sessionMap.set(mapKey, {
              id: s.id,
              date: s.date,
              waktu: s.waktu,
              layanan: isAvailable ? "Slot Tersedia" : (s.booking?.layanan || "Konsultasi Psikologi"),
              metode: (s.booking?.metode
                ? (s.booking.metode === "OFFLINE" ? "Offline" : "Online")
                : (s.metode === "OFFLINE" ? "Offline" : s.metode === "KEDUANYA" ? "Keduanya" : "Online")) as MetodeKonsultasi,
              namaKlien: isAvailable ? "Tersedia" : (s.booking?.nama_klien || "Tersedia"),
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

      // 2. Slot & Booking Klien dari overview admin (AdminService)
      try {
        const adminRes: any = await adminService.getJadwal({ date: date ? formatDateKey(date) : undefined })
        if (adminRes) {
          // A. Sesi Hari Ini (Abaikan sesi asesmen kantor)
          if (Array.isArray(adminRes.todaySessions)) {
            adminRes.todaySessions.forEach((t: any) => {
              if ((t.tipe_jadwal || "").toUpperCase() === "ASESMEN" || (t.layanan || "").toLowerCase().includes("asesmen")) return

              const isMatch = matchPsikologSession(
                { idPsikolog: t.idPsikolog || t.id_psikolog, psikolog: t.psikolog },
                resolvedPsikologId,
                resolvedPsikologName,
                resolvedAccountId
              )

              if (isMatch && t.tanggal && t.waktuRange) {
                const mapKey = `${t.tanggal}_${t.waktuRange}`
                const isCancelled = t.status === "Dibatalkan" || t.status === "Dibatalkan (Refund)" || Boolean(t.isCancelled)
                const hasActiveBooking = Boolean(t.namaKlien && t.namaKlien.toLowerCase() !== "tersedia") && !isCancelled
                const existing = sessionMap.get(mapKey)

                if (!existing || (existing.isAvailableSlot && hasActiveBooking)) {
                  sessionMap.set(mapKey, {
                    id: t.id,
                    date: t.tanggal,
                    waktu: t.waktuRange,
                    layanan: t.layanan || "Konsultasi Psikologi",
                    metode: t.tipe?.includes("Offline") ? "Offline" : "Online",
                    namaKlien: isCancelled ? "Tersedia" : (t.namaKlien || ""),
                    kontak: isCancelled ? "" : (t.kontak || ""),
                    klienId: isCancelled ? "" : (t.klienId || ""),
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

          // B. Sesi Grid Mingguan (Hanya sesi konsultasi milik psikolog ini, bukan asesmen kantor)
          if (Array.isArray(adminRes.weeklyGrid)) {
            adminRes.weeklyGrid.forEach((w: any) => {
              if ((w.tipe_jadwal || "").toUpperCase() === "ASESMEN" || (w.layanan || "").toLowerCase().includes("asesmen")) return

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
                  Boolean(w.clientName && w.clientName.toLowerCase() !== "tersedia") &&
                  !isBookingCancelled
                const isAvailable = (w.statusSlot === "TERSEDIA" && (!w.clientName || w.clientName === "Tersedia")) || isBookingCancelled
                const clientPhone = w.kontak || w.no_telepon || undefined
                const existing = sessionMap.get(mapKey)

                if (!existing || (existing.isAvailableSlot && hasActiveBooking)) {
                  sessionMap.set(mapKey, {
                    id: w.id,
                    date: w.date,
                    waktu: w.timeSlot,
                    layanan: isAvailable ? "Slot Tersedia" : (w.layanan || "Konsultasi Psikologi"),
                    metode: w.metode === "Offline" ? "Offline" : w.metode === "Keduanya" ? "Keduanya" : "Online",
                    namaKlien: isAvailable ? "Tersedia" : (w.clientName || w.namaKlien || ""),
                    kontak: isAvailable ? undefined : clientPhone,
                    klienId: isAvailable ? undefined : (w.klienId || undefined),
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

      // 3. Slot dari LocalStorage (empathika_custom_jadwal_slots)
      try {
        const raw = localStorage.getItem("empathika_custom_jadwal_slots")
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) {
            parsed.forEach((s: any) => {
              if ((s.tipe_jadwal || "").toUpperCase() === "ASESMEN" || (s.layanan || "").toLowerCase().includes("asesmen")) return

              const isMatch = matchPsikologSession(
                { id_psikolog: s.id_psikolog, nama_psikolog: s.nama_psikolog },
                resolvedPsikologId,
                resolvedPsikologName,
                resolvedAccountId
              )

              if (isMatch && s.tanggal && s.jam_mulai) {
                const timeStr = s.label_waktu || `${s.jam_mulai.substring(0, 5)} - ${(s.jam_selesai || "10:00").substring(0, 5)}`
                const mapKey = `${s.tanggal}_${timeStr}`
                if (!sessionMap.has(mapKey)) {
                  const isTersedia = (s.status || "TERSEDIA").toUpperCase() === "TERSEDIA"
                  sessionMap.set(mapKey, {
                    id: s.id,
                    date: s.tanggal,
                    waktu: timeStr,
                    layanan: s.layanan || "Konseling Individu",
                    metode: s.metode === "Offline" ? "Offline" : s.metode === "Keduanya" ? "Keduanya" : "Online",
                    namaKlien: isTersedia ? "Tersedia" : (s.namaKlien || ""),
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
      } catch {}

      // 4. Terapkan status pembatalan admin: jika dibatalkan, tidak ada klien aktif -> slot kembali menjadi Tersedia
      try {
        const cancelledList = getCancelledSessions()
        if (cancelledList.length > 0) {
          sessionMap.forEach((item, key) => {
            if (isSessionCancelled(item, cancelledList)) {
              sessionMap.set(key, { ...item, isCancelled: false, isAvailableSlot: true, namaKlien: "Tersedia", status: "TERSEDIA" })
            }
          })
        }
      } catch {}

      // 5. Terapkan status reschedule admin / psikolog pada slot tanggal awal
      try {
        const rescheduledList = getRescheduledSessions()
        if (rescheduledList.length > 0) {
          rescheduledList.forEach((r) => {
            if (!r.date || !r.waktu) return

            // Pastikan jika ada psikolog terasosiasi, cocokkan dengan psikolog aktif
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
                metode: (r.metode === "Offline" ? "Offline" : r.metode === "Keduanya" ? "Keduanya" : (existing?.metode || "Online")) as MetodeKonsultasi,
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

              // Pindahkan booking klien aktif ke tanggal dan jam baru hasil reschedule
              if (r.newDate && r.newWaktu) {
                const newKey = `${r.newDate}_${r.newWaktu}`
                const existingNew = sessionMap.get(newKey)
                sessionMap.set(newKey, {
                  id: r.id || existingNew?.id || `resched-new-${r.newDate}-${r.newWaktu}`,
                  date: r.newDate,
                  waktu: r.newWaktu,
                  layanan: r.layanan || existingNew?.layanan || existing?.layanan || "Konsultasi Psikologi",
                  metode: (r.metode === "Offline" ? "Offline" : r.metode === "Keduanya" ? "Keduanya" : (existingNew?.metode || existing?.metode || "Online")) as MetodeKonsultasi,
                  namaKlien: r.namaKlien || existingNew?.namaKlien || existing?.namaKlien || "Klien Terdaftar",
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

      // Tambahkan slot baru ke timeSlots jika belum ada dan bukan slot yang sengaja dihapus
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
  }, [date, deletedCustomSlots, user, resolveActivePsikolog])

  // Muat jadwal satu kali saat komponen dimuat dan saat navigasi minggu kalender berubah
  useEffect(() => {
    loadScheduleForPsikolog()
  }, [loadScheduleForPsikolog, currentWeekMonday])

  // Ambil daftar layanan kategori KONSULTASI murni dari database/API yang sesuai dengan profesi tenaga ahli
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
              matchProf = Boolean((t?.psikolog && (Number(t.psikolog.weekday) > 0 || Number(t.psikolog.weekend) > 0)) ||
                     (!t && (Number(l.harga_weekday) > 0 || Number(l.harga_weekend) > 0)))
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

        // Periksa juga jika ada layanan konsultasi aktif dari database/admin storage lokal
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
                if (cleanRole === "psikolog") isMatch = Boolean(t.psikolog && (t.psikolog.weekday || t.psikolog.weekend))
                else if (cleanRole === "konselor") isMatch = Boolean(t.konselor && (t.konselor.weekday || t.konselor.weekend))
                else if (cleanRole === "peer") isMatch = Boolean(t.peer && (t.peer.weekday || t.peer.weekend))
              }
              if (isMatch) {
                activeServices.push(item)
                activeNames.push(itemTitle)
              }
            }
          })
        } catch {}

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

  // Listener real-time: jika admin membatalkan sesi di halaman admin, otomatis jadwal psikolog ter-update
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

    // Polling periodik berkala agar booking dari browser lain otomatis termutakhirkan
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
  }, [])

  // Sinkronkan minggu saat memilih tanggal dari kalender dan reset pilihan jam
  const handleSelectDate = (newDate: Date | undefined) => {
    if (newDate) {
      if (newDate < today) return
      setDate(newDate)
      setCurrentWeekMonday(getMonday(newDate))
      // Reset centang pilihan jam agar keulang bersih saat ganti tanggal
      setSelectedTimes([])
      setIsCustomTime(false)
      setBookingSuccessMsg(null)
    }
  }

  // 7 hari dalam seminggu (Senin - Minggu)
  const weekDays = useMemo(() => {
    const dayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]
    const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agus", "Sep", "Okt", "Nov", "Des"]

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

  // Judul range minggu: "3 - 9 Agustus 2026"
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
      return `${start.getDate()} ${monthNames[start.getMonth()].slice(0, 4)} - ${end.getDate()} ${monthNames[end.getMonth()]} ${end.getFullYear()}`
    }
  }, [currentWeekMonday])

  // Batas awal navigasi mingguan: Senin pertama di bulan berjalan saat ini (tidak bisa mundur ke bulan lampau)
  const firstMondayOfMonth = useMemo(() => {
    const now = new Date()
    const d = getMonday(new Date(now.getFullYear(), now.getMonth(), 1))
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  // Batas akhir navigasi mingguan:
  // Secara default terkunci di akhir bulan berjalan saat ini.
  // Namun jika psikolog sudah membuka slot/jadwal ATAU ada sesi booking klien di bulan-bulan mendatang,
  // batas navigasi secara cerdas diperpanjang sampai ke minggu jadwal/booking terjauh tersebut.
  const maxNavMonday = useMemo(() => {
    const now = new Date()
    // Default: Senin terakhir dari bulan berjalan saat ini
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

    // Jika psikolog sedang memilih tanggal di kalender yang lebih jauh ke depan
    if (date) {
      const selectedMonday = getMonday(date)
      selectedMonday.setHours(0, 0, 0, 0)
      if (selectedMonday.getTime() > furthest.getTime()) {
        furthest = selectedMonday
      }
    }

    return furthest
  }, [bookedSessions, date])

  // Batasi navigasi mingguan
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

  // Simpan slot ketersediaan ke Database & LocalStorage (Bisa Sekaligus)
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
    const psikologNama = activePsikolog?.nama_gelar || activePsikolog?.account?.nama || currentPsi.nama_gelar || (currentPsi as any)?.account?.nama || savedName || user?.name || "Tenaga Ahli"

    const newSessions: BookedSession[] = []
    const newSlotItems: JadwalSlotItem[] = []

    for (const finalWaktu of timesToOpen) {
      const [start, end] = finalWaktu.split(" - ")
      const jamMulai = start?.trim() || "09:00"
      const jamSelesai = end?.trim() || "10:00"

      let savedSlotId = ""

      // Cek apakah slot jam ini sebelumnya dibatalkan atau memiliki riwayat pembatalan
      const matchedCancelled = bookedSessions.find(
        (s) =>
          s.date === dateKey &&
          s.waktu === finalWaktu &&
          (s.isCancelled || s.status === "Dibatalkan" || (s as any).is_cancelled)
      )
      const isLocallyCancelled = isSessionCancelled({ date: dateKey, waktu: finalWaktu })
      const isReopeningCancelledSlot = Boolean(matchedCancelled || isLocallyCancelled)

      // Pastikan booking yang menggantung dibatalkan terlebih dahulu di backend jika ada ID-nya
      const bookingIdToCancel =
        (matchedCancelled as any)?.id_booking ||
        (matchedCancelled as any)?.booking?.id_booking ||
        (matchedCancelled as any)?.bookingId
      if (bookingIdToCancel && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(bookingIdToCancel)) {
        try {
          await bookingService.cancelBooking(bookingIdToCancel)
        } catch {}
      } else if (matchedCancelled?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(matchedCancelled.id)) {
        try {
          await bookingService.cancelBooking(matchedCancelled.id)
        } catch {}
      }

      // 1. Simpan ke Backend Database PostgreSQL (dengan force_release jika membuka kembali slot yang pernah dibatalkan)
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
        // Jika server mendeteksi bentrok padahal slot dibatalkan, coba sekali lagi dengan force_release: true
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
            const errMsg = retryErr?.response?.data?.message || retryErr?.message || "Gagal menyimpan jadwal ke database."
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
      })

      if (!timeSlots.includes(finalWaktu)) {
        setTimeSlots((prev) => [...prev, finalWaktu].sort())
      }
      setDeletedCustomSlots((prev) => prev.filter((t) => t !== finalWaktu))
    }

    // 2. Simpan juga ke localStorage (empathika_custom_jadwal_slots) agar selalu persisten dan reaktif
    try {
      const raw = localStorage.getItem("empathika_custom_jadwal_slots")
      const current = raw ? JSON.parse(raw) : []
      newSlotItems.forEach((item) => {
        const exists = current.some(
          (c: any) =>
            c.tanggal === item.tanggal &&
            c.jam_mulai === item.jam_mulai &&
            c.nama_psikolog === item.nama_psikolog
        )
        if (!exists) current.push(item)
      })
      localStorage.setItem("empathika_custom_jadwal_slots", JSON.stringify(current))
      window.dispatchEvent(new Event("storage"))
    } catch {}

    // Bersihkan status pembatalan dan reschedule di penyimpanan lokal jika slot jam dibuka kembali
    try {
      timesToOpen.forEach((tw) => {
        removeCancelledSession({ date: dateKey, waktu: tw })
        removeRescheduledSession({ date: dateKey, waktu: tw })
      })
    } catch {}

    // 3. Update state secara optimis
    setBookedSessions((prev) => {
      const map = new Map<string, BookedSession>()
      prev.forEach((s) => map.set(`${s.date}_${s.waktu}`, s))
      newSessions.forEach((s) => map.set(`${s.date}_${s.waktu}`, s))
      return Array.from(map.values())
    })

    // 4. Muat ulang seluruh jadwal riil
    await loadScheduleForPsikolog()

    setBookingSuccessMsg(
      `${timesToOpen.length} slot jam (${selectedMetode}) berhasil dibuka sekaligus atas nama ${psikologNama}! Slot ini sekarang aktif di database dan sistem booking klien.`
    )
    setSelectedTimes([])
    setIsCustomTime(false)
    setTimeout(() => setBookingSuccessMsg(null), 4500)
  }

  return (
    <div className="flex flex-col gap-6 font-poppins text-gray-800 pb-16">
      {/* Card 1: Jadwal Sesi Asesmen */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Jadwal Sesi Asesmen</h2>
            <p className="text-sm text-gray-500">
              Atur ketersediaan sesi konseling Anda. Pilih metode konsultasi, tentukan tanggal, lalu centang slot jam yang ingin dibuka untuk klien.
            </p>
          </div>
          {activePsikolog && (
            <div className="flex items-center gap-3 bg-gradient-to-r from-[#FAF5FD] to-[#F5EDF9] border border-purple-200/90 rounded-2xl px-4 py-2.5 shrink-0 shadow-2xs">
              <div className="w-9 h-9 rounded-full bg-[#561269] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                {(activePsikolog?.nama_gelar || "P")[0]}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wide">
                  Jadwal Praktik Anda
                </span>
                <span className="text-xs sm:text-sm font-bold text-[#561269] leading-tight">
                  {activePsikolog?.nama_gelar || (activePsikolog as any)?.account?.nama || "Psikolog Empathika"}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl items-stretch">
          {/* Step 1: Calendar Picker (Left) */}
          <PilihTanggalBox
            date={date}
            setDate={(newDate: Date) => handleSelectDate(newDate)}
            stepNumber={1}
            title="Pilih Tanggal Praktik"
            minDate={today}
            datesWithSlots={datesWithSchedules}
            legendLabel="Tanggal memiliki jadwal sesi / slot"
            showLegend={true}
            className="w-full h-full min-h-0"
            footerContent={
              date ? (
                <div className="flex items-center justify-center gap-1.5 text-center text-[11px] text-gray-500 pt-1">
                  <CalendarIcon className="w-3.5 h-3.5 text-[#561269]" />
                  <span>Tanggal dipilih:</span>
                  <span className="font-bold text-[#561269]">{formatFullDateIndonesian(date)}</span>
                </div>
              ) : null
            }
          />

          {/* Step 2: Time & Method Picker (Right) */}
          <div className="w-full h-full min-h-0 rounded-2xl border border-[#DCD0E1] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                    2
                  </div>
                  <h3 suppressHydrationWarning className="font-bold text-[14px] text-gray-900 capitalize">
                    {date ? formatFullDateIndonesian(date) : "Pilih Tanggal"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-xs font-bold text-[#561269] hover:underline cursor-pointer"
                >
                  {selectedTimes.length === timeSlots.length ? "Batal Pilih Semua" : "Pilih Semua"}
                </button>
              </div>

              {/* Pilihan Layanan Konsultasi */}
              <div className="mb-3 bg-purple-50/50 p-3 rounded-2xl border border-[#EDE0F2]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#561269]" />
                    Pilih Layanan Konsultasi:
                  </span>
                  <span className="text-[11px] font-semibold text-[#561269] bg-white px-2 py-0.5 rounded-full border border-purple-200 line-clamp-1 max-w-[170px] text-right">
                    {selectedLayanan}
                  </span>
                </div>

                <div className="relative">
                  <select
                    value={selectedLayanan}
                    onChange={(e) => setSelectedLayanan(e.target.value)}
                    className="w-full text-xs font-bold py-2 px-3 rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#561269] focus:border-[#561269] cursor-pointer shadow-2xs appearance-none pr-8 transition-colors hover:border-purple-300"
                  >
                    {layananOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Pilihan Metode Konsultasi (Compact & Modern dengan Icons) */}
              <div className="mb-3.5 bg-purple-50/50 p-3 rounded-2xl border border-[#EDE0F2]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-800">
                    Pilih Metode Konsultasi:
                  </span>
                  <span className="text-[11px] font-semibold text-[#561269] bg-white px-2.5 py-0.5 rounded-full border border-purple-200">
                    {selectedMetode === "Online"
                      ? "Online (Video Call)"
                      : selectedMetode === "Offline"
                        ? "Offline (Klinik)"
                        : "Fleksibel (Online & Offline)"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    disabled={!allowedMetode.online}
                    onClick={() => allowedMetode.online && setSelectedMetode("Online")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-bold transition-all ${
                      !allowedMetode.online
                        ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60 pointer-events-none"
                        : selectedMetode === "Online"
                        ? "border-[#561269] bg-white text-[#561269] shadow-xs ring-1 ring-[#561269] cursor-pointer"
                        : "border-gray-200 bg-white/70 text-gray-600 hover:bg-white cursor-pointer"
                    }`}
                    title={!allowedMetode.online ? "Metode Online tidak tersedia untuk layanan ini" : "Pilih metode Online"}
                  >
                    <Video className={`w-3.5 h-3.5 ${!allowedMetode.online ? "text-gray-400" : "text-[#561269]"}`} />
                    <span>Online</span>
                  </button>
                  <button
                    type="button"
                    disabled={!allowedMetode.offline}
                    onClick={() => allowedMetode.offline && setSelectedMetode("Offline")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-bold transition-all ${
                      !allowedMetode.offline
                        ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60 pointer-events-none"
                        : selectedMetode === "Offline"
                        ? "border-[#561269] bg-white text-[#561269] shadow-xs ring-1 ring-[#561269] cursor-pointer"
                        : "border-gray-200 bg-white/70 text-gray-600 hover:bg-white cursor-pointer"
                    }`}
                    title={!allowedMetode.offline ? "Metode Offline tidak tersedia untuk layanan ini" : "Pilih metode Offline"}
                  >
                    <Building2 className={`w-3.5 h-3.5 ${!allowedMetode.offline ? "text-gray-400" : "text-[#561269]"}`} />
                    <span>Offline</span>
                  </button>
                  <button
                    type="button"
                    disabled={!allowedMetode.both}
                    onClick={() => allowedMetode.both && setSelectedMetode("Keduanya")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-bold transition-all ${
                      !allowedMetode.both
                        ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60 pointer-events-none"
                        : selectedMetode === "Keduanya"
                        ? "border-[#561269] bg-white text-[#561269] shadow-xs ring-1 ring-[#561269] cursor-pointer"
                        : "border-gray-200 bg-white/70 text-gray-600 hover:bg-white cursor-pointer"
                    }`}
                    title={!allowedMetode.both ? "Layanan ini tidak mendukung metode fleksibel Keduanya" : "Pilih metode Keduanya (Fleksibel)"}
                  >
                    <Layers className={`w-3.5 h-3.5 ${!allowedMetode.both ? "text-gray-400" : "text-[#561269]"}`} />
                    <span>Keduanya</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-500 mb-2.5">
                Pilih slot jam yang ingin dibuka untuk layanan <span className="font-bold text-[#561269]">{selectedLayanan}</span> ({selectedMetode}):
              </p>

              {/* Checkbox List Slot Waktu */}
              <div className="flex flex-col gap-2.5 mb-3 max-h-[125px] overflow-y-auto pr-1.5 custom-scrollbar">
                {timeSlots.map((time, idx) => {
                  const isChecked = selectedTimes.includes(time)
                  const isCurrentPsikolog = (s: BookedSession) => {
                    if ((s as any).tipe_jadwal === "ASESMEN" || (s.layanan || "").toLowerCase().includes("asesmen")) {
                      return false
                    }
                    return matchPsikologSession(s, resolvedPsikologId, resolvedPsikologName, resolvedAccountId)
                  }

                  const openedSession = date
                    ? bookedSessions.find(
                      (s) =>
                        s.date === formatDateKey(date) &&
                        s.waktu === time &&
                        s.isAvailableSlot &&
                        !s.isCancelled &&
                        s.status !== "Dibatalkan" &&
                        !s.isRescheduled &&
                        s.status !== "Reschedule" &&
                        isCurrentPsikolog(s)
                    )
                    : undefined
                  const isAlreadyOpened = Boolean(openedSession)
                  const openedMetode = openedSession?.metode || "Online"

                  const reschedRecord = date
                    ? findOriginalRescheduledRecord({ date: formatDateKey(date), waktu: time })
                    : undefined

                  // Sesi dengan klien aktif (bukan slot kosong dan bukan dibatalkan / di-reschedule)
                  const bookedSession = date
                    ? bookedSessions.find(
                      (s) =>
                        s.date === formatDateKey(date) &&
                        s.waktu === time &&
                        !s.isAvailableSlot &&
                        s.namaKlien &&
                        s.namaKlien !== "Tersedia" &&
                        !s.isCancelled &&
                        s.status !== "Dibatalkan" &&
                        !s.isRescheduled &&
                        s.status !== "Reschedule" &&
                        !reschedRecord &&
                        isCurrentPsikolog(s)
                    )
                    : undefined
                  const isAlreadyBooked = Boolean(bookedSession) && !isAlreadyOpened
                  const isCustom = !DEFAULT_TIME_SLOTS.includes(time)

                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between border rounded-xl px-4 py-2.5 transition-all ${isChecked
                        ? "border-[#561269] bg-purple-50/70 shadow-2xs"
                        : isAlreadyOpened
                          ? "border-purple-300 bg-purple-50/30"
                          : isAlreadyBooked
                            ? "border-emerald-200 bg-emerald-50/30"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                        }`}
                    >
                      <label className="flex items-center gap-3 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleTimeSlot(time)}
                          className="w-4 h-4 text-[#561269] focus:ring-[#561269] rounded border-gray-300 cursor-pointer"
                        />
                        <span
                          className={`text-[13px] font-medium ${isChecked
                            ? "text-[#561269] font-bold"
                            : "text-gray-700"
                            }`}
                        >
                          {time}
                        </span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        {isAlreadyOpened && !isChecked && (
                          <div className="flex items-center gap-1">
                            <span
                              className="text-[10px] font-semibold text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-full"
                              title={`Layanan: ${openedSession?.layanan || "Konsultasi"}`}
                            >
                              Dibuka ({openedSession?.layanan && openedSession.layanan !== "Semua Layanan Konsultasi" ? `${openedSession.layanan.split(" ")[0]} • ` : ""}{openedMetode})
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleRemoveSlot(time)
                              }}
                              title="Tutup / Hapus slot jam ini"
                              className="text-gray-400 hover:text-rose-600 p-0.5 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        {isAlreadyBooked && !isChecked && (
                          <span className="text-[10px] font-semibold text-emerald-800 bg-[#E8F3ED] border border-[#b4d6be] px-2 py-0.5 rounded-full">
                            Ada Klien ({bookedSession?.metode})
                          </span>
                        )}
                        {isChecked && (
                          <span className="text-[11px] font-semibold text-[#561269] bg-purple-100/80 px-2.5 py-0.5 rounded-full">
                            Dipilih ({selectedMetode})
                          </span>
                        )}

                        {/* Tombol hapus khusus untuk jam yang dikustom sendiri agar pilihan clean lagi */}
                        {isCustom && (
                          <div className="flex items-center gap-1 ml-1 pl-1.5 border-l border-gray-200">
                            <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                              Kustom
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleDeleteCustomTimeSlot(time)
                              }}
                              title="Hapus jam kustom ini dari pilihan"
                              className="text-gray-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Opsi Tambahan: Tentukan Jam Kustom Sendiri (Di luar scroll list agar leluasa) */}
              <div
                className={`border rounded-xl px-4 py-2.5 transition-colors mb-4 ${isCustomTime
                  ? "border-[#561269] bg-purple-50/70 shadow-2xs"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                  }`}
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCustomTime}
                    onChange={() => setIsCustomTime(!isCustomTime)}
                    className="w-4 h-4 text-[#561269] focus:ring-[#561269] rounded border-gray-300 cursor-pointer"
                  />
                  <span className="text-[13px] font-medium text-gray-700">
                    Tentukan Jam Kustom Sendiri
                  </span>
                </label>

                {isCustomTime && (
                  <div className="flex flex-col gap-2 pl-7 pt-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <span className="text-[10px] text-gray-500 font-semibold block mb-1">
                          Jam Mulai
                        </span>
                        <input
                          type="time"
                          value={customStart}
                          onChange={(e) => setCustomStart(e.target.value)}
                          className="w-full text-xs font-semibold p-1.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#561269]"
                        />
                      </div>
                      <span className="text-gray-400 mt-4 text-xs font-bold">-</span>
                      <div className="flex-1">
                        <span className="text-[10px] text-gray-500 font-semibold block mb-1">
                          Jam Selesai
                        </span>
                        <input
                          type="time"
                          value={customEnd}
                          onChange={(e) => setCustomEnd(e.target.value)}
                          className="w-full text-xs font-semibold p-1.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#561269]"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (!customStart || !customEnd || customEnd <= customStart) {
                          alert("Jam selesai harus lebih akhir dari jam mulai.")
                          return
                        }
                        const customSlot = `${customStart} - ${customEnd}`
                        if (!timeSlots.includes(customSlot)) {
                          setTimeSlots((prev) => [...prev, customSlot].sort())
                        }
                        if (!selectedTimes.includes(customSlot)) {
                          setSelectedTimes((prev) => [...prev, customSlot])
                        }
                        setDeletedCustomSlots((prev) => prev.filter((t) => t !== customSlot))
                        setIsCustomTime(false)
                        setCustomStart("")
                        setCustomEnd("")
                      }}
                      className="text-left text-xs font-semibold text-[#561269] hover:text-[#3d0b4b] hover:underline cursor-pointer pt-0.5"
                    >
                      + Tambahkan ke Pilihan Jam
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {bookingSuccessMsg && (
                <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold animate-fadeIn bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{bookingSuccessMsg}</span>
                </div>
              )}
              {(() => {
                const isCustomValid = isCustomTime && Boolean(customStart) && Boolean(customEnd) && customEnd > customStart
                const canSubmit = selectedTimes.length > 0 || isCustomValid

                return (
                  <button
                    type="button"
                    onClick={handleBooking}
                    disabled={!canSubmit}
                    className={`w-full font-bold py-3.5 rounded-full text-[13px] transition-all cursor-pointer ${canSubmit
                      ? "bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 shadow-sm hover:shadow-md active:scale-95"
                      : "bg-[#d6d6d6] text-gray-500 cursor-not-allowed"
                      }`}
                  >
                    {selectedTimes.length > 0
                      ? `Buka ${selectedTimes.length} Jam Sesi Sekaligus`
                      : isCustomValid
                        ? `Buka Jam Kustom: ${customStart} - ${customEnd}`
                        : isCustomTime
                          ? "Tentukan Jam Mulai & Selesai Dulu"
                          : "Pilih Jam Terlebih Dahulu"}
                  </button>
                )
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Jadwal Mingguan Praktik */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Jadwal Mingguan</h2>
        <p className="text-sm text-gray-500 mb-6">
          Lihat ringkasan jadwal sesi konseling yang telah dibooking oleh klien dan slot yang Anda buka dalam satu minggu.
        </p>

        {/* Week Selector */}
        <div className="flex items-center gap-3 text-[13px] font-bold text-gray-800 mb-4">
          <button
            type="button"
            onClick={goToPrevWeek}
            disabled={!canGoPrevWeek}
            aria-label="Minggu Sebelumnya"
            title={canGoPrevWeek ? "Minggu Sebelumnya" : "Batas awal jadwal bulan berjalan (tanggal 1)"}
            className={`p-1.5 rounded-full transition-colors border ${
              canGoPrevWeek
                ? "hover:bg-gray-100 border-gray-200 text-gray-600 cursor-pointer"
                : "border-gray-100 text-gray-300 opacity-40 cursor-not-allowed pointer-events-none"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-gray-900 min-w-[160px] text-center">
            {weekRangeLabel}
          </span>
          <button
            type="button"
            onClick={goToNextWeek}
            disabled={!canGoNextWeek}
            aria-label="Minggu Berikutnya"
            title={
              canGoNextWeek
                ? "Minggu Berikutnya"
                : "Batas akhir jadwal (tidak ada jadwal aktif berikutnya di masa mendatang)"
            }
            className={`p-1.5 rounded-full transition-colors border ${
              canGoNextWeek
                ? "hover:bg-gray-100 border-gray-200 text-gray-600 cursor-pointer"
                : "border-gray-100 text-gray-300 opacity-40 cursor-not-allowed pointer-events-none"
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {!isCurrentWeek && (
            <button
              type="button"
              onClick={goToCurrentWeek}
              className="text-xs px-2.5 py-1 font-semibold text-[#561269] bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors ml-1 cursor-pointer"
            >
              Minggu Ini
            </button>
          )}
        </div>

        {/* Weekly Grid */}
        <div className="overflow-x-auto border border-gray-200 rounded-xl hide-scrollbar">
          <div className="min-w-[980px] xl:min-w-full">
            {/* Header */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/70">
              {weekDays.map((wd, i) => {
                const isPastDay = wd.dateKey < formatDateKey(today)
                return (
                  <div
                    key={i}
                    onClick={() => {
                      if (isPastDay) return
                      const targetDate = new Date(currentWeekMonday)
                      targetDate.setDate(currentWeekMonday.getDate() + i)
                      handleSelectDate(targetDate)
                    }}
                    title={isPastDay ? "Tanggal telah lewat" : "Klik untuk memilih tanggal ini"}
                    className={`py-3 flex flex-col items-center justify-center border-r border-gray-200 last:border-0 transition-colors ${
                      isPastDay
                        ? "cursor-default opacity-60 bg-gray-50/50"
                        : "cursor-pointer hover:bg-purple-50/50"
                    } ${wd.isSameAsSelected ? "bg-purple-50/80 ring-1 ring-inset ring-[#561269]/20" : ""}`}
                  >
                  <span
                    className={`text-[13px] font-bold ${wd.isSameAsSelected ? "text-[#561269]" : "text-gray-800"
                      }`}
                  >
                    {wd.dayName}
                  </span>
                  <span
                    className={`text-[11px] ${wd.isSameAsSelected ? "text-[#561269] font-bold" : "text-gray-500"
                      }`}
                  >
                    {wd.dateLabel}
                  </span>
                </div>
                )
              })}
            </div>

            {/* Grid Body */}
            <div className="grid grid-cols-7 min-h-[360px] divide-x divide-gray-200">
              {weekDays.map((wd, i) => {
                const sessions = bookedSessions
                  .filter(
                    (s) =>
                      s.date === wd.dateKey &&
                      (s as any).tipe_jadwal !== "ASESMEN" &&
                      !(s.layanan || "").toLowerCase().includes("asesmen") &&
                      matchPsikologSession(s, resolvedPsikologId, resolvedPsikologName, resolvedAccountId)
                  )
                  .sort((a, b) => a.waktu.localeCompare(b.waktu))

                const isTodayColumn = wd.dateKey === formatDateKey(today)

                return (
                  <div
                    key={i}
                    className={`p-2 flex flex-col gap-2 ${isTodayColumn
                      ? "bg-purple-50/25 ring-1 ring-inset ring-[#561269]/20"
                      : wd.isSameAsSelected
                        ? "bg-purple-50/10"
                        : "bg-white"
                      }`}
                  >
                    {sessions.length > 0 ? (
                      sessions.map((item, idx) => {
                        const isClientBooking = !item.isAvailableSlot && Boolean(item.namaKlien) && item.namaKlien !== "Tersedia"
                        const isCancelled = isClientBooking && (item.isCancelled || item.status === "Dibatalkan")
                        const reschedRecord = findOriginalRescheduledRecord({ date: item.date, waktu: item.waktu, id: item.id })
                        const isRescheduled = isClientBooking && (item.status === "Reschedule" || Boolean(item.isRescheduled) || Boolean(reschedRecord)) && !isCancelled

                        // 1. Sesi Dibatalkan (Jika dibatalkan dan tidak ada klien aktif, hapus keterangannya dan jangan render kartu)
                        if (isCancelled) {
                          return null
                        }

                        // 2. Reschedule
                        if (isRescheduled) {
                          return (
                            <div
                              key={item.id || idx}
                              onClick={() => handleSelectDetailSession(item)}
                              className="rounded-xl p-2.5 flex flex-col gap-1.5 shadow-2xs transition-all cursor-pointer hover:shadow-md hover:scale-[1.01] bg-amber-50/85 border border-amber-300 text-gray-700 overflow-hidden"
                            >
                              <div className="flex items-center justify-between gap-1 flex-wrap">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                  <span className="text-[11px] sm:text-xs font-bold text-amber-800 line-through whitespace-nowrap">
                                    {item.waktu}
                                  </span>
                                </div>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                                  Reschedule
                                </span>
                              </div>
                              <span className="text-xs font-semibold text-gray-700 line-through line-clamp-1">
                                {item.layanan}
                              </span>
                              <div className="flex items-center justify-between gap-1 text-[11px] text-gray-600">
                                <span className="truncate line-through">{item.namaKlien || "Klien"}</span>
                                <span className="font-semibold text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded text-[9px] shrink-0">
                                  {item.metode}
                                </span>
                              </div>
                            </div>
                          )
                        }

                        // 3. Sesi Klien (Sudah Dibooking)
                        if (isClientBooking) {
                          const isCompleted = isSessionPastOrCompleted(wd.dateKey || item.date, item.waktu, item.status)

                          if (isCompleted) {
                            return (
                              <div
                                key={item.id || idx}
                                onClick={() => handleSelectDetailSession(item)}
                                className="rounded-xl p-2.5 flex flex-col gap-1 shadow-2xs transition-all cursor-pointer hover:shadow-md hover:scale-[1.01] bg-gray-100/85 border border-gray-200/90 text-gray-500 overflow-hidden"
                              >
                                <div className="flex items-center justify-between gap-1 flex-wrap">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="w-2 h-2 rounded-full shrink-0 bg-gray-400" />
                                    <span className="text-[11px] sm:text-xs font-extrabold text-gray-600 whitespace-nowrap">
                                      {item.waktu}
                                    </span>
                                  </div>
                                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 shrink-0">
                                    Selesai
                                  </span>
                                </div>
                                <p className="text-xs font-bold leading-tight mt-0.5 text-gray-700 line-clamp-2">
                                  {item.layanan}
                                </p>
                                <div className="text-[10px] flex flex-col mt-0.5 leading-tight text-gray-500 gap-0.5">
                                  {item.namaKlien && (
                                    <span className="truncate">
                                      Klien:{" "}
                                      <strong className="text-gray-700">
                                        {item.namaKlien}
                                      </strong>
                                    </span>
                                  )}
                                  {item.metode && (
                                    <span className="text-[9px] text-gray-400 italic">
                                      [{item.metode}]
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          }

                          return (
                            <div
                              key={item.id || idx}
                              onClick={() => handleSelectDetailSession(item)}
                              className="rounded-xl p-2.5 flex flex-col gap-1.5 shadow-xs hover:shadow-md transition-all bg-[#E8F3ED] border border-[#b4d6be] overflow-hidden cursor-pointer hover:scale-[1.01]"
                            >
                              <div className="flex items-center justify-between gap-1 flex-wrap">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <div className="w-2 h-2 rounded-full bg-[#185e26] shrink-0" />
                                  <span className="text-[11px] sm:text-xs font-bold text-[#185e26] whitespace-nowrap">
                                    {item.waktu}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white text-[#185e26] border border-[#b4d6be] shadow-2xs shrink-0">
                                    {item.metode}
                                  </span>
                                  {canCancelSession(wd.dateKey || item.date) ? (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        handleCancelClientBooking(item)
                                      }}
                                      title="Batalkan sesi klien ini (Maksimal H-1 Hari)"
                                      className="text-gray-400 hover:text-rose-600 p-0.5 rounded hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  ) : (
                                    <span
                                      title="Sesi tidak dapat dibatalkan pada hari H (Batas pembatalan maksimal H-1 hari)"
                                      className="text-gray-300 p-0.5 cursor-not-allowed shrink-0"
                                    >
                                      <X className="w-3.5 h-3.5 opacity-40" />
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className="text-xs font-bold text-gray-900 line-clamp-1">
                                {item.layanan}
                              </span>
                              <div className="flex items-center gap-1 text-[11px] text-gray-700 font-medium">
                                <User className="w-3 h-3 text-[#185e26] shrink-0" />
                                <span className="truncate">{item.namaKlien}</span>
                              </div>
                            </div>
                          )
                        }

                        // 3. Slot Terbuka (Tersedia untuk Klien)
                        const isPastOpenSlot =
                          isSessionPastOrCompleted(wd.dateKey || item.date, item.waktu) ||
                          isSlotPassed(wd.dateKey || item.date, item.waktu)

                        if (isPastOpenSlot) {
                          return (
                            <div
                              key={item.id || idx}
                              className="rounded-xl p-2.5 flex flex-col gap-1.5 shadow-xs transition-all bg-gray-100/85 border border-gray-200/90 text-gray-500 overflow-hidden w-full min-w-0"
                            >
                              {/* Baris 1: Jam & Bulatan Abu-abu */}
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="w-2 h-2 rounded-full shrink-0 bg-gray-400" />
                                <span className="text-[11px] sm:text-xs font-bold text-gray-500 line-through whitespace-nowrap">
                                  {item.waktu}
                                </span>
                              </div>

                              {/* Baris 2: Badge Lewat (kiri) & Tombol Hapus (kanan) */}
                              <div className="flex items-center justify-between gap-1 w-full min-w-0">
                                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">
                                  Lewat
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemoveSlot(item.waktu, wd.dateKey)
                                  }}
                                  title="Tutup / Hapus slot riwayat ini"
                                  className="text-gray-400 hover:text-rose-600 p-0.5 rounded hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Baris 3: Judul Slot */}
                              <p className="text-xs font-semibold leading-tight text-gray-700 line-clamp-2">
                                Slot Tersedia (Tidak Terpakai)
                              </p>

                              {/* Baris 4: Metode & Keterangan */}
                              <div className="flex items-center justify-between gap-1 min-w-0 text-[10px] text-gray-500">
                                {item.metode && (
                                  <span className="font-medium text-gray-600 bg-gray-200/80 px-1.5 py-0.5 rounded text-[9px] shrink-0">
                                    {item.metode}
                                  </span>
                                )}
                                <span className="italic truncate text-[9px] text-gray-400 min-w-0">
                                  Tidak terpakai
                                </span>
                              </div>
                            </div>
                          )
                        }

                        return (
                          <div
                            key={item.id || idx}
                            className="rounded-xl p-2.5 flex flex-col gap-1.5 shadow-2xs hover:shadow-sm transition-all bg-[#FAF5FD] border border-[#D8C3E8] overflow-hidden w-full min-w-0"
                          >
                            {/* Baris 1: Jam & Bulatan Ungu */}
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="w-2 h-2 rounded-full shrink-0 bg-[#561269]" />
                              <span className="text-[11px] sm:text-xs font-bold text-[#561269] whitespace-nowrap">
                                {item.waktu}
                              </span>
                            </div>

                            {/* Baris 2: Badge Tersedia (kiri) & Tombol Hapus (kanan) */}
                            <div className="flex items-center justify-between gap-1 w-full min-w-0">
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-purple-100 text-[#561269]">
                                Tersedia
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemoveSlot(item.waktu, wd.dateKey)
                                }}
                                title="Tutup / Hapus slot jam ini"
                                className="text-gray-400 hover:text-rose-600 p-0.5 rounded hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Baris 3: Judul Slot */}
                            <p className="text-xs font-bold leading-tight mt-0.5 text-purple-950 line-clamp-1">
                              Slot Tersedia
                            </p>

                            {/* Baris 4: Metode & Keterangan Tersedia */}
                            <div className="flex items-center justify-between gap-1 min-w-0 text-[10px]">
                              {item.metode && (
                                <span className="text-[9px] font-medium text-purple-700 bg-purple-100/70 px-1.5 py-0.5 rounded shrink-0">
                                  {item.metode}
                                </span>
                              )}
                              <span className="italic text-purple-600/80 font-medium truncate text-[9px] min-w-0">
                                Tersedia
                              </span>
                            </div>
                          </div>
                        )
                      })
                    ) : (() => {
                      const isPastDay = wd.dateKey < formatDateKey(today)
                      return (
                        <div
                          onClick={() => {
                            if (isPastDay) return
                            const targetDate = new Date(currentWeekMonday)
                            targetDate.setDate(currentWeekMonday.getDate() + i)
                            handleSelectDate(targetDate)
                          }}
                          className={`flex-1 min-h-[140px] flex flex-col items-center justify-center p-3 text-center rounded-xl border border-dashed border-gray-200 bg-gray-50/40 transition-all ${
                            isPastDay
                              ? "cursor-default opacity-60"
                              : "cursor-pointer hover:bg-purple-50/30 hover:border-purple-200 group"
                          }`}
                        >
                          <CalendarIcon className={`w-5 h-5 text-gray-300 mb-1 transition-colors ${
                            isPastDay ? "" : "group-hover:text-purple-400"
                          }`} />
                          <span className={`text-[11px] font-medium text-gray-400 transition-colors ${
                            isPastDay ? "" : "group-hover:text-purple-700"
                          }`}>
                            Tidak ada jadwal
                          </span>
                          <span className={`text-[10px] text-gray-300 mt-0.5 transition-colors ${
                            isPastDay ? "" : "group-hover:text-purple-500"
                          }`}>
                            {isPastDay ? "Hari telah lewat" : "Klik untuk buka slot"}
                          </span>
                        </div>
                      )
                    })()}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-6 mt-6 px-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#185e26]" />
            <span className="text-xs font-medium text-gray-700">Sudah Dibooking Klien</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-xs font-medium text-amber-800">Sesi Reschedule</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#561269]" />
            <span className="text-xs font-medium text-gray-700">Slot Tersedia Dibuka</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
            <span className="text-xs font-medium text-gray-500">Sesi Selesai / Lewat (Riwayat Masa Lalu)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded border border-dashed border-gray-400 bg-gray-50" />
            <span className="text-xs font-medium text-gray-500">Hari Kosong</span>
          </div>
        </div>
      </div>

      {/* ── Modal Detail Sesi Klien (Pop-up Portal Psikolog) ── */}
      <ModalDetailSesiKlien
        session={selectedDetailSession}
        onClose={() => setSelectedDetailSession(null)}
        onCancelClick={(session) => {
          handleCancelClientBooking(session)
          setSelectedDetailSession(null)
        }}
        onRescheduleClick={(session) => {
          setSelectedDetailSession(null)
          setSessionToReschedule(session)
        }}
        onMarkCompleted={(id, namaKlien) => {
          handleMarkCompleted(id, namaKlien)
          setSelectedDetailSession(null)
        }}
        onCopyWhatsApp={handleCopyWhatsAppMessage}
        isPsikologPortal={true}
      />

      {/* ── Modal Reschedule Sesi ── */}
      <ModalRescheduleSesi
        session={sessionToReschedule}
        onClose={() => setSessionToReschedule(null)}
        onConfirmReschedule={handleConfirmReschedule}
      />

      {/* ── Toast Notifikasi Aksi ── */}
      {actionToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-gray-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-gray-700 animate-in slide-in-from-bottom-5">
          {actionToast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{actionToast.message}</span>
        </div>
      )}
    </div>
  )
}
