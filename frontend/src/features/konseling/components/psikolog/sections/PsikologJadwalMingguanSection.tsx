"use client"

import React from "react"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { BookedSession } from "../types"
import { formatDateKey } from "../utils/psikologDateUtils"
import { PsikologJadwalSlotCard } from "./PsikologJadwalSlotCard"

interface WeekDayItem {
  dayName: string
  dateLabel: string
  dateKey: string
  isSameAsSelected: boolean
}

interface PsikologJadwalMingguanSectionProps {
  weekRangeLabel: string
  canGoPrevWeek: boolean
  canGoNextWeek: boolean
  isCurrentWeek: boolean
  goToPrevWeek: () => void
  goToNextWeek: () => void
  goToCurrentWeek: () => void
  weekDays: WeekDayItem[]
  currentWeekMonday: Date
  today: Date
  bookedSessions: BookedSession[]
  handleSelectDate: (targetDate: Date) => void
  handleSelectDetailSession: (session: BookedSession) => void
  handleCancelClientBooking: (session: BookedSession) => void
  handleRemoveSlot: (time: string, dateKey: string) => void
}

export function PsikologJadwalMingguanSection({
  weekRangeLabel,
  canGoPrevWeek,
  canGoNextWeek,
  isCurrentWeek,
  goToPrevWeek,
  goToNextWeek,
  goToCurrentWeek,
  weekDays,
  currentWeekMonday,
  today,
  bookedSessions,
  handleSelectDate,
  handleSelectDetailSession,
  handleCancelClientBooking,
  handleRemoveSlot,
}: PsikologJadwalMingguanSectionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Jadwal Mingguan</h2>
      <p className="text-sm text-gray-500 mb-6">
        Lihat ringkasan jadwal sesi konseling yang telah dibooking oleh klien dan slot yang Anda buka
        dalam satu minggu.
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
      <div className="overflow-x-auto border border-gray-200 rounded-xl admin-table-scrollbar">
        <div className="w-full min-w-[780px] md:min-w-full max-h-[365px] overflow-y-auto admin-table-scrollbar">
          {/* Header Baris Hari */}
          <div className="sticky top-0 z-10 grid grid-cols-7 border-b border-gray-200 bg-gray-50/95 backdrop-blur-xs shadow-2xs">
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
                  } ${
                    wd.isSameAsSelected
                      ? "bg-purple-50/80 ring-1 ring-inset ring-[#561269]/20"
                      : ""
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
                    !(s.layanan || "").toLowerCase().includes("asesmen")
                )
                .sort((a, b) => a.waktu.localeCompare(b.waktu))

              const isTodayColumn = wd.dateKey === formatDateKey(today)

              return (
                <div
                  key={i}
                  className={`p-2 flex flex-col gap-2 ${
                    isTodayColumn
                      ? "bg-purple-50/25 ring-1 ring-inset ring-[#561269]/20"
                      : wd.isSameAsSelected
                      ? "bg-purple-50/10"
                      : "bg-white"
                  }`}
                >
                  {sessions.length > 0 ? (
                    sessions.map((item, idx) => (
                      <PsikologJadwalSlotCard
                        key={item.id || idx}
                        item={item}
                        dateKey={wd.dateKey}
                        onSelectDetailSession={handleSelectDetailSession}
                        onCancelClientBooking={handleCancelClientBooking}
                        onRemoveSlot={handleRemoveSlot}
                      />
                    ))
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
                        <CalendarIcon
                          className={`w-5 h-5 text-gray-300 mb-1 transition-colors ${
                            isPastDay ? "" : "group-hover:text-purple-400"
                          }`}
                        />
                        <span
                          className={`text-[11px] font-medium text-gray-400 transition-colors ${
                            isPastDay ? "" : "group-hover:text-purple-700"
                          }`}
                        >
                          Tidak ada jadwal
                        </span>
                        <span
                          className={`text-[10px] text-gray-300 mt-0.5 transition-colors ${
                            isPastDay ? "" : "group-hover:text-purple-500"
                          }`}
                        >
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
          <span className="text-xs font-medium text-gray-500">
            Sesi Selesai / Lewat (Riwayat Masa Lalu)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded border border-dashed border-gray-400 bg-gray-50" />
          <span className="text-xs font-medium text-gray-500">Hari Kosong</span>
        </div>
      </div>
    </div>
  )
}
