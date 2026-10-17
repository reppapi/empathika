"use client"

import React, { useState, useMemo } from "react"
import { Calendar } from "@/components/ui/calendar"

interface BookedSession {
  id: string
  date: string // format YYYY-MM-DD
  waktu: string
  layanan: string
  metode: "Online" | "Offline"
  namaKlien?: string
}

const INITIAL_BOOKINGS: BookedSession[] = [
  // Minggu 3 - 8 Agustus 2026
  {
    id: "b1",
    date: "2026-08-03",
    waktu: "10:00 - 11:00",
    layanan: "Hipnoterapi",
    metode: "Online",
    namaKlien: "Karen Sya",
  },
  {
    id: "b2",
    date: "2026-08-04",
    waktu: "13:30 - 14:30",
    layanan: "Home Visit",
    metode: "Offline",
    namaKlien: "Dimas Pratama",
  },
  {
    id: "b3",
    date: "2026-08-06",
    waktu: "14:30 - 15:30",
    layanan: "Konseling Individu",
    metode: "Online",
    namaKlien: "Amanda P.",
  },
  {
    id: "b4",
    date: "2026-08-07",
    waktu: "09:00 - 10:00",
    layanan: "Konseling Pasangan",
    metode: "Offline",
    namaKlien: "Sarah & David",
  },
  // Minggu 10 - 15 Agustus 2026
  {
    id: "b5",
    date: "2026-08-10",
    waktu: "09:00 - 10:00",
    layanan: "Konseling Individu",
    metode: "Online",
    namaKlien: "Budi Santoso",
  },
  {
    id: "b6",
    date: "2026-08-11",
    waktu: "13:30 - 14:30",
    layanan: "Hipnoterapi",
    metode: "Offline",
    namaKlien: "Karen Sya",
  },
  {
    id: "b7",
    date: "2026-08-14",
    waktu: "10:00 - 11:00",
    layanan: "Home Visit",
    metode: "Offline",
    namaKlien: "Riko Prasetya",
  },
  // Minggu 17 - 22 Agustus 2026
  {
    id: "b8",
    date: "2026-08-18",
    waktu: "10:00 - 11:00",
    layanan: "Konseling Individu",
    metode: "Online",
    namaKlien: "Nadia Fitri",
  },
  {
    id: "b9",
    date: "2026-08-20",
    waktu: "15:30 - 16:30",
    layanan: "Hipnoterapi",
    metode: "Offline",
    namaKlien: "Rendy P.",
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

export default function PsikologJadwalClient() {
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 7, 4))
  const [currentWeekMonday, setCurrentWeekMonday] = useState<Date>(() => getMonday(new Date(2026, 7, 4)))
  const [bookedSessions, setBookedSessions] = useState<BookedSession[]>(INITIAL_BOOKINGS)
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null)

  const timeSlots = [
    "09:00 - 10:00",
    "10:00 - 11:00",
    "13:30 - 14:30",
    "14:30 - 15:30",
    "15:30 - 16:30",
  ]

  // Sinkronkan minggu saat memilih tanggal dari kalender
  const handleSelectDate = (newDate: Date | undefined) => {
    setDate(newDate)
    if (newDate) {
      setCurrentWeekMonday(getMonday(newDate))
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
  }

  const goToNextWeek = () => {
    const next = new Date(currentWeekMonday)
    next.setDate(currentWeekMonday.getDate() + 7)
    setCurrentWeekMonday(next)
  }

  const handleBooking = () => {
    if (!date || !selectedTime) return
    const dateKey = formatDateKey(date)
    const newSession: BookedSession = {
      id: "b_" + Date.now(),
      date: dateKey,
      waktu: selectedTime,
      layanan: "Konseling Individu",
      metode: "Online",
      namaKlien: "Sesi Ditambahkan",
    }
    setBookedSessions((prev) => [...prev, newSession])
    setBookingSuccessMsg(`Jadwal ${selectedTime} berhasil disimpan ke Jadwal Mingguan!`)
    setSelectedTime(null)
    setTimeout(() => setBookingSuccessMsg(null), 3500)
  }

  return (
    <div className="flex flex-col gap-6 font-sans text-gray-800 pb-16">
      {/* Card 1: Jadwal Sesi */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Jadwal Sesi</h2>
        <p className="text-sm text-gray-500 mb-8">
          Atur jadwal sesi konseling Anda dengan mudah. Pilih tanggal dan waktu yang tersedia sesuai dengan preferensi Anda.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {/* Calendar Picker (Left) */}
          <div className="rounded-[20px] border-2 border-[#DCD0E1] shadow-sm p-6 flex flex-col items-center justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleSelectDate}
              fixedWeeks
              className="w-full max-w-[320px] mx-auto bg-transparent"
            />
          </div>

          {/* Time Picker (Right) */}
          <div className="rounded-[20px] border-2 border-[#DCD0E1] shadow-sm p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-[15px] mb-4 capitalize">
                {date
                  ? date.toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Pilih Tanggal"}
              </h3>

              <div className="flex flex-col gap-2.5 mb-6">
                {timeSlots.map((time, idx) => (
                  <label
                    key={idx}
                    className="flex items-center gap-3 border border-gray-200 rounded-md px-4 py-2.5 cursor-pointer hover:border-gray-300 transition-colors"
                  >
                    <input
                      type="radio"
                      name="timeSlot"
                      value={time}
                      checked={selectedTime === time}
                      onChange={() => setSelectedTime(time)}
                      className="w-4 h-4 text-[#561269] focus:ring-[#561269] border-gray-300"
                    />
                    <span className="text-[13px] font-medium text-gray-700">{time}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {bookingSuccessMsg && (
                <p className="text-xs text-emerald-600 font-semibold text-center animate-fadeIn">
                  ✓ {bookingSuccessMsg}
                </p>
              )}
              <button
                type="button"
                onClick={handleBooking}
                disabled={!selectedTime}
                className={`w-full font-bold py-3.5 rounded-full text-[13px] transition-all ${
                  selectedTime
                    ? "bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 cursor-pointer shadow-sm hover:shadow-md active:scale-95"
                    : "bg-[#d6d6d6] text-gray-500 cursor-not-allowed"
                }`}
              >
                Pilih Jadwal Ini
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Jadwal Mingguan */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mt-2">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Jadwal Mingguan</h2>
        <p className="text-sm text-gray-500 mb-6">
          Lihat ringkasan jadwal sesi Anda yang sudah dibooking dalam satu minggu.
        </p>

        {/* Week Selector */}
        <div className="flex items-center gap-3 text-[13px] font-bold text-gray-800 mb-4">
          <button
            type="button"
            onClick={goToPrevWeek}
            aria-label="Minggu Sebelumnya"
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors border border-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-3.5 h-3.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <span className="font-semibold text-gray-900 min-w-[150px] text-center">{weekRangeLabel}</span>
          <button
            type="button"
            onClick={goToNextWeek}
            aria-label="Minggu Berikutnya"
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors border border-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-3.5 h-3.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        {/* Weekly Grid */}
        <div className="w-full border border-gray-200 rounded-xl overflow-x-auto hide-scrollbar">
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
                    className={`p-2 flex flex-col gap-2 ${
                      wd.isSameAsSelected ? "bg-purple-50/20" : "bg-white"
                    }`}
                  >
                    {timeSlots.map((time, slotIdx) => {
                      const booking = sessions.find((s) => s.waktu === time)

                      if (booking) {
                        return (
                          <div
                            key={booking.id || slotIdx}
                            className="bg-[#d7e6dc] border border-[#b4d6be] rounded-lg p-2.5 flex items-start gap-2 shadow-xs hover:shadow-sm transition-all"
                          >
                            <div className="w-2 h-2 rounded-full bg-[#185e26] shrink-0 mt-1" />
                            <div className="flex flex-col text-[10px] font-bold text-gray-800 leading-tight">
                              <span className="text-[#185e26]">{booking.waktu}</span>
                              <span className="font-semibold text-gray-900 mt-0.5">{booking.layanan}</span>
                              <span className="font-normal italic text-[9px] text-gray-600">
                                {booking.namaKlien ? `${booking.namaKlien} ` : ""}({booking.metode})
                              </span>
                            </div>
                          </div>
                        )
                      }

                      return (
                        <div
                          key={slotIdx}
                          className="bg-[#f3f4f6] border border-gray-200/80 rounded-lg p-2 flex items-start gap-2 hover:bg-gray-200/70 transition-colors"
                        >
                          <div className="w-2 h-2 rounded-full bg-gray-400 shrink-0 mt-1" />
                          <div className="flex flex-col text-[10px] leading-tight">
                            <span className="font-bold text-gray-700">{time}</span>
                            <span className="text-[9px] text-gray-500 font-medium mt-0.5">Tersedia</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-6 mt-5 px-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#185e26]" />
            <span className="text-[11px] font-bold text-gray-700">Sudah Dibooking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
            <span className="text-[11px] font-bold text-gray-700">Tersedia (Belum Dibooking)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
