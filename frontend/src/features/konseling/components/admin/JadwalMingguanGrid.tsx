"use client"

import React from "react"

interface WeekDayItem {
  dayName: string
  dateKey: string
  dateLabel: string
  isSameAsSelected: boolean
}

interface JadwalMingguanGridProps {
  canGoPrevWeek?: boolean
  goToPrevWeek: () => void
  goToNextWeek: () => void
  weekRangeTitle: string
  weekDays: WeekDayItem[]
  currentWeekAllSessions: any[]
  selectedLayanan?: string
  matchLayanan?: (itemLayanan: string, filter: string) => boolean
  today?: Date
  timeSlots?: string[]
  currentWeekMonday?: Date
  onSelectDate?: (d: Date) => void
}

export default function JadwalMingguanGrid({
  canGoPrevWeek = true,
  goToPrevWeek,
  goToNextWeek,
  weekRangeTitle,
  weekDays,
  currentWeekAllSessions = [],
  timeSlots = [
    "09:00 - 10:00",
    "10:00 - 11:00",
    "13:00 - 14:00",
    "14:30 - 15:30",
    "15:30 - 16:30",
  ],
  currentWeekMonday,
  onSelectDate,
}: JadwalMingguanGridProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mt-6">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Jadwal Mingguan</h2>
      <p className="text-sm text-gray-500 mb-6">
        Lihat ringkasan jadwal sesi Anda yang sudah dibooking dalam satu minggu.
      </p>

      {/* Week Selector */}
      <div className="flex items-center gap-3 text-[13px] font-bold text-gray-800 mb-4">
        <button
          type="button"
          onClick={goToPrevWeek}
          disabled={!canGoPrevWeek}
          aria-label="Minggu Sebelumnya"
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors border border-gray-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
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
        <span className="font-semibold text-gray-900 min-w-[150px] text-center">
          {weekRangeTitle}
        </span>
        <button
          type="button"
          onClick={goToNextWeek}
          aria-label="Minggu Berikutnya"
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors border border-gray-200 cursor-pointer"
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

      {/* Weekly Grid (Grid Asli 6 Kolom) */}
      <div className="w-full border border-gray-200 rounded-xl overflow-x-auto hide-scrollbar">
        <div className="min-w-[720px]">
          {/* Header */}
          <div className="grid grid-cols-6 border-b border-gray-200 bg-gray-50/70">
            {weekDays.map((wd, i) => (
              <div
                key={i}
                onClick={() => {
                  if (onSelectDate && currentWeekMonday) {
                    const targetDate = new Date(currentWeekMonday)
                    targetDate.setDate(currentWeekMonday.getDate() + i)
                    onSelectDate(targetDate)
                  }
                }}
                className={`py-3 flex flex-col items-center justify-center border-r border-gray-200 last:border-0 cursor-pointer hover:bg-purple-50/50 transition-colors ${
                  wd.isSameAsSelected ? "bg-purple-50/80 ring-1 ring-inset ring-[#561269]/20" : ""
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
              const sessions = currentWeekAllSessions.filter((s) => s.date === wd.dateKey)

              return (
                <div
                  key={i}
                  className={`p-2 flex flex-col gap-2 ${
                    wd.isSameAsSelected ? "bg-purple-50/20" : "bg-white"
                  }`}
                >
                  {timeSlots.map((time, slotIdx) => {
                    const booking = sessions.find((s) => s.waktu === time)

                    if (booking && !booking.isAvailableSlot && booking.namaKlien !== "Tersedia") {
                      // Sesi Dibooking Klien (Warna Hijau Sesuai Desain Asli)
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
                              {booking.namaKlien ? `${booking.namaKlien} ` : ""}({booking.metode || "Online"})
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
  )
}
