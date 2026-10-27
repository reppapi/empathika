"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import ModalTambahSesi, { NewSessionData } from "@/features/dashboard/components/admin/ModalTambahSesi"
import { BookedAssessment, ClientSessionToday, ClientSessionStatus } from "@/features/konseling/types"
import {
  TIME_SLOTS,
  RAW_CLIENT_SESSIONS,
  WEEK_VARIATIONS,
  parseTimeRangeMinutes,
  getInitialSessionsBasedOnTime,
  getMonday,
  formatDateKey,
  formatWhatsAppMessage,
  formatWhatsAppPsikologReminder,
  generateWeekSessions,
  getSampleUpcomingBookings,
} from "@/features/konseling/data/jadwalAdminData"

// Sub-components
import JadwalSummaryCards from "./JadwalSummaryCards"
import JadwalHariIniSection from "./JadwalHariIniSection"
import JadwalAsesmenPicker from "./JadwalAsesmenPicker"
import JadwalMingguanGrid from "./JadwalMingguanGrid"
import ModalDetailSesiKlien from "./ModalDetailSesiKlien"
import ModalBatalSesi from "./ModalBatalSesi"
import { adminService } from "@/services/admin.service"
import { psikologService } from "@/services/psikolog.service"
import {
  recordCancelledSession,
  getCancelledSessions,
  isSessionCancelled,
  canCancelSession,
} from "@/features/konseling/utils/cancellationSync"

