"use client"

import { useState, useMemo } from "react"
import { Calendar } from "@/components/ui/calendar"
import ModalTambahSesi, { NewSessionData } from "@/features/dashboard/components/admin/ModalTambahSesi"
import { 
  Calendar as CalendarIcon, 
  ChevronDown, 
  Plus, 
  Clock, 
  Users, 
  CheckCircle2, 
  CalendarClock, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Circle
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

interface ClientSessionToday {
  id: string
  waktu: string
  namaKlien: string
  klienId: string
  psikolog: string
  layanan: string
  tipe: string
  status: "Selesai" | "Segera Dimulai" | "Menunggu Jadwal" | "Sedang Berlangsung"
  isUpcomingNearest?: boolean
}

const CLIENT_SESSIONS_TODAY: ClientSessionToday[] = [
  {
    id: "cs1",
    waktu: "09:00 - 10:00",
    namaKlien: "Budi Santoso",
    klienId: "010195",
    psikolog: "Dr. Dimas",
    layanan: "Konseling Individu",
    tipe: "Online [Zoom]",
    status: "Selesai",
  },
  {
    id: "cs2",
    waktu: "10:30 - 11:30",
    namaKlien: "Karenn Sya",
    klienId: "010198",
    psikolog: "Dr. Dimas",
    layanan: "Hipnoterapi",
    tipe: "Online [Zoom]",
    status: "Selesai",
  },
  {
    id: "cs3",
    waktu: "13:00 - 14:00",
    namaKlien: "Karenn Sya",
    klienId: "010198",
    psikolog: "Dr. Dimas",
    layanan: "Konseling Pribadi",
    tipe: "Online [Zoom]",
    status: "Segera Dimulai",
    isUpcomingNearest: true, // Sesi terdekat yang akan datang hari ini!
  },
  {
    id: "cs4",
    waktu: "15:00 - 16:00",
    namaKlien: "Dimas Pratama",
    klienId: "010204",
    psikolog: "Dr. Dimas",
    layanan: "Home Visit",
    tipe: "Offline [Klinik]",
    status: "Menunggu Jadwal",
  },
  {
    id: "cs5",
    waktu: "16:30 - 17:30",
    namaKlien: "Sarah & David",
    klienId: "010211",
    psikolog: "Dr. Dimas",
    layanan: "Konseling Pasangan",
    tipe: "Online [Zoom]",
    status: "Menunggu Jadwal",
  },
]

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

export default function JadwalAdmin() {
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 7, 4))
  const [selectedTime, setSelectedTime] = useState<string>("13:00 - 14:00")
  const [currentWeekMonday, setCurrentWeekMonday] = useState<Date>(() => getMonday(new Date(2026, 7, 4)))
  const [bookedSessions, setBookedSessions] = useState<BookedAssessment[]>(INITIAL_ADMIN_BOOKINGS)
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null)

  const timeSlots = [
    "09:00 - 10:00",
    "10:00 - 11:00",
    "13:00 - 14:00",
    "14:30 - 15:30",
    "15:30 - 16:30",
  ]
  
  const today = new Date()
  const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`

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
    setBookingSuccessMsg(`Sesi baru untuk ${newSession.namaKlien} (${newSession.waktu}) berhasil dijadwalkan!`)
    setTimeout(() => setBookingSuccessMsg(null), 4000)
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-8 font-poppins pb-10">

      {/* Top Actions & Filters */}
      <div className="flex flex-col sm:flex-row justify-end items-end sm:items-center gap-3 border-t border-gray-200 pt-6">
        <button className="flex items-center gap-2 border border-gray-300 bg-white px-4 py-2.5 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs">
          Semua Layanan
          <ChevronDown className="w-4 h-4 ml-2" />
        </button>
        <button className="flex items-center gap-2 border border-gray-300 bg-white px-4 py-2.5 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs">
          {formattedDate}
          <CalendarIcon className="w-4 h-4 ml-1" />
        </button>
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
            <p className="text-xl font-bold text-gray-900">12</p>
          </div>
        </div>
        
        {/* Card 2 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-red-500" />
          </div>
          <div className="flex flex-col">
            <p className="text-xs font-semibold text-gray-500">Sedang Berlangsung</p>
            <p className="text-xl font-bold text-gray-900">1</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          </div>
          <div className="flex flex-col">
            <p className="text-xs font-semibold text-gray-500">Sesi Selesai</p>
            <p className="text-xl font-bold text-gray-900">4</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
            <CalendarClock className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="flex flex-col">
            <p className="text-xs font-semibold text-gray-500">Menunggu Jadwal</p>
            <p className="text-xl font-bold text-gray-900">7</p>
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
                  13:00 - 14:00
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900 mt-1">
                Karenn Sya <span className="text-xs font-normal text-gray-500">(ID: 010198)</span>
              </h3>
              <p className="text-xs text-gray-600">
                Konseling Pribadi • Dr. Dimas • <span className="font-semibold text-[#561269]">Online [Zoom]</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-purple-100 text-[#561269] text-xs font-bold border border-purple-200">
              Segera Dimulai
            </span>
          </div>
        </div>

        {/* Tabel Sesi Klien dalam Satu Hari */}
        <div
          className={`overflow-x-auto rounded-2xl border border-gray-200/80 bg-white admin-table-scrollbar ${
            CLIENT_SESSIONS_TODAY.length > 7 ? "max-h-[480px] overflow-y-auto" : ""
          }`}
        >
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead className="sticky top-0 z-10 bg-[#D3C4D8]">
              <tr className="bg-[#D3C4D8] text-gray-800 text-xs sm:text-sm font-bold">
                <th className="py-4 px-6 font-bold min-w-[140px] sticky top-0 bg-[#D3C4D8] z-10">Waktu Sesi</th>
                <th className="py-4 px-6 font-bold sticky top-0 bg-[#D3C4D8] z-10">Nama Klien</th>
                <th className="py-4 px-6 font-bold sticky top-0 bg-[#D3C4D8] z-10">Psikolog</th>
                <th className="py-4 px-6 font-bold sticky top-0 bg-[#D3C4D8] z-10">Layanan</th>
                <th className="py-4 px-6 font-bold sticky top-0 bg-[#D3C4D8] z-10">Tipe & Status</th>
                <th className="py-4 px-4 font-bold text-center sticky top-0 bg-[#D3C4D8] z-10">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs sm:text-sm">
              {CLIENT_SESSIONS_TODAY.map((item) => {
                const isNearest = item.isUpcomingNearest
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
                      {item.status === "Selesai" ? (
                        <span className="inline-block bg-[#A2DCA4] text-[#1C5E24] text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                          Selesai
                        </span>
                      ) : item.status === "Segera Dimulai" ? (
                        <span className="inline-block bg-purple-100 text-[#561269] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-purple-200">
                          Terdekat • Segera Dimulai
                        </span>
                      ) : item.status === "Sedang Berlangsung" ? (
                        <span className="inline-block bg-[#E85656] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                          Sedang Berlangsung
                        </span>
                      ) : (
                        <span className="inline-block bg-[#F0C94D] text-[#5C4505] text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                          Menunggu Jadwal
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button className="text-gray-400 hover:text-[#561269] p-1.5 rounded-lg hover:bg-purple-100/50 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                )
              })}
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
                className={`w-full font-bold py-3.5 rounded-full shadow-sm transition-all transform active:scale-98 ${
                  selectedTime 
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
                  className={`py-3 flex flex-col items-center justify-center border-r border-gray-200 last:border-0 ${
                    wd.isSameAsSelected ? "bg-purple-50/80" : ""
                  }`}
                >
                  <span
                    className={`text-[13px] font-bold ${
                      wd.isSameAsSelected ? "text-[#561269]" : "text-gray-800"
                    }`}
                  >
                    {wd.dayName}
                  </span>
                  <span
                    className={`text-[11px] ${
                      wd.isSameAsSelected ? "text-[#561269] font-bold" : "text-gray-500"
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
                const sessions = bookedSessions.filter((s) => s.date === wd.dateKey)

                return (
                  <div
                    key={i}
                    className={`p-2.5 flex flex-col gap-2.5 ${
                      wd.isSameAsSelected ? "bg-purple-50/20" : "bg-white"
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
    </div>
  )
}
