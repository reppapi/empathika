"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Calendar } from "@/components/ui/calendar"
import ModalTambahSesi, { NewSessionData } from "@/features/dashboard/components/admin/ModalTambahSesi"
import { AdminStatusBadge } from "@/components/shared/AdminStatusBadge"
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Plus,
  Clock,
  Users,
  CheckCircle2,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Circle,
  MoreVertical,
  Eye,
  XCircle,
  X,
  FileText,
  AlertTriangle,
  Phone,
  MessageCircle,
  ExternalLink,
  Copy,
} from "lucide-react"

interface BookedAssessment {
  id: string
  date: string // format YYYY-MM-DD
  waktu: string
  layanan: string
  metode: "Online" | "Offline"
  namaKlien?: string
  psikolog?: string
}

const INITIAL_ADMIN_BOOKINGS: BookedAssessment[] = [
  {
    id: "ab1",
    date: "2026-08-03",
    waktu: "10:00 - 11:00",
    layanan: "Konseling",
    metode: "Online",
    namaKlien: "Karen Sya",
    psikolog: "Dr. Dimas",
  },
  {
    id: "ab2",
    date: "2026-08-04",
    waktu: "13:00 - 14:00",
    layanan: "Home Visit",
    metode: "Offline",
    namaKlien: "Karen Sya",
    psikolog: "Dr. Dimas",
  },
  {
    id: "ab3",
    date: "2026-08-06",
    waktu: "14:30 - 15:30",
    layanan: "Asesmen Klinis",
    metode: "Online",
    namaKlien: "Dimas Pratama",
    psikolog: "Dr. Dimas",
  },
  {
    id: "ab4",
    date: "2026-08-07",
    waktu: "09:00 - 10:00",
    layanan: "Konseling Pasangan",
    metode: "Offline",
    namaKlien: "Sarah & David",
    psikolog: "Dr. Dimas",
  },
  {
    id: "ab5",
    date: "2026-08-10",
    waktu: "09:00 - 10:00",
    layanan: "Konseling",
    metode: "Online",
    namaKlien: "Budi Santoso",
    psikolog: "Dr. Dimas",
  },
  {
    id: "ab6",
    date: "2026-08-11",
    waktu: "13:00 - 14:00",
    layanan: "Home Visit",
    metode: "Offline",
    namaKlien: "Karen Sya",
    psikolog: "Dr. Dimas",
  },
]

export interface ClientSessionToday {
  id: string
  waktu: string
  namaKlien: string
  klienId: string
  kontak?: string
  psikolog: string
  layanan: string
  tipe: string
  catatan?: string
  status: "Selesai" | "Segera Dimulai" | "Menunggu Jadwal" | "Sedang Berlangsung" | "Dibatalkan"
  isUpcomingNearest?: boolean
}

export const RAW_CLIENT_SESSIONS: Omit<ClientSessionToday, "status" | "isUpcomingNearest">[] = [
  {
    id: "cs1",
    waktu: "09:00 - 10:00",
    namaKlien: "Budi Santoso",
    klienId: "010195",
    kontak: "0812-3456-7890",
    psikolog: "Dr. Dimas",
    layanan: "Konseling Individu",
    tipe: "Online [Zoom]",
    catatan: "Keluhan cemas dan stres pekerjaan berulang",
  },
  {
    id: "cs2",
    waktu: "10:30 - 11:30",
    namaKlien: "Karenn Sya",
    klienId: "010198",
    kontak: "0813-8899-7711",
    psikolog: "Dr. Dimas",
    layanan: "Hipnoterapi",
    tipe: "Online [Zoom]",
    catatan: "Sesi relaksasi dan penanganan insomnia",
  },
  {
    id: "cs3",
    waktu: "13:00 - 14:00",
    namaKlien: "Karenn Sya",
    klienId: "010198",
    kontak: "0813-8899-7711",
    psikolog: "Dr. Dimas",
    layanan: "Konseling Pribadi",
    tipe: "Online [Zoom]",
    catatan: "Lanjutan evaluasi progres mingguan dan latihan pernapasan",
  },
  {
    id: "cs4",
    waktu: "15:00 - 16:00",
    namaKlien: "Dimas Pratama",
    klienId: "010204",
    kontak: "0857-1122-3344",
    psikolog: "Dr. Dimas",
    layanan: "Home Visit",
    tipe: "Offline [Klinik]",
    catatan: "Pendampingan konseling keluarga tatap muka",
  },
  {
    id: "cs5",
    waktu: "16:30 - 17:30",
    namaKlien: "Sarah & David",
    klienId: "010211",
    kontak: "0821-9988-7766",
    psikolog: "Dr. Dimas",
    layanan: "Konseling Pasangan",
    tipe: "Online [Zoom]",
    catatan: "Komunikasi dan resolusi konflik pranikah",
  },
  {
    id: "cs6",
    waktu: "18:30 - 19:30",
    namaKlien: "Rian Hidayat",
    klienId: "010219",
    kontak: "0812-7788-9900",
    psikolog: "Dr. Dimas",
    layanan: "Konseling Karir",
    tipe: "Online [Zoom]",
    catatan: "Eksplorasi burnout dan evaluasi transisi karir profesional",
  },
  {
    id: "cs7",
    waktu: "20:00 - 21:00",
    namaKlien: "Amanda Putri",
    klienId: "010225",
    kontak: "0858-6677-8899",
    psikolog: "Dr. Dimas",
    layanan: "Asesmen Klinis",
    tipe: "Online [Zoom]",
    catatan: "Asesmen lanjutan kecemasan akademik dan regulasi emosi",
  },
  {
    id: "cs8",
    waktu: "21:30 - 22:30",
    namaKlien: "Kevin Sanjaya",
    klienId: "010232",
    kontak: "0819-3344-5566",
    psikolog: "Dr. Dimas",
    layanan: "Konseling Remaja",
    tipe: "Online [Zoom]",
    catatan: "Konseling manajemen waktu belajar dan relasi pertemanan",
  },
]