import {
  Calendar as CalendarIcon,
  ChevronDown,
  Plus,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"

// Backward-compatible exports for external consumers (e.g. dashboardData, AdminDashboardClient)
export type { BookedAssessment, ClientSessionToday } from "@/features/konseling/types"
export { RAW_CLIENT_SESSIONS, getInitialSessionsBasedOnTime } from "@/features/konseling/data/jadwalAdminData"

export default function JadwalAdmin() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const layananParam = searchParams ? (searchParams.get("layanan") || searchParams.get("filter")) : null
  const statusParam = searchParams ? searchParams.get("status") : null
  const dateParam = searchParams ? searchParams.get("date") : null

  const getInitialDate = () => {
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      const parsed = new Date(dateParam + "T00:00:00")
      if (!isNaN(parsed.getTime())) return parsed
    }
    return new Date()
  }

  // ── 1. State & Refs ──
  const [date, setDate] = useState<Date | undefined>(getInitialDate)
  const [selectedTime, setSelectedTime] = useState<string>("13:00 - 14:00")
  const [currentWeekMonday, setCurrentWeekMonday] = useState<Date>(() => getMonday(getInitialDate()))
  const [bookedSessions, setBookedSessions] = useState<BookedAssessment[]>([])
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null)

  // State Sesi Klien Hari Ini (Murni dari Database)
  const [todaySessions, setTodaySessions] = useState<ClientSessionToday[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [selectedDetailSession, setSelectedDetailSession] = useState<ClientSessionToday | null>(null)
  const [sessionToCancel, setSessionToCancel] = useState<ClientSessionToday | null>(null)
  const [actionToast, setActionToast] = useState<{ message: string; type: "success" | "danger" } | null>(null)

  // State Modal Tambah Sesi
  const [isModalOpen, setIsModalOpen] = useState(false)

  // State Filter Layanan, Status, & Tanggal
  const [selectedLayanan, setSelectedLayanan] = useState<string>(layananParam || "Semua Layanan")
  const [selectedStatus, setSelectedStatus] = useState<string>(statusParam || "semua")
  const [isLayananDropdownOpen, setIsLayananDropdownOpen] = useState(false)
  const dateInputRef = useRef<HTMLInputElement>(null)

  // Sinkronkan state saat URL query param berubah (Back / Forward browser)
  useEffect(() => {
    const lp = searchParams ? (searchParams.get("layanan") || searchParams.get("filter")) : null
    if (lp !== null && lp !== undefined) {
      setSelectedLayanan(lp || "Semua Layanan")
    }
    const sp = searchParams ? searchParams.get("status") : null
    if (sp !== null && sp !== undefined) {
      setSelectedStatus(sp || "semua")
    }
    const dp = searchParams ? searchParams.get("date") : null
    if (dp && /^\d{4}-\d{2}-\d{2}$/.test(dp)) {
      const parsed = new Date(dp + "T00:00:00")
      if (!isNaN(parsed.getTime())) {
        setDate(parsed)
        setCurrentWeekMonday(getMonday(parsed))
      }
    }
  }, [searchParams])

  // Helper update URL query param tanpa reload halaman
  const updateUrlParams = (updates: Record<string, string | null | undefined>) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "")
    Object.entries(updates).forEach(([key, val]) => {
      if (!val || val === "semua" || val === "Semua Layanan") {
        params.delete(key)
      } else {
        params.set(key, val)
      }
    })
    const qs = params.toString()
    const targetUrl = qs ? `/admin/jadwal?${qs}` : "/admin/jadwal"
    router.replace(targetUrl as any, { scroll: false })
  }

  const handleLayananChange = (newLayanan: string) => {
    setSelectedLayanan(newLayanan)
    updateUrlParams({ layanan: newLayanan })
  }

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus)
    updateUrlParams({ status: newStatus })
  }

  // ── 2. Toast Trigger & Action Handlers ──
  const triggerToast = (message: string, type: "success" | "danger" = "success") => {
    setActionToast({ message, type })
    setTimeout(() => setActionToast(null), 3500)
  }

  const handleCopyWhatsAppMessage = (session: ClientSessionToday) => {
    const text = formatWhatsAppMessage(session)
    navigator.clipboard.writeText(text)
    triggerToast(`Pesan jadwal untuk ${session.namaKlien} berhasil disalin ke clipboard!`, "success")
  }

  const handleCopyWhatsAppPsikologMessage = (session: ClientSessionToday) => {
    const text = formatWhatsAppPsikologReminder(session)
    navigator.clipboard.writeText(text)
    triggerToast(`Pesan pengingat jadwal untuk ${session.psikolog} berhasil disalin!`, "success")
  }

  const handleMarkCompleted = async (id: string, namaKlien: string) => {
    try {
      await adminService.updateBookingStatus(id, "COMPLETED")
    } catch (err: any) {
      console.warn("Update status error:", err?.response?.data?.message || err.message)
    }
    setTodaySessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "Selesai", isUpcomingNearest: false } : s))
    )
    triggerToast(`Sesi ${namaKlien} berhasil ditandai Selesai!`, "success")
    fetchJadwalData()
  }

  const handleCancelSession = async (id: string, namaKlien: string) => {
    // 1. Cari data sesi yang dibatalkan untuk keperluan sinkronisasi
    const targetToday = todaySessions.find((s) => s.id === id)
    const targetBooked = bookedSessions.find((s) => s.id === id)
    const targetCombined = currentWeekAllSessions.find((s) => s.id === id)

    const dateKey =
      (targetBooked && targetBooked.date) ||
      (targetCombined && targetCombined.date) ||
      targetToday?.date ||
      formatDateKey(date || new Date())

    // Validasi aturan bisnis: Pembatalan hanya bisa dilakukan sebelum hari H (maksimal H-1)
    if (!canCancelSession(dateKey)) {
      triggerToast(
        "Pembatalan tidak dapat dilakukan pada hari H konseling. Pembatalan hanya dapat dilakukan sebelum hari H.",
        "danger"
      )
      return
    }

    const waktu = targetToday?.waktu || targetBooked?.waktu || targetCombined?.waktu || ""
    const psikolog = targetToday?.psikolog || targetBooked?.psikolog || targetCombined?.psikolog || ""

    // 2. Simpan status CANCELLED di database backend
    try {
      await adminService.updateBookingStatus(id, "CANCELLED")
    } catch (err: any) {
      console.warn("Cancel status error:", err?.response?.data?.message || err.message)
    }

    // 3. Simpan dan sinkronkan pembatalan ke event sinkronisasi real-time
    recordCancelledSession({
      id,
      date: dateKey,
      waktu,
      namaKlien,
      psikolog,
    })

    // 4. Update state lokal todaySessions
    setTodaySessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "Dibatalkan", isUpcomingNearest: false } : s))
    )

    // 5. Update state bookedSessions
    setBookedSessions((prev) =>
      prev.map((b) =>
        b.id === id || (b.date === dateKey && b.waktu === waktu)
          ? { ...b, status: "Dibatalkan" }
          : b
      )
    )

    triggerToast(`Sesi ${namaKlien} (${waktu}) telah dibatalkan.`, "danger")
    fetchJadwalData()
  }

  const handleSelectWeeklySession = (session: BookedAssessment) => {
    const converted: ClientSessionToday = {
      id: session.id,
      date: session.date,
      waktu: session.waktu,
      namaKlien: session.namaKlien || "Klien Terdaftar",
      klienId: "010" + Math.floor(100 + Math.random() * 900),
      psikolog: session.psikolog || "Tenaga Ahli",
      layanan: session.layanan,
      tipe: session.metode === "Online" ? "Online [Zoom]" : "Offline [Klinik]",
      status: session.status === "Dibatalkan" ? "Dibatalkan" : "Menunggu Jadwal",
    }
    setSelectedDetailSession(converted)
  }


  // ── 3. Filter Layanan & Derived Values ──
  const layananOptions = useMemo(() => {
    const defaultList = [
      "Semua Layanan",
      "Konseling",
      "Konseling Individu",
      "Konseling Pasangan",
      "Konseling Remaja",
      "Konseling Karir",
      "Konseling Pribadi",
      "Hipnoterapi",
      "Home Visit",
      "Asesmen",
      "Asesmen Klinis",
    ]
    const set = new Set<string>(defaultList)
    todaySessions.forEach((s) => {
      if (s.layanan) set.add(s.layanan.trim())
    })
    bookedSessions.forEach((b) => {
      if (b.layanan) set.add(b.layanan.trim())
    })
    WEEK_VARIATIONS.forEach((v) => {
      v.forEach((item) => {
        if (item.layanan) set.add(item.layanan.trim())
      })
    })
    return Array.from(set)
  }, [todaySessions, bookedSessions])

  const matchLayanan = (itemLayanan: string, filter: string) => {
    if (!filter || filter === "Semua Layanan" || filter === "semua") return true
    const itemNorm = (itemLayanan || "").trim().toLowerCase()
    const filterNorm = (filter || "").trim().toLowerCase()
    if (itemNorm === filterNorm) return true
    if (
      (filterNorm.includes("konseling") || filterNorm.includes("konsultasi")) &&
      (itemNorm.includes("konseling") || itemNorm.includes("konsultasi"))
    ) {
      return true
    }
    if (filterNorm.includes("asesmen") && itemNorm.includes("asesmen")) return true
    if (filterNorm.includes("hipnoterapi") && itemNorm.includes("hipnoterapi")) return true
    return itemNorm.includes(filterNorm)
  }

  const filteredTodaySessions = useMemo(() => {
    return todaySessions.filter((s) => {
      const matchLay = matchLayanan(s.layanan, selectedLayanan)
      if (!matchLay) return false
      if (selectedStatus === "berlangsung") {
        return s.status === "Sedang Berlangsung"
      }
      if (selectedStatus === "selesai") {
        return s.status === "Selesai"
      }
      if (selectedStatus === "menunggu") {
        return s.status === "Menunggu Jadwal" || s.status === "Segera Dimulai"
      }
      return true
    })
  }, [todaySessions, selectedLayanan, selectedStatus])

  const stats = useMemo(() => {
    const byLayanan = todaySessions.filter((s) => matchLayanan(s.layanan, selectedLayanan))
    const total = byLayanan.length
    const sedangBerlangsung = byLayanan.filter((s) => s.status === "Sedang Berlangsung").length
    const selesai = byLayanan.filter((s) => s.status === "Selesai").length
    const menunggu = byLayanan.filter(
      (s) => s.status === "Menunggu Jadwal" || s.status === "Segera Dimulai"
    ).length
    return { total, sedangBerlangsung, selesai, menunggu }
  }, [todaySessions, selectedLayanan])

  // ── 4. Calendar & Date Configurations ──
  const today = useMemo(() => new Date(), [])
  const formattedSelectedDate = useMemo(() => {
    const d = date || today
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`
  }, [date, today])
  const formattedDate = formattedSelectedDate

  const datePickerValue = useMemo(() => {
    const d = date || today
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
  }, [date, today])

  // Helper menghitung status sesi secara dinamis berdasarkan jam lokal riil saat ini
  const applyTimeStatusToSessions = useCallback(
    (sessions: ClientSessionToday[], targetDateKey?: string): ClientSessionToday[] => {
      const now = new Date()
      const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
      const isTargetToday = !targetDateKey || targetDateKey === todayKey
      const currentMinutes = now.getHours() * 60 + now.getMinutes()

      let foundNearest = false

      return sessions.map((item) => {
        // Sesi yang dibatalkan atau sudah selesai tidak disentuh
        if (item.status === "Dibatalkan" || (item.status as string) === "Dibatalkan (Refund)") {
          return { ...item, isUpcomingNearest: false }
        }
        if (item.status === "Selesai") {
          return { ...item, isUpcomingNearest: false }
        }

        const sessionDateKey = item.date || item.tanggal || todayKey

        // Jika tanggal sesi di masa lampau (kemarin atau sebelumnya)
        if (sessionDateKey < todayKey) {
          return { ...item, status: "Selesai" as const, isUpcomingNearest: false }
        }

        // Jika tanggal sesi di masa depan (besok atau seterusnya)
        if (sessionDateKey > todayKey) {
          return { ...item, status: "Menunggu Jadwal" as const, isUpcomingNearest: false }
        }

        // Jika tanggal sesi HARI INI: cocokkan dengan jam sekarang
        const { startMinutes, endMinutes } = parseTimeRangeMinutes(item.waktu)

        // Kasus 1: Sesi sudah lewat
        if (currentMinutes >= endMinutes) {
          return { ...item, status: "Selesai" as const, isUpcomingNearest: false }
        }

        // Kasus 2: Sesi sedang berlangsung
        if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
          return {
            ...item,
            status: "Sedang Berlangsung" as const,
            isUpcomingNearest: false,
          }
        }

        // Kasus 3: Sesi di masa mendatang hari ini (currentMinutes < startMinutes)
        if (!foundNearest) {
          foundNearest = true
          return {
            ...item,
            status: "Segera Dimulai" as const,
            isUpcomingNearest: true,
          }
        }

        return {
          ...item,
          status: "Menunggu Jadwal" as const,
          isUpcomingNearest: false,
        }
      })
    },
    []
  )

  const nearestSession = useMemo(() => {
    // 1. Prioritas utama: sesi yang segera dimulai berikutnya hari ini
    const upcoming = filteredTodaySessions.find((s) => s.status === "Segera Dimulai" || s.isUpcomingNearest)
    if (upcoming) return upcoming

    // 2. Prioritas kedua: sesi yang sedang berlangsung saat ini
    const ongoing = filteredTodaySessions.find((s) => s.status === "Sedang Berlangsung")
    if (ongoing) return ongoing

    // 3. Prioritas ketiga: sesi menunggu jadwal yang jam mulainya belum lewat
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const waitingFuture = filteredTodaySessions.find((s) => {
      if (s.status !== "Menunggu Jadwal") return false
      const { startMinutes } = parseTimeRangeMinutes(s.waktu)
      return startMinutes > currentMinutes
    })
    if (waitingFuture) return waitingFuture

    return null
  }, [filteredTodaySessions])

  // ── 5. Dynamic Time Update (Sinkronisasi Jam Lokal Real-Time) ──
  useEffect(() => {
    setTodaySessions((prev) => applyTimeStatusToSessions(prev, datePickerValue))

    const interval = setInterval(() => {
      setTodaySessions((prev) => applyTimeStatusToSessions(prev, datePickerValue))
    }, 15000)

    return () => clearInterval(interval)
  }, [applyTimeStatusToSessions, datePickerValue])

  // Muat data jadwal & sesi riil langsung dari Database PostgreSQL
  const fetchJadwalData = useCallback(async () => {
    setIsLoading(true)
    try {
      const res: any = await adminService.getJadwal({ date: datePickerValue })
      if (res) {
        if (Array.isArray(res.todaySessions)) {
          const mappedToday: ClientSessionToday[] = res.todaySessions.map((s: any) => ({
            id: s.id,
            date: s.tanggal,
            waktu: s.waktuRange,
            namaKlien: s.namaKlien,
            klienId: s.idKlien,
            kontak: s.noTelepon,
            psikolog: s.psikolog,
            idPsikolog: s.idPsikolog,
            noTeleponPsikolog: s.noTeleponPsikolog,
            layanan: s.layanan,
            tipe: s.metode === "Online" ? "Online [Zoom]" : "Offline [Klinik]",
            catatan: s.deskripsiTrauma || undefined,
            status: s.status as ClientSessionStatus,
            tanggal: s.tanggal,
            canRefund: s.canRefund,
            isPastH1: s.isPastH1,
            isRefunded: s.isRefunded,
            isPaid: s.isPaid,
            refundDeadline: s.refundDeadline,
            nominalRefund: s.nominalRefund,
            idTransaksi: s.idTransaksi,
            kodeTransaksi: s.kodeTransaksi,
          }))
          setTodaySessions(applyTimeStatusToSessions(mappedToday, datePickerValue))
        } else {
          setTodaySessions([])
        }

        if (Array.isArray(res.weeklyGrid)) {
          const mappedWeekly: BookedAssessment[] = res.weeklyGrid.map((w: any) => ({
            id: w.id,
            date: w.date,
            waktu: w.timeSlot,
            layanan: w.layanan,
            metode: w.metode,
            namaKlien: w.clientName || (w.statusSlot === "TERSEDIA" ? "Tersedia" : undefined),
            psikolog: w.psikologName,
            status: w.statusSlot === "TERSEDIA" ? "Tersedia" : "Aktif",
            isAvailableSlot: w.statusSlot === "TERSEDIA",
            isBooked: w.isBooked ?? (w.statusSlot === "SUDAH_DIBOOKING" || (Boolean(w.clientName) && w.clientName !== "Tersedia")),
          }))
          setBookedSessions(mappedWeekly)
        } else {
          setBookedSessions([])
        }
      }
    } catch (err: any) {
      console.warn("Notice loading admin jadwal:", err?.message)
    } finally {
      setIsLoading(false)
    }
  }, [datePickerValue, applyTimeStatusToSessions])

  useEffect(() => {
    fetchJadwalData()
  }, [fetchJadwalData])

  const handleSelectDate = (newDate: Date | undefined) => {
    setDate(newDate)
    if (newDate) {
      setCurrentWeekMonday(getMonday(newDate))
      const y = newDate.getFullYear()
      const m = String(newDate.getMonth() + 1).padStart(2, "0")
      const day = String(newDate.getDate()).padStart(2, "0")
      updateUrlParams({ date: `${y}-${m}-${day}` })
    } else {
      updateUrlParams({ date: null })
    }
  }

  // ── 6. Weekly Grid & Navigation Logic ──
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

  const currentWeekAllSessions = useMemo(() => {
    const combined: BookedAssessment[] = []

    // 1. Sesi aktif hari ini / tanggal terpilih (data riil Database - hanya yang sudah dibooking)
    todaySessions.forEach((ts) => {
      if (!ts.namaKlien || ts.namaKlien.toLowerCase() === "tersedia") return

      const sessionDateKey = ts.date || (ts as any).tanggal || formatDateKey(today)
      combined.push({
        id: `today_sync_${ts.id}`,
        date: sessionDateKey,
        waktu: ts.waktu,
        layanan: ts.layanan,
        metode: ts.tipe.toLowerCase().includes("online") ? "Online" : "Offline",
        namaKlien: ts.namaKlien,
        psikolog: ts.psikolog,
        status: ts.status,
        isBooked: true,
      })
    })

    // 2. Seluruh slot dan sesi mingguan murni dari Database PostgreSQL
    // HANYA sesi yang SUDAH DIBOOKING (memiliki nama klien riil dan bukan slot kosong 'Tersedia')
    bookedSessions.forEach((bs) => {
      const isUnbooked =
        bs.isAvailableSlot ||
        bs.status === "Tersedia" ||
        !bs.namaKlien ||
        bs.namaKlien.toLowerCase() === "tersedia" ||
        bs.layanan === "Slot Tersedia"

      if (isUnbooked) return

      if (
        !combined.some(
          (c) =>
            c.id === bs.id ||
            (c.date === bs.date && c.waktu === bs.waktu && c.namaKlien === bs.namaKlien)
        )
      ) {
        combined.push(bs)
      }
    })

    const cancelledList = getCancelledSessions()
    return combined.map((s) => {
      if (s.status === "Dibatalkan" || isSessionCancelled(s, cancelledList)) {
        return { ...s, status: "Dibatalkan" }
      }
      return s
    })
  }, [bookedSessions, todaySessions, today])

  // Batas riwayat mundur maksimal 4 minggu ke belakang
  const thisWeekMonday = useMemo(() => getMonday(today), [today])
  const weeksDiff = useMemo(() => {
    return Math.round(
      (currentWeekMonday.getTime() - thisWeekMonday.getTime()) / (7 * 24 * 60 * 60 * 1000)
    )
  }, [currentWeekMonday, thisWeekMonday])

  const canGoPrevWeek = weeksDiff > -4

  const weekRangeTitle = useMemo(() => {
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
    if (!canGoPrevWeek) return
    const prev = new Date(currentWeekMonday)
    prev.setDate(currentWeekMonday.getDate() - 7)
    setCurrentWeekMonday(prev)
  }

  const goToNextWeek = () => {
    const next = new Date(currentWeekMonday)
    next.setDate(currentWeekMonday.getDate() + 7)
    setCurrentWeekMonday(next)
  }

  const handleBooking = async (times: string[], metode: "Online" | "Offline" | "Keduanya" = "Online") => {
    if (!date || times.length === 0) return
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const tanggalStr = `${y}-${m}-${day}`

    setIsLoading(true)
    let successCount = 0
    const failErrors: string[] = []

    for (const finalWaktu of times) {
      const parts = finalWaktu.split("-").map((p) => p.trim())
      const jamMulai = parts[0]?.substring(0, 5) || "09:00"
      const jamSelesai = parts[1]?.substring(0, 5) || "10:00"

      try {
        await adminService.createJadwalSlot({
          tanggal: tanggalStr,
          jam_mulai: jamMulai,
          jam_selesai: jamSelesai,
          tipe_jadwal: "ASESMEN",
          metode: metode.toUpperCase(),
        })
        successCount++
      } catch (err: any) {
        console.warn(`Gagal membuka slot ${finalWaktu}:`, err?.response?.data?.message || err.message)
        failErrors.push(err?.response?.data?.message || `${finalWaktu} gagal dibuka`)
      }
    }

    // Refresh data jadwal terbaru dari database PostgreSQL
    await fetchJadwalData()
    setIsLoading(false)

    if (successCount > 0) {
      triggerToast(
        successCount === 1
          ? `Slot jadwal asesmen ${metode} (${times[0]}) berhasil dibuka di database!`
          : `${successCount} slot jadwal asesmen ${metode} berhasil dibuka di database!`,
        "success"
      )
      setBookingSuccessMsg(
        successCount === 1
          ? `Slot jam ${times[0]} (${metode}) berhasil dibuka!`
          : `${successCount} slot jam (${metode}) berhasil dibuka sekaligus!`
      )
      setTimeout(() => setBookingSuccessMsg(null), 4500)
    }

    if (failErrors.length > 0 && successCount === 0) {
      triggerToast(`Gagal membuka slot: ${failErrors[0]}`, "danger")
    }
  }

  const handleModalSuccess = (newSession: NewSessionData) => {
    const newBooked: BookedAssessment = {
      id: "ab_" + Date.now(),
      date: newSession.tanggal,
      waktu: newSession.waktu.replace(" WIB", ""),
      layanan: newSession.layanan,
      metode: newSession.metode,
      namaKlien: newSession.namaKlien,
      psikolog: newSession.psikolog,
    }
    setBookedSessions((prev) => [newBooked, ...prev])

    // Jika jadwal baru bertanggal hari ini, tambahkan juga ke tabel pemantauan hari ini
    const todayKey = new Date().toISOString().split("T")[0]
    if (newSession.tanggal === todayKey || newSession.tanggal === formatDateKey(new Date())) {
      const newToday: ClientSessionToday = {
        id: "cs_" + Date.now(),
        waktu: newSession.waktu.replace(" WIB", ""),
        namaKlien: newSession.namaKlien,
        klienId: "010" + Math.floor(100 + Math.random() * 900),
        kontak: newSession.kontak,
        psikolog: newSession.psikolog,
        layanan: newSession.layanan,
        tipe: newSession.metode === "Online" ? "Online [Zoom]" : "Offline [Klinik]",
        catatan: newSession.catatan || undefined,
        status: "Menunggu Jadwal",
      }
      setTodaySessions((prev) => [newToday, ...prev])
    }

    setBookingSuccessMsg(`Sesi baru untuk ${newSession.namaKlien} (${newSession.waktu}) berhasil dijadwalkan!`)
    setTimeout(() => setBookingSuccessMsg(null), 4000)
    fetchJadwalData()
  }

  // ── 7. Render Layout ──
  return (
    <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-8 font-poppins pb-10">

      {/* Top Actions & Filters */}
      <div className="flex flex-col sm:flex-row justify-end items-end sm:items-center gap-3">
        {/* Dropdown Layanan */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsLayananDropdownOpen((prev) => !prev)}
            className={`flex items-center gap-2 border px-4 py-2.5 rounded-full text-sm font-medium transition-all shadow-2xs cursor-pointer ${selectedLayanan !== "Semua Layanan"
              ? "border-[#561269] bg-purple-50 text-[#561269] font-semibold"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
          >
            <span>{selectedLayanan}</span>
            <ChevronDown
              className={`w-4 h-4 ml-1 transition-transform duration-200 ${isLayananDropdownOpen ? "rotate-180 text-[#561269]" : "text-gray-500"
                }`}
            />
          </button>

          {isLayananDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsLayananDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-gray-100 py-2 z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 border-b border-gray-100 mb-1">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Filter Layanan
                  </p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {layananOptions.map((opt) => {
                    const isSelected = selectedLayanan === opt
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          handleLayananChange(opt)
                          setIsLayananDropdownOpen(false)
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${isSelected
                          ? "bg-purple-50 text-[#561269] font-bold"
                          : "text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        <span className="truncate">{opt}</span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#561269] ml-2 shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
                {selectedLayanan !== "Semua Layanan" && (
                  <div className="border-t border-gray-100 mt-1 pt-1 px-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleLayananChange("Semua Layanan")
                        setIsLayananDropdownOpen(false)
                      }}
                      className="w-full text-center py-1.5 text-xs text-[#561269] hover:bg-purple-50 rounded-lg font-medium transition-colors cursor-pointer"
                    >
                      Reset Filter
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Date Selector */}
        <div className="relative">
          <input
            ref={dateInputRef}
            type="date"
            className="sr-only"
            value={datePickerValue}
            onChange={(e) => {
              if (e.target.value) {
                handleSelectDate(new Date(e.target.value + "T00:00:00"))
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (dateInputRef.current) {
                try {
                  dateInputRef.current.showPicker()
                } catch {
                  dateInputRef.current.focus()
                }
              }
            }}
            className="flex items-center gap-2 border border-gray-300 bg-white px-4 py-2.5 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
          >
            {formattedSelectedDate}
            <CalendarIcon className="w-4 h-4 ml-1 text-gray-500" />
          </button>
        </div>

        {/* Button Sesi Baru */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 px-5 py-2.5 rounded-full text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-98 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Sesi Baru
        </button>
      </div>

      {/* Summary Cards */}
      <JadwalSummaryCards
        stats={stats}
        activeStatus={selectedStatus}
        onStatusChange={handleStatusChange}
      />

      {/* Sesi Klien Hari Ini (Highlight & Table) */}
      <JadwalHariIniSection
        filteredTodaySessions={filteredTodaySessions}
        todaySessionsCount={todaySessions.length}
        nearestSession={nearestSession}
        selectedLayanan={selectedLayanan}
        formattedDate={formattedDate}
        activeMenuId={activeMenuId}
        setActiveMenuId={setActiveMenuId}
        onSelectDetail={(session) => setSelectedDetailSession(session)}
        onSelectCancel={(session) => setSessionToCancel(session)}
        onMarkCompleted={handleMarkCompleted}
        onCopyWhatsApp={handleCopyWhatsAppMessage}
        onCopyWhatsAppPsikolog={handleCopyWhatsAppPsikologMessage}
        onResetFilter={() => {
          handleLayananChange("Semua Layanan")
          handleStatusChange("semua")
        }}
      />

      {/* Jadwal Asesmen (Calendar & Time Slot Picker) */}
      <JadwalAsesmenPicker
        date={date}
        onSelectDate={handleSelectDate}
        bookedSessions={bookedSessions}
        bookingSuccessMsg={bookingSuccessMsg}
        onBooking={handleBooking}
        timeSlots={TIME_SLOTS}
      />

      {/* Jadwal Mingguan (Weekly Assessment Schedule Grid) */}
      <JadwalMingguanGrid
        canGoPrevWeek={canGoPrevWeek}
        goToPrevWeek={goToPrevWeek}
        goToNextWeek={goToNextWeek}
        weekRangeTitle={weekRangeTitle}
        weekDays={weekDays}
        currentWeekAllSessions={currentWeekAllSessions}
        selectedLayanan={selectedLayanan}
        matchLayanan={matchLayanan}
        today={today}
        onSelectSession={handleSelectWeeklySession}
      />

      {/* ── Modal Tambah Sesi ── */}
      <ModalTambahSesi
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      {/* ── Modal Detail Sesi Klien ── */}
      <ModalDetailSesiKlien
        session={selectedDetailSession}
        onClose={() => setSelectedDetailSession(null)}
        onCancelClick={(session) => {
          setSelectedDetailSession(null)
          setSessionToCancel(session)
        }}
        onMarkCompleted={(id, namaKlien) => {
          handleMarkCompleted(id, namaKlien)
          setSelectedDetailSession(null)
        }}
        onCopyWhatsApp={handleCopyWhatsAppMessage}
        onCopyWhatsAppPsikolog={handleCopyWhatsAppPsikologMessage}
      />

      {/* ── Modal Konfirmasi Pembatalan ── */}
      <ModalBatalSesi
        session={sessionToCancel}
        onClose={() => setSessionToCancel(null)}
        onConfirmCancel={handleCancelSession}
      />


      {/* ── Toast Notifikasi Aksi ── */}
      {actionToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-gray-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-gray-700 animate-in slide-in-from-bottom-5">
          {actionToast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>{actionToast.message}</span>
        </div>
      )}
    </div>
  )
}
