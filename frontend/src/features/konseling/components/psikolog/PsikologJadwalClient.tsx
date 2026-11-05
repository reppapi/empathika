"use client"

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { PilihTanggalBox } from "@/components/shared/PilihTanggalBox"
import { psikologService, JadwalSlotItem } from "@/services/psikolog.service"
import { adminService } from "@/services/admin.service"
import { INITIAL_TENAGA_AHLI } from "@/features/psikolog/data/initialData"
import { useAuthStore } from "@/store/authStore"
import {
  getCancelledSessions,
  isSessionCancelled,
} from "@/features/konseling/utils/cancellationSync"
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
} from "lucide-react"

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
  id_psikolog?: string
  namaPsikolog?: string
  isAvailableSlot?: boolean
  status?: string
  isCancelled?: boolean
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

export default function PsikologJadwalClient() {
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const { user } = useAuthStore()

  const resolveActivePsikolog = useCallback(() => {
    if (typeof window === "undefined") {
      return { id: "0", nama_gelar: INITIAL_TENAGA_AHLI[0].nama, kategori: "psikolog" }
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
    return { id: "0", nama_gelar: INITIAL_TENAGA_AHLI[0].nama, kategori: savedKat || "psikolog" }
  }, [user])

  // State profil psikolog aktif yang diambil dari Database / LocalStorage
  const [activePsikolog, setActivePsikolog] = useState<{ id: string; nama_gelar: string; kategori?: string; account?: any } | null>(resolveActivePsikolog)

  const [selectedMetode, setSelectedMetode] = useState<MetodeKonsultasi>("Online")
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
          sessionMap.set(mapKey, {
            id: s.id,
            date: s.date,
            waktu: s.waktu,
            layanan: s.booking?.layanan || "Konsultasi Psikologi",
            metode: (s.booking?.metode
              ? (s.booking.metode === "OFFLINE" ? "Offline" : "Online")
              : (s.metode === "OFFLINE" ? "Offline" : s.metode === "KEDUANYA" ? "Keduanya" : "Online")) as MetodeKonsultasi,
            namaKlien: s.booking?.nama_klien || "Tersedia",
            id_psikolog: res.psikolog?.id || resolvedPsikologId,
            namaPsikolog: res.psikolog?.nama_gelar || resolvedPsikologName,
            isAvailableSlot: s.status === "TERSEDIA",
          })
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

              const isMatch =
                (resolvedPsikologId && t.idPsikolog && t.idPsikolog === resolvedPsikologId) ||
                (Boolean(resolvedPsikologName) &&
                  Boolean(t.psikolog) &&
                  t.psikolog !== "Belum Ditentukan" &&
                  (t.psikolog.toLowerCase().includes(resolvedPsikologName.toLowerCase()) ||
                    resolvedPsikologName.toLowerCase().includes(t.psikolog.toLowerCase())))

              if (isMatch && t.tanggal && t.waktuRange) {
                const mapKey = `${t.tanggal}_${t.waktuRange}`
                if (!sessionMap.has(mapKey)) {
                  sessionMap.set(mapKey, {
                    id: t.id,
                    date: t.tanggal,
                    waktu: t.waktuRange,
                    layanan: t.layanan || "Konsultasi Psikologi",
                    metode: t.tipe?.includes("Offline") ? "Offline" : "Online",
                    namaKlien: t.namaKlien || "Klien Terdaftar",
                    id_psikolog: t.idPsikolog || resolvedPsikologId,
                    namaPsikolog: t.psikolog || resolvedPsikologName,
                    isAvailableSlot: false,
                    status: t.status,
                  })
                }
              }
            })
          }

          // B. Sesi Grid Mingguan (Hanya sesi konsultasi milik psikolog ini, bukan asesmen kantor)
          if (Array.isArray(adminRes.weeklyGrid)) {
            adminRes.weeklyGrid.forEach((w: any) => {
              if ((w.tipe_jadwal || "").toUpperCase() === "ASESMEN" || (w.layanan || "").toLowerCase().includes("asesmen")) return

              const isMatch =
                Boolean(resolvedPsikologName) &&
                Boolean(w.psikologName) &&
                w.psikologName.trim() !== "" &&
                (w.psikologName.toLowerCase().includes(resolvedPsikologName.toLowerCase()) ||
                  resolvedPsikologName.toLowerCase().includes(w.psikologName.toLowerCase()))

              if (isMatch && w.date && w.timeSlot) {
                const mapKey = `${w.date}_${w.timeSlot}`
                if (!sessionMap.has(mapKey)) {
                  const isAvailable = w.statusSlot === "TERSEDIA" && (!w.clientName || w.clientName === "Tersedia")
                  sessionMap.set(mapKey, {
                    id: w.id,
                    date: w.date,
                    waktu: w.timeSlot,
                    layanan: w.layanan || "Konsultasi Psikologi",
                    metode: w.metode === "Offline" ? "Offline" : w.metode === "Keduanya" ? "Keduanya" : "Online",
                    namaKlien: isAvailable ? "Tersedia" : (w.clientName || w.namaKlien || "Klien Terdaftar"),
                    id_psikolog: resolvedPsikologId,
                    namaPsikolog: w.psikologName || resolvedPsikologName,
                    isAvailableSlot: isAvailable,
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

              const isMatch =
                (resolvedPsikologId && s.id_psikolog && s.id_psikolog === resolvedPsikologId) ||
                (Boolean(resolvedPsikologName) &&
                  Boolean(s.nama_psikolog) &&
                  s.nama_psikolog.trim() !== "" &&
                  (s.nama_psikolog.toLowerCase().includes(resolvedPsikologName.toLowerCase()) ||
                    resolvedPsikologName.toLowerCase().includes(s.nama_psikolog.toLowerCase())))

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
                    namaKlien: isTersedia ? "Tersedia" : (s.namaKlien || "Klien Terdaftar"),
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

      // 4. Terapkan status pembatalan admin
      try {
        const cancelledList = getCancelledSessions()
        if (cancelledList.length > 0) {
          sessionMap.forEach((item, key) => {
            if (isSessionCancelled(item, cancelledList)) {
              sessionMap.set(key, { ...item, isCancelled: true, status: "Dibatalkan" })
            }
          })
        }
      } catch {}

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
            return { ...s, isCancelled: true, status: "Dibatalkan" }
          }
          return s
        })
      )
    }

    handleSyncCancelled()
    window.addEventListener("storage", handleSyncCancelled)
    window.addEventListener("storage", loadScheduleForPsikolog)
    window.addEventListener("empathika_session_cancelled", handleSyncCancelled as EventListener)

    return () => {
      window.removeEventListener("storage", handleSyncCancelled)
      window.removeEventListener("storage", loadScheduleForPsikolog)
      window.removeEventListener("empathika_session_cancelled", handleSyncCancelled as EventListener)
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

  // 6 hari kerja dalam seminggu (Senin - Sabtu)
  const weekDays = useMemo(() => {
    const dayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
    const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agus", "Sep", "Okt", "Nov", "Des"]

    return Array.from({ length: 6 }).map((_, i) => {
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

  // Judul range minggu: "3 - 8 Agustus 2026"
  const weekRangeLabel = useMemo(() => {
    const start = new Date(currentWeekMonday)
    const end = new Date(currentWeekMonday)
    end.setDate(currentWeekMonday.getDate() + 5)

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

  const goToPrevWeek = () => {
    const prev = new Date(currentWeekMonday)
    prev.setDate(currentWeekMonday.getDate() - 7)
    setCurrentWeekMonday(prev)
    setSelectedTimes([])
    setIsCustomTime(false)
    setBookingSuccessMsg(null)
  }

  const goToNextWeek = () => {
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
    const psikologNama = activePsikolog?.nama_gelar || activePsikolog?.account?.nama || currentPsi.nama_gelar || (currentPsi as any)?.account?.nama || savedName || user?.name || "Tenaga Ahli"

    const newSessions: BookedSession[] = []
    const newSlotItems: JadwalSlotItem[] = []

    for (const finalWaktu of timesToOpen) {
      const [start, end] = finalWaktu.split(" - ")
      const jamMulai = start?.trim() || "09:00"
      const jamSelesai = end?.trim() || "10:00"

      let savedSlotId = "slot-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6)

      // 1. Simpan ke Backend Database PostgreSQL
      try {
        const res: any = await psikologService.createJadwalSlot({
          id_psikolog: psikologId,
          tanggal: dateKey,
          jam_mulai: jamMulai,
          jam_selesai: jamSelesai,
          tipe_jadwal: "KONSULTASI",
          metode: selectedMetode,
        })
        if (res && res.id) {
          savedSlotId = res.id
        }
      } catch (err: any) {
        console.warn("Notice save slot:", err?.response?.data?.message || err.message)
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
        status: "TERSEDIA",
        tipe_jadwal: "KONSULTASI",
      })

      newSessions.push({
        id: savedSlotId,
        date: dateKey,
        waktu: finalWaktu,
        layanan: "Konseling Individu",
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
      {/* Card 1: Jadwal Sesi */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Jadwal Praktik</h2>
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

              {/* Pilihan Metode Konsultasi (Compact & Modern dengan Icons) */}
              <div className="mb-4 bg-purple-50/50 p-3.5 rounded-2xl border border-[#EDE0F2]">
                <div className="flex items-center justify-between mb-2.5">
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
                    onClick={() => setSelectedMetode("Online")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${selectedMetode === "Online"
                      ? "border-[#561269] bg-white text-[#561269] shadow-xs ring-1 ring-[#561269]"
                      : "border-gray-200 bg-white/70 text-gray-600 hover:bg-white"
                      }`}
                  >
                    <Video className="w-3.5 h-3.5 text-[#561269]" />
                    <span>Online</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMetode("Offline")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${selectedMetode === "Offline"
                      ? "border-[#561269] bg-white text-[#561269] shadow-xs ring-1 ring-[#561269]"
                      : "border-gray-200 bg-white/70 text-gray-600 hover:bg-white"
                      }`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-[#561269]" />
                    <span>Offline</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMetode("Keduanya")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${selectedMetode === "Keduanya"
                      ? "border-[#561269] bg-white text-[#561269] shadow-xs ring-1 ring-[#561269]"
                      : "border-gray-200 bg-white/70 text-gray-600 hover:bg-white"
                      }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-[#561269]" />
                    <span>Keduanya</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-500 mb-3">
                Pilih slot jam yang ingin dibuka untuk metode <span className="font-bold text-[#561269]">{selectedMetode}</span>:
              </p>

              {/* Checkbox List Slot Waktu */}
              <div className="flex flex-col gap-2.5 mb-3 max-h-[125px] overflow-y-auto pr-1.5 custom-scrollbar">
                {timeSlots.map((time, idx) => {
                  const isChecked = selectedTimes.includes(time)
                  const openedSession = date
                    ? bookedSessions.find(
                      (s) => s.date === formatDateKey(date) && s.waktu === time && s.isAvailableSlot
                    )
                    : undefined
                  const isAlreadyOpened = Boolean(openedSession)
                  const openedMetode = openedSession?.metode || "Online"

                  const cancelledSession = date
                    ? bookedSessions.find(
                      (s) =>
                        s.date === formatDateKey(date) &&
                        s.waktu === time &&
                        (s.isCancelled || s.status === "Dibatalkan")
                    )
                    : undefined
                  const isAlreadyCancelled = Boolean(cancelledSession)

                  const bookedSession = date
                    ? bookedSessions.find(
                      (s) =>
                        s.date === formatDateKey(date) &&
                        s.waktu === time &&
                        !s.isAvailableSlot &&
                        s.namaKlien !== "Tersedia" &&
                        !s.isCancelled &&
                        s.status !== "Dibatalkan"
                    )
                    : undefined
                  const isAlreadyBooked = Boolean(bookedSession)
                  const isCustom = !DEFAULT_TIME_SLOTS.includes(time)

                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between border rounded-xl px-4 py-2.5 transition-all ${isChecked
                        ? "border-[#561269] bg-purple-50/70 shadow-2xs"
                        : isAlreadyCancelled
                          ? "border-rose-200 bg-rose-50/40"
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
                            : isAlreadyCancelled
                              ? "text-gray-600 line-through"
                              : "text-gray-700"
                            }`}
                        >
                          {time}
                        </span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        {isAlreadyCancelled && !isChecked && (
                          <span className="text-[10px] font-semibold text-rose-700 bg-rose-100/90 border border-rose-200 px-2 py-0.5 rounded-full">
                            Dibatalkan Admin
                          </span>
                        )}
                        {isAlreadyOpened && !isChecked && !isAlreadyCancelled && (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-semibold text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-full">
                              Dibuka ({openedMetode})
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
                        {isAlreadyBooked && !isChecked && !isAlreadyCancelled && (
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
                      ? `Buka ${selectedTimes.length} Jam Sesi Sekaligus (${selectedMetode})`
                      : isCustomValid
                        ? `Buka Jam Kustom: ${customStart} - ${customEnd} (${selectedMetode})`
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
            aria-label="Minggu Sebelumnya"
            title="Minggu Sebelumnya"
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors border border-gray-200 text-gray-600 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-gray-900 min-w-[160px] text-center">
            {weekRangeLabel}
          </span>
          <button
            type="button"
            onClick={goToNextWeek}
            aria-label="Minggu Berikutnya"
            title="Minggu Berikutnya"
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors border border-gray-200 text-gray-600 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Weekly Grid */}
        <div className="overflow-x-auto border border-gray-200 rounded-xl hide-scrollbar">
          <div className="min-w-[720px]">
            {/* Header */}
            <div className="grid grid-cols-6 border-b border-gray-200 bg-gray-50/70">
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
            <div className="grid grid-cols-6 min-h-[360px] divide-x divide-gray-200">
              {weekDays.map((wd, i) => {
                const sessions = bookedSessions
                  .filter((s) => s.date === wd.dateKey)
                  .sort((a, b) => a.waktu.localeCompare(b.waktu))

                const isTodayColumn = wd.dateKey === formatDateKey(today)

                return (
                  <div
                    key={i}
                    className={`p-2.5 flex flex-col gap-2.5 ${isTodayColumn
                      ? "bg-purple-50/25 ring-1 ring-inset ring-[#561269]/20"
                      : wd.isSameAsSelected
                        ? "bg-purple-50/10"
                        : "bg-white"
                      }`}
                  >
                    {sessions.length > 0 ? (
                      sessions.map((item, idx) => {
                        const isCancelled = item.isCancelled || item.status === "Dibatalkan"
                        const isClientBooking = !item.isAvailableSlot && item.namaKlien && item.namaKlien !== "Tersedia"

                        // 1. Dibatalkan
                        if (isCancelled) {
                          return (
                            <div
                              key={item.id || idx}
                              className="rounded-xl p-3 flex flex-col gap-1 shadow-xs transition-all bg-rose-50/80 border border-rose-200/90 text-gray-600"
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                                  <span className="text-xs font-bold line-through text-rose-700">
                                    {item.waktu}
                                  </span>
                                </div>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                                  Dibatalkan
                                </span>
                              </div>
                              <span className="text-xs font-semibold text-gray-800 line-clamp-1">
                                {item.layanan}
                              </span>
                              <div className="flex items-center justify-between text-[11px] text-gray-500">
                                <span className="truncate">{item.namaKlien || "Klien"}</span>
                                <span className="font-semibold text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded text-[10px]">
                                  {item.metode}
                                </span>
                              </div>
                            </div>
                          )
                        }

                        // 2. Sesi Klien (Sudah Dibooking)
                        if (isClientBooking) {
                          const isCompleted = isSessionPastOrCompleted(wd.dateKey || item.date, item.waktu, item.status)

                          if (isCompleted) {
                            return (
                              <div
                                key={item.id || idx}
                                className="rounded-xl p-3 flex flex-col gap-1 shadow-xs transition-all bg-gray-100/85 border border-gray-200/90 text-gray-500"
                              >
                                <div className="flex items-center justify-between gap-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full shrink-0 bg-gray-400" />
                                    <span className="text-xs font-extrabold text-gray-600">
                                      {item.waktu}
                                    </span>
                                  </div>
                                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">
                                    Selesai
                                  </span>
                                </div>
                                <p className="text-xs font-bold leading-tight mt-0.5 text-gray-700">
                                  {item.layanan}
                                </p>
                                <div className="text-[10px] flex flex-col mt-0.5 leading-tight text-gray-500">
                                  {item.namaKlien && (
                                    <span>
                                      Klien:{" "}
                                      <strong className="text-gray-700">
                                        {item.namaKlien}
                                      </strong>
                                    </span>
                                  )}
                                  {item.metode && (
                                    <span className="text-[9px] text-gray-400 italic mt-0.5">
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
                              className="rounded-xl p-3 flex flex-col gap-1.5 shadow-xs hover:shadow-md transition-all bg-[#E8F3ED] border border-[#b4d6be]"
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-2 h-2 rounded-full bg-[#185e26] shrink-0" />
                                  <span className="text-xs font-bold text-[#185e26]">
                                    {item.waktu}
                                  </span>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#185e26] border border-[#b4d6be] shadow-2xs">
                                  {item.metode}
                                </span>
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
                              className="rounded-xl p-3 flex flex-col gap-1.5 shadow-xs transition-all bg-gray-100/85 border border-gray-200/90 text-gray-500"
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full shrink-0 bg-gray-400" />
                                  <span className="text-xs font-bold text-gray-500 line-through">
                                    {item.waktu}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
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
                                    className="text-gray-400 hover:text-rose-600 p-0.5 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              <p className="text-xs font-semibold leading-tight text-gray-700">
                                Slot Tersedia (Tidak Terpakai)
                              </p>
                              <div className="flex items-center justify-between text-[10px] text-gray-400">
                                <span className="font-medium text-gray-600 bg-gray-200/80 px-2 py-0.5 rounded-full">
                                  {item.metode}
                                </span>
                                <span className="italic">
                                  Tidak ada booking
                                </span>
                              </div>
                            </div>
                          )
                        }

                        return (
                          <div
                            key={item.id || idx}
                            className="rounded-xl p-3 flex flex-col gap-1.5 shadow-2xs hover:shadow-sm transition-all bg-[#FAF5FD] border border-[#D8C3E8]"
                          >
                            <div className="flex items-center justify-between gap-1.5">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-[#561269] shrink-0" />
                                <span className="text-xs font-bold text-[#561269]">
                                  {item.waktu}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemoveSlot(item.waktu, wd.dateKey)
                                }}
                                title="Tutup / Hapus slot jam ini"
                                className="text-gray-400 hover:text-rose-600 p-0.5 rounded hover:bg-rose-50 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="text-xs font-semibold text-purple-950">
                              Slot Tersedia
                            </span>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-medium text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-full">
                                {item.metode}
                              </span>
                              <span className="text-[10px] text-gray-400 italic">
                                Belum ada klien
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
            <div className="w-2.5 h-2.5 rounded-full bg-[#561269]" />
            <span className="text-xs font-medium text-gray-700">Slot Tersedia Dibuka</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
            <span className="text-xs font-medium text-gray-500">Sesi Selesai / Lewat (Riwayat Masa Lalu)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-xs font-medium text-rose-700">Sesi Dibatalkan</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded border border-dashed border-gray-400 bg-gray-50" />
            <span className="text-xs font-medium text-gray-500">Hari Kosong</span>
          </div>
        </div>
      </div>
    </div>
  )
}