function parseTimeRangeMinutes(timeStr: string) {
  const parts = timeStr.split("-").map((s) => s.trim())
  if (parts.length < 2) return { startMinutes: 0, endMinutes: 0 }
  const [startH, startM] = parts[0].split(":").map(Number)
  const [endH, endM] = parts[1].split(":").map(Number)
  return {
    startMinutes: (startH || 0) * 60 + (startM || 0),
    endMinutes: (endH || 0) * 60 + (endM || 0),
  }
}

export function getInitialSessionsBasedOnTime(): ClientSessionToday[] {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  let foundNearest = false

  const list: ClientSessionToday[] = RAW_CLIENT_SESSIONS.map((item) => {
    const { startMinutes, endMinutes } = parseTimeRangeMinutes(item.waktu)

    // Kasus 1: Sesi sudah lewat dibanding jam sekarang
    if (currentMinutes >= endMinutes) {
      return {
        ...item,
        status: "Selesai" as const,
        isUpcomingNearest: false,
      }
    }

    // Kasus 2: Sesi sedang berlangsung di jam sekarang (bukan sesi terdekat berikutnya)
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

    // Sesi setelahnya berstatus Menunggu Jadwal
    return {
      ...item,
      status: "Menunggu Jadwal" as const,
      isUpcomingNearest: false,
    }
  })

  // Jaga-jaga jika dibuka larut malam (> 22:30), tambahkan 1 slot aktif malam ini
  if (!foundNearest) {
    const currentH = now.getHours()
    const nextH = (currentH + 1) % 24
    list.push({
      id: "cs_night",
      waktu: `${String(currentH).padStart(2, "0")}:45 - ${String(nextH).padStart(2, "0")}:45`,
      namaKlien: "Dina Mariana",
      klienId: "010240",
      kontak: "0813-2233-4455",
      psikolog: "Dr. Dimas",
      layanan: "Konseling Darurat",
      tipe: "Online [Zoom]",
      catatan: "Sesi konseling malam / evaluasi stres akut",
      status: "Segera Dimulai",
      isUpcomingNearest: true,
    })
  }

  return list
}

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

function formatWhatsAppMessage(session: {
  namaKlien: string
  klienId: string
  layanan: string
  psikolog: string
  waktu: string
  tipe: string
}): string {
  return `Halo Kak ${session.namaKlien},

Kami dari Tim Administrasi Empathika ingin mengonfirmasi jadwal sesi Anda hari ini:

📋 *Detail Jadwal Konseling:*
• *ID Klien:* ${session.klienId}
• *Layanan:* ${session.layanan}
• *Psikolog:* ${session.psikolog}
• *Waktu Sesi:* ${session.waktu} WIB
• *Metode:* ${session.tipe}

Mohon dapat bersiap 10 menit sebelum sesi dimulai. Jika ada kendala atau pertanyaan yang ingin ditanyakan, silakan membalas pesan ini. Terima kasih! 🙏`
}

function getWhatsAppUrl(session: {
  kontak?: string
  namaKlien: string
  klienId: string
  layanan: string
  psikolog: string
  waktu: string
  tipe: string
}): string {
  if (!session.kontak) return "#"
  const clean = session.kontak.replace(/\D/g, "")
  const waNumber = clean.startsWith("0") ? "62" + clean.slice(1) : clean
  const message = formatWhatsAppMessage(session)
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`
}

export default function JadwalAdmin() {
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 7, 4))
  const [selectedTime, setSelectedTime] = useState<string>("13:00 - 14:00")
  const [currentWeekMonday, setCurrentWeekMonday] = useState<Date>(() => getMonday(new Date(2026, 7, 4)))
  const [bookedSessions, setBookedSessions] = useState<BookedAssessment[]>(INITIAL_ADMIN_BOOKINGS)
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null)

  // ── State Sesi Klien Hari Ini (Disesuaikan dengan Jam Sekarang) ──
  const [todaySessions, setTodaySessions] = useState<ClientSessionToday[]>(() => getInitialSessionsBasedOnTime())
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [selectedDetailSession, setSelectedDetailSession] = useState<ClientSessionToday | null>(null)
  const [sessionToCancel, setSessionToCancel] = useState<ClientSessionToday | null>(null)
  const [actionToast, setActionToast] = useState<{ message: string; type: "success" | "danger" } | null>(null)

  const triggerToast = (message: string, type: "success" | "danger" = "success") => {
    setActionToast({ message, type })
    setTimeout(() => setActionToast(null), 3500)
  }

  const handleCopyWhatsAppMessage = (session: ClientSessionToday) => {
    const text = formatWhatsAppMessage(session)
    navigator.clipboard.writeText(text)
    triggerToast(`Pesan jadwal untuk ${session.namaKlien} berhasil disalin ke clipboard!`, "success")
  }

  const handleMarkCompleted = (id: string, namaKlien: string) => {
    setTodaySessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "Selesai", isUpcomingNearest: false } : s))
    )
    triggerToast(`Sesi ${namaKlien} berhasil ditandai Selesai!`, "success")
  }

  const handleCancelSession = (id: string, namaKlien: string) => {
    setTodaySessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "Dibatalkan", isUpcomingNearest: false } : s))
    )
    triggerToast(`Sesi ${namaKlien} telah dibatalkan.`, "danger")
  }

  // ── State Filter Layanan & Tanggal ──
  const [selectedLayanan, setSelectedLayanan] = useState<string>("Semua Layanan")
  const [isLayananDropdownOpen, setIsLayananDropdownOpen] = useState(false)
  const dateInputRef = useRef<HTMLInputElement>(null)

  // Options Layanan Dinamis
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
    return Array.from(set)
  }, [todaySessions, bookedSessions])

  // Helper Pencocokan Filter Layanan
  const matchLayanan = (itemLayanan: string, filter: string) => {
    if (filter === "Semua Layanan") return true
    const itemNorm = (itemLayanan || "").trim().toLowerCase()
    const filterNorm = (filter || "").trim().toLowerCase()
    if (itemNorm === filterNorm) return true
    if (filterNorm === "konseling" && itemNorm.includes("konseling")) return true
    if (filterNorm === "asesmen" && itemNorm.includes("asesmen")) return true
    if (filterNorm === "hipnoterapi" && itemNorm.includes("hipnoterapi")) return true
    return false
  }

  // Sesi Hari Ini yang Terfilter
  const filteredTodaySessions = useMemo(() => {
    return todaySessions.filter((s) => matchLayanan(s.layanan, selectedLayanan))
  }, [todaySessions, selectedLayanan])

  // Ringkasan metrik sesi hari ini (mengikuti filter layanan yang aktif)
  const stats = useMemo(() => {
    const total = filteredTodaySessions.length
    const sedangBerlangsung = filteredTodaySessions.filter((s) => s.status === "Sedang Berlangsung").length
    const selesai = filteredTodaySessions.filter((s) => s.status === "Selesai").length
    const menunggu = filteredTodaySessions.filter(
      (s) => s.status === "Menunggu Jadwal" || s.status === "Segera Dimulai"
    ).length
    return { total, sedangBerlangsung, selesai, menunggu }
  }, [filteredTodaySessions])

  // Sesi terdekat yang akan datang (sesi berikutnya di masa depan yang aktif)
  const nearestSession = useMemo(() => {
    // 1. Cari sesi yang berstatus 'Segera Dimulai'
    const upcoming = filteredTodaySessions.find((s) => s.status === "Segera Dimulai")
    if (upcoming) return upcoming

    // 2. Jika tidak ada yang 'Segera Dimulai', cari sesi pertama yang berstatus 'Menunggu Jadwal'
    const waiting = filteredTodaySessions.find((s) => s.status === "Menunggu Jadwal")
    if (waiting) return waiting

    return null
  }, [filteredTodaySessions])

  // Update berkala status sesi seiring berjalannya jam riil
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const currentMinutes = now.getHours() * 60 + now.getMinutes()

      setTodaySessions((prev) => {
        let foundNearest = false
        return prev.map((item) => {
          // Jangan reset sesi yang telah dibatalkan atau sengaja ditandai selesai oleh admin
          if (item.status === "Dibatalkan" || item.status === "Selesai") return item

          const { startMinutes, endMinutes } = parseTimeRangeMinutes(item.waktu)

          if (currentMinutes >= endMinutes) {
            return { ...item, status: "Selesai" as const, isUpcomingNearest: false }
          }

          if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
            return {
              ...item,
              status: "Sedang Berlangsung" as const,
              isUpcomingNearest: false,
            }
          }

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
      })
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const timeSlots = [
    "09:00 - 10:00",
    "10:00 - 11:00",
    "13:00 - 14:00",
    "14:30 - 15:30",
    "15:30 - 16:30",
  ]

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

  // Sinkronkan minggu saat tanggal di kalender dipilih
  const handleSelectDate = (newDate: Date | undefined) => {
    setDate(newDate)
    if (newDate) {
      setCurrentWeekMonday(getMonday(newDate))
    }
  }

  // 6 hari kerja (Senin - Sabtu)
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

  // Label rentang minggu dinamis
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
    const prev = new Date(currentWeekMonday)
    prev.setDate(currentWeekMonday.getDate() - 7)
    setCurrentWeekMonday(prev)
  }

  const goToNextWeek = () => {
    const next = new Date(currentWeekMonday)
    next.setDate(currentWeekMonday.getDate() + 7)
    setCurrentWeekMonday(next)
  }

  const handleBooking = () => {
    if (!date || !selectedTime) return
    const dateKey = formatDateKey(date)
    const newSession: BookedAssessment = {
      id: "ab_" + Date.now(),
      date: dateKey,
      waktu: selectedTime,
      layanan: "Asesmen",
      metode: "Online",
      namaKlien: "Klien Baru",
      psikolog: "Dr. Dimas",
    }
    setBookedSessions((prev) => [...prev, newSession])
    setBookingSuccessMsg(`Jadwal ${selectedTime} berhasil disimpan ke Jadwal Mingguan!`)
    setTimeout(() => setBookingSuccessMsg(null), 3500)
  }

  const [isModalOpen, setIsModalOpen] = useState(false)

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
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-8 font-poppins pb-10">

      {/* Top Actions & Filters */}
      <div className="flex flex-col sm:flex-row justify-end items-end sm:items-center gap-3 border-t border-gray-200 pt-6">
        {/* Dropdown Layanan */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsLayananDropdownOpen((prev) => !prev)}
            className={`flex items-center gap-2 border px-4 py-2.5 rounded-full text-sm font-medium transition-all shadow-2xs cursor-pointer ${
              selectedLayanan !== "Semua Layanan"
                ? "border-[#561269] bg-purple-50 text-[#561269] font-semibold"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span>{selectedLayanan}</span>
            <ChevronDown
              className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                isLayananDropdownOpen ? "rotate-180 text-[#561269]" : "text-gray-500"
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
                          setSelectedLayanan(opt)
                          setIsLayananDropdownOpen(false)
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
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
                        setSelectedLayanan("Semua Layanan")
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-blue-500" />
          </div>
          <div className="flex flex-col">
            <p className="text-xs font-semibold text-gray-500">Total Sesi hari ini</p>
            <p className="text-xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-red-500" />
          </div>
          <div className="flex flex-col">
            <p className="text-xs font-semibold text-gray-500">Sedang Berlangsung</p>
            <p className="text-xl font-bold text-gray-900">{stats.sedangBerlangsung}</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          </div>
          <div className="flex flex-col">
            <p className="text-xs font-semibold text-gray-500">Sesi Selesai</p>
            <p className="text-xl font-bold text-gray-900">{stats.selesai}</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
            <CalendarClock className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="flex flex-col">
            <p className="text-xs font-semibold text-gray-500">Menunggu Jadwal</p>
            <p className="text-xl font-bold text-gray-900">{stats.menunggu}</p>
          </div>
        </div>
      </div>

      {/* Sesi Client Section (Fokus Waktu Terdekat yang Akan Datang dalam Satu Hari) */}
      <div className="mt-4 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-0.5">Sesi Klien Hari Ini</h2>
            <p className="text-sm text-gray-500">
              Jadwal sesi klien dalam satu hari, diutamakan waktu terdekat yang akan datang.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-100 text-[#561269] text-xs font-semibold self-start sm:self-auto shadow-xs">
            <Clock className="w-3.5 h-3.5" />
            Hari Ini • {formattedDate}
          </span>
        </div>

        {/* Card Highlight: Sesi Terdekat Berikutnya */}
        {nearestSession ? (
          <div className="bg-gradient-to-r from-purple-50 via-[#FAF4FC] to-purple-50 border-2 border-[#561269]/30 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#561269] text-white flex items-center justify-center shrink-0 shadow-md">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-[#561269] text-white text-[10px] font-bold uppercase tracking-wider">
                    Sesi Terdekat Berikutnya
                  </span>
                  <span className="text-xs font-bold text-purple-900">
                    {nearestSession.waktu}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mt-1">
                  {nearestSession.namaKlien}{" "}
                  <span className="text-xs font-normal text-gray-500">(ID: {nearestSession.klienId})</span>
                </h3>
                <p className="text-xs text-gray-600">
                  {nearestSession.layanan} • {nearestSession.psikolog} •{" "}
                  <span className="font-semibold text-[#561269]">{nearestSession.tipe}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              <AdminStatusBadge
                variant={
                  nearestSession.status === "Selesai"
                    ? "success"
                    : nearestSession.status === "Segera Dimulai"
                    ? "info"
                    : nearestSession.status === "Sedang Berlangsung"
                    ? "danger"
                    : nearestSession.status === "Dibatalkan"
                    ? "neutral"
                    : "warning"
                }
                className="w-44"
              >
                {nearestSession.status}
              </AdminStatusBadge>
              <button
                type="button"
                onClick={() => setSelectedDetailSession(nearestSession)}
                className="text-xs font-bold px-3 py-1.5 rounded-lg border border-purple-200 text-[#561269] hover:bg-purple-100/60 transition cursor-pointer"
              >
                Detail
              </button>
              {nearestSession.kontak && (
                <div className="flex items-center gap-1.5">
                  <a
                    href={getWhatsAppUrl(nearestSession)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center gap-1.5 transition shadow-2xs active:scale-95 cursor-pointer whitespace-nowrap"
                    title="Hubungi klien via WhatsApp dengan rincian jadwal"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Chat WA</span>
                    <ExternalLink className="w-3 h-3 opacity-80" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopyWhatsAppMessage(nearestSession)}
                    className="p-1.5 rounded-lg border border-purple-200 text-gray-600 hover:text-[#561269] hover:bg-purple-100/60 transition cursor-pointer"
                    title="Salin Pesan WA"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-emerald-800 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Semua sesi klien untuk hari ini telah selesai atau belum ada jadwal mendesak lainnya.</span>
          </div>
        )}

        {/* Tabel Sesi Klien dalam Satu Hari */}
        <div
          className={`overflow-x-auto rounded-2xl border border-gray-200/80 bg-white admin-table-scrollbar ${
            todaySessions.length > 7 ? "max-h-[480px] overflow-y-auto" : ""
          }`}
        >
          <table className="w-full text-left border-collapse min-w-[820px]">
            <thead className="sticky top-0 z-10 bg-[#D3C4D8]">
              <tr className="bg-[#D3C4D8] text-gray-800 text-xs sm:text-sm font-bold">
                <th className="py-4 px-6 font-bold min-w-[140px] sticky top-0 bg-[#D3C4D8] z-10">Waktu Sesi</th>
                <th className="py-4 px-6 font-bold sticky top-0 bg-[#D3C4D8] z-10">Nama Klien</th>
                <th className="py-4 px-6 font-bold sticky top-0 bg-[#D3C4D8] z-10">Psikolog</th>
                <th className="py-4 px-6 font-bold sticky top-0 bg-[#D3C4D8] z-10">Layanan</th>
                <th className="py-4 px-6 font-bold sticky top-0 bg-[#D3C4D8] z-10">Tipe & Status</th>
                <th className="py-4 px-4 font-bold text-center sticky top-0 bg-[#D3C4D8] z-10 w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs sm:text-sm">
              {filteredTodaySessions.length > 0 ? (
                filteredTodaySessions.map((item, index) => {
                  const isNearest = nearestSession?.id === item.id
                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isNearest ? "bg-purple-50/60 hover:bg-purple-50/90" : "hover:bg-purple-50/40"
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {isNearest && (
                            <span className="w-2 h-2 rounded-full bg-[#561269] animate-ping" />
                          )}
                          <p className={`font-bold ${isNearest ? "text-[#561269]" : "text-gray-900"}`}>
                            {item.waktu}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">Hari Ini</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-extrabold text-gray-900">{item.namaKlien}</p>
                        <p className="text-xs text-gray-500 mt-0.5">ID: {item.klienId}</p>
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-700">{item.psikolog}</td>
                      <td className="py-4 px-6 text-gray-700 capitalize font-medium">{item.layanan}</td>
                      <td className="py-4 px-6">
                        <p className="text-gray-900 font-medium mb-1">{item.tipe}</p>
                        <AdminStatusBadge
                          variant={
                            item.status === "Selesai"
                              ? "success"
                              : item.status === "Segera Dimulai"
                              ? "info"
                              : item.status === "Sedang Berlangsung"
                              ? "danger"
                              : item.status === "Dibatalkan"
                              ? "neutral"
                              : "warning"
                          }
                          className="w-44"
                        >
                          {item.status}
                        </AdminStatusBadge>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-[#561269] hover:bg-purple-100/60 transition-colors cursor-pointer"
                            title="Pilihan Aksi"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>

                          {activeMenuId === item.id && (
                            <>
                              <div
                                className="fixed inset-0 z-30"
                                onClick={() => setActiveMenuId(null)}
                              />
                              <div
                                className={`absolute right-0 w-48 rounded-2xl bg-white shadow-xl border border-gray-100 py-2 z-40 text-left transition-all ${
                                  index >= filteredTodaySessions.length - 2 ? "bottom-full mb-2" : "top-full mt-2"
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedDetailSession(item)
                                    setActiveMenuId(null)
                                  }}
                                  className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-purple-50 hover:text-[#561269] flex items-center gap-2.5 transition-colors cursor-pointer"
                                >
                                  <Eye className="w-4 h-4 text-purple-600 shrink-0" />
                                  Lihat Detail
                                </button>

                                {item.kontak && item.status !== "Selesai" && item.status !== "Dibatalkan" && (
                                  <>
                                    <a
                                      href={getWhatsAppUrl(item)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={() => setActiveMenuId(null)}
                                      className="w-full text-left px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                    >
                                      <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
                                      <span>Chat WA Klien</span>
                                      <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleCopyWhatsAppMessage(item)
                                        setActiveMenuId(null)
                                      }}
                                      className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                    >
                                      <Copy className="w-4 h-4 text-gray-500 shrink-0" />
                                      <span>Salin Pesan WA</span>
                                    </button>
                                  </>
                                )}

                                {item.status !== "Selesai" && item.status !== "Dibatalkan" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleMarkCompleted(item.id, item.namaKlien)
                                      setActiveMenuId(null)
                                    }}
                                    className="w-full text-left px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    Tandai Selesai
                                  </button>
                                )}

                                {item.status !== "Dibatalkan" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSessionToCancel(item)
                                      setActiveMenuId(null)
                                    }}
                                    className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer border-t border-gray-100"
                                  >
                                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                                    Batalkan Sesi
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <p className="text-sm font-semibold text-gray-600">
                      Tidak ada jadwal sesi hari ini untuk layanan &quot;{selectedLayanan}&quot;.
                    </p>
                    {selectedLayanan !== "Semua Layanan" && (
                      <button
                        type="button"
                        onClick={() => setSelectedLayanan("Semua Layanan")}
                        className="mt-3 inline-flex items-center text-xs text-[#561269] font-bold hover:underline cursor-pointer"
                      >
                        Tampilkan semua layanan
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Jadwal Asesmen (Calendar + Time Slots) */}
      <div className="mt-8 bg-white border border-gray-100 shadow-sm rounded-2xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Jadwal Asesmen</h2>
        <p className="text-gray-500 text-sm mb-8">Atur jadwal Asesmen, Pilih tanggal dan waktu yang tersedia.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12 max-w-4xl">
          {/* Left: Date Picker Box */}
          <div className="border border-purple-200 rounded-2xl p-6 shadow-sm flex justify-center items-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleSelectDate}
              fixedWeeks
              className="w-full max-w-[320px]"
            />
          </div>

          {/* Right: Time Slots Box */}
          <div className="border border-purple-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
            <div>
              <h3 className="font-bold text-gray-900 mb-6 capitalize">
                {date
                  ? date.toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                  : "Pilih Tanggal"}
              </h3>

              <div className="flex flex-col gap-3">
                {timeSlots.map((time, i) => {
                  const isActive = selectedTime === time;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer transition-colors w-full text-left ${isActive ? 'border-[#561269] bg-purple-50/50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isActive ? 'border-[#561269]' : 'border-gray-300'}`}>
                        {isActive && <div className="w-2 h-2 rounded-full bg-[#561269]" />}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{time}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-6">
              {bookingSuccessMsg && (
                <p className="text-xs text-emerald-600 font-semibold text-center">
                  ✓ {bookingSuccessMsg}
                </p>
              )}
              <button
                type="button"
                onClick={handleBooking}
                disabled={!selectedTime}
                className={`w-full font-bold py-3.5 rounded-full shadow-sm transition-all transform active:scale-98 ${selectedTime
                  ? "bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 cursor-pointer shadow-sm hover:shadow-md"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
              >
                Pilih Jadwal ini
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Jadwal Asesmen Mingguan */}
      <div className="mt-8 bg-white border border-gray-100 shadow-sm rounded-2xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Jadwal Mingguan</h2>
        <p className="text-gray-500 text-sm mb-6">Lihat ringkasan layanan yang telah dibooking oleh klien dalam satu minggu</p>

        {/* Week Selector */}
        <div className="flex items-center gap-3 text-[13px] font-bold text-gray-800 mb-4">
          <button
            type="button"
            onClick={goToPrevWeek}
            aria-label="Minggu Sebelumnya"
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors border border-gray-200 text-gray-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-gray-900 min-w-[160px] text-center">{weekRangeTitle}</span>
          <button
            type="button"
            onClick={goToNextWeek}
            aria-label="Minggu Berikutnya"
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors border border-gray-200 text-gray-600"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Weekly Grid */}
        <div className="overflow-x-auto border border-gray-200 rounded-xl hide-scrollbar">
          <div className="min-w-[720px]">
            {/* Header */}
            <div className="grid grid-cols-6 border-b border-gray-200 bg-gray-50/70">
              {weekDays.map((wd, i) => (
                <div
                  key={i}
                  className={`py-3 flex flex-col items-center justify-center border-r border-gray-200 last:border-0 ${wd.isSameAsSelected ? "bg-purple-50/80" : ""
                    }`}
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
              ))}
            </div>

            {/* Grid Body */}
            <div className="grid grid-cols-6 min-h-[360px] divide-x divide-gray-200">
              {weekDays.map((wd, i) => {
                const sessions = bookedSessions.filter(
                  (s) => s.date === wd.dateKey && matchLayanan(s.layanan, selectedLayanan)
                )

                return (
                  <div
                    key={i}
                    className={`p-2.5 flex flex-col gap-2.5 ${wd.isSameAsSelected ? "bg-purple-50/20" : "bg-white"
                      }`}
                  >
                    {sessions.length > 0 ? (
                      sessions.map((item) => (
                        <div
                          key={item.id}
                          className="bg-[#E8F3ED] border border-[#b4d6be] rounded-xl p-3 flex flex-col gap-1 shadow-xs hover:shadow-sm transition-all"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-600 shrink-0"></span>
                            <span className="text-xs font-extrabold text-[#185e26]">{item.waktu}</span>
                          </div>
                          <p className="text-xs font-bold text-gray-900 leading-tight mt-0.5">
                            {item.layanan}
                          </p>
                          <div className="text-[10px] text-gray-600 flex flex-col mt-0.5 leading-tight">
                            {item.namaKlien && (
                              <span>Klien: <strong className="text-gray-800">{item.namaKlien}</strong></span>
                            )}
                            {item.psikolog && (
                              <span>Tenaga: {item.psikolog}</span>
                            )}
                            <span className="text-[9px] text-gray-500 italic mt-0.5">[{item.metode}]</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex items-center justify-center py-16">
                        <span className="text-xs text-gray-300 italic select-none">Tidak ada jadwal</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-6 ml-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-600"></span>
            <span className="text-xs font-bold text-gray-700">Layanan yang Sudah Dibooking</span>
          </div>
          <span className="text-[11px] text-gray-400">
            * Menampilkan daftar layanan asesmen/konseling yang telah dibooking dalam satu minggu.
          </span>
        </div>
      </div>

      {/* Modal Tambah Sesi */}
      <ModalTambahSesi
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      {/* ── Modal Detail Sesi Klien ── */}
      {selectedDetailSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-poppins animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-7 flex flex-col justify-between">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">
                    Detail Sesi Klien
                  </h3>
                  <p className="text-xs text-gray-500">
                    Informasi sesi konseling hari ini
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailSession(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4 text-xs sm:text-sm">
              {/* Card Klien */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Klien</p>
                    <p className="text-base font-extrabold text-gray-900 mt-0.5">
                      {selectedDetailSession.namaKlien}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-purple-100 text-[#561269] text-xs font-bold">
                    ID: {selectedDetailSession.klienId}
                  </span>
                </div>

                {selectedDetailSession.kontak && (
                  <div className="pt-3 border-t border-gray-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#1C5E24] flex items-center justify-center shrink-0 border border-emerald-200">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-medium text-gray-400 leading-none">
                          No. WhatsApp / Kontak
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-gray-900 mt-1 whitespace-nowrap tracking-wide">
                          {selectedDetailSession.kontak}
                        </span>
                      </div>
                    </div>

                    {selectedDetailSession.status !== "Selesai" && selectedDetailSession.status !== "Dibatalkan" ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={getWhatsAppUrl(selectedDetailSession)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap"
                          title="Buka WhatsApp Klien dengan rincian jadwal otomatis"
                        >
                          <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Chat WA</span>
                          <ExternalLink className="w-3 h-3 opacity-80 shrink-0" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopyWhatsAppMessage(selectedDetailSession)}
                          className="px-3 py-1.5 rounded-full border border-gray-300 hover:bg-gray-100 bg-white text-gray-700 text-xs font-semibold inline-flex items-center gap-1.5 transition active:scale-95 cursor-pointer whitespace-nowrap"
                          title="Salin Rincian Pesan WA ke Clipboard"
                        >
                          <Copy className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                          <span>Salin</span>
                        </button>
                      </div>
                    ) : selectedDetailSession.status === "Selesai" ? (
                      <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full whitespace-nowrap">
                        Sesi telah selesai
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full whitespace-nowrap">
                        Sesi dibatalkan
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Grid Info Sesi */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                  <p className="text-[11px] font-semibold text-gray-500">Layanan</p>
                  <p className="font-bold text-gray-900 mt-1">{selectedDetailSession.layanan}</p>
                </div>
                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                  <p className="text-[11px] font-semibold text-gray-500">Psikolog Bertugas</p>
                  <p className="font-bold text-gray-900 mt-1">{selectedDetailSession.psikolog}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[11px] font-semibold text-gray-500">Waktu Sesi</p>
                  <p className="font-bold text-gray-900 mt-1">{selectedDetailSession.waktu} WIB</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[11px] font-semibold text-gray-500">Metode</p>
                  <p className="font-bold text-[#561269] mt-1">{selectedDetailSession.tipe}</p>
                </div>
              </div>

              {/* Catatan / Keluhan */}
              {selectedDetailSession.catatan && (
                <div className="p-3.5 bg-amber-50/40 rounded-xl border border-amber-200/60">
                  <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1">
                    Catatan / Keluhan Awal
                  </p>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {selectedDetailSession.catatan}
                  </p>
                </div>
              )}

              {/* Status Sesi */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="font-semibold text-gray-700">Status Saat Ini:</span>
                <AdminStatusBadge
                  variant={
                    selectedDetailSession.status === "Selesai"
                      ? "success"
                      : selectedDetailSession.status === "Segera Dimulai"
                      ? "info"
                      : selectedDetailSession.status === "Sedang Berlangsung"
                      ? "danger"
                      : selectedDetailSession.status === "Dibatalkan"
                      ? "neutral"
                      : "warning"
                  }
                  className="w-40"
                >
                  {selectedDetailSession.status}
                </AdminStatusBadge>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="flex items-center justify-end gap-2.5 pt-5 mt-5 border-t border-gray-100">
              {selectedDetailSession.status !== "Selesai" && selectedDetailSession.status !== "Dibatalkan" && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const s = selectedDetailSession
                      setSelectedDetailSession(null)
                      setSessionToCancel(s)
                    }}
                    className="px-4 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition cursor-pointer"
                  >
                    Batalkan Sesi
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleMarkCompleted(selectedDetailSession.id, selectedDetailSession.namaKlien)
                      setSelectedDetailSession(null)
                    }}
                    className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    Tandai Selesai
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setSelectedDetailSession(null)}
                className="px-5 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Konfirmasi Pembatalan ── */}
      {sessionToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-poppins animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Batalkan Sesi Klien?
            </h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              Apakah Anda yakin ingin membatalkan sesi untuk{" "}
              <strong className="text-gray-800">{sessionToCancel.namaKlien}</strong> ({sessionToCancel.waktu})? Tindakan ini akan mengubah status sesi menjadi Dibatalkan.
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setSessionToCancel(null)}
                className="flex-1 py-2.5 rounded-full border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={() => {
                  handleCancelSession(sessionToCancel.id, sessionToCancel.namaKlien)
                  setSessionToCancel(null)
                }}
                className="flex-1 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

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
