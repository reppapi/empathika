"use client"

import { BookedAssessment } from "@/features/konseling/types"
import { formatDateKey } from "@/features/konseling/data/jadwalAdminData"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface WeekDayItem {
  dayName: string
  dateKey: string
  dateLabel: string
  isSameAsSelected: boolean
}

interface JadwalMingguanGridProps {
  canGoPrevWeek: boolean
  goToPrevWeek: () => void
  goToNextWeek: () => void
  weekRangeTitle: string
  weekDays: WeekDayItem[]
  currentWeekAllSessions: BookedAssessment[]
  selectedLayanan: string
  matchLayanan: (itemLayanan: string, filter: string) => boolean
  today: Date
  onSelectSession?: (session: BookedAssessment) => void
}

export default function JadwalMingguanGrid({
  canGoPrevWeek,
  goToPrevWeek,
  goToNextWeek,
  weekRangeTitle,
  weekDays,
  currentWeekAllSessions,
  selectedLayanan,
  matchLayanan,
  today,
  onSelectSession,
}: JadwalMingguanGridProps) {
  const todayDateKey = formatDateKey(today)

  return (
    <div className="mt-8 bg-white border border-gray-100 shadow-sm rounded-2xl p-6 sm:p-8 font-poppins">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Jadwal Mingguan</h2>
      <p className="text-gray-500 text-sm mb-6">
        Lihat ringkasan layanan yang telah dibooking oleh klien dalam satu minggu (klik sesi untuk melihat opsi pembatalan)
      </p>

      {/* Week Selector */}
      <div className="flex items-center gap-3 text-[13px] font-bold text-gray-800 mb-4">
        <button
          type="button"
          onClick={goToPrevWeek}
          disabled={!canGoPrevWeek}
          aria-label="Minggu Sebelumnya"
          title={canGoPrevWeek ? "Minggu Sebelumnya" : "Batas riwayat maksimal 4 minggu ke belakang"}
          className={`p-1.5 rounded-full transition-colors border border-gray-200 ${canGoPrevWeek
              ? "hover:bg-gray-100 text-gray-600 cursor-pointer"
              : "opacity-30 text-gray-300 cursor-not-allowed bg-gray-50"
            }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-semibold text-gray-900 min-w-[160px] text-center">
          {weekRangeTitle}
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
              const sessions = currentWeekAllSessions
                .filter((s) => s.date === wd.dateKey && matchLayanan(s.layanan, selectedLayanan))
                .sort((a, b) => a.waktu.localeCompare(b.waktu))

              const isTodayColumn = wd.dateKey === todayDateKey
              const isPastDay = wd.dateKey < todayDateKey

              return (
                <div
                  key={i}
                  className={`p-2.5 flex flex-col gap-2.5 ${isTodayColumn
                      ? "bg-purple-50/25 ring-1 ring-inset ring-[#561269]/20"
                      : isPastDay
                        ? "bg-gray-50/40"
                        : "bg-white"
                    }`}
                >
                  {sessions.length > 0 ? (
                    sessions.map((item) => {
                      const isPast = item.date < todayDateKey
                      const isCancelled = item.status === "Dibatalkan" || (item as any).isCancelled

                      return (
                        <div
                          key={item.id}
                          onClick={() => onSelectSession && onSelectSession(item)}
                          className={`rounded-xl p-3 flex flex-col gap-1 shadow-xs transition-all cursor-pointer hover:shadow-md hover:scale-[1.01] ${
                            isCancelled
                              ? "bg-rose-50/80 border border-rose-200/90 text-gray-600 opacity-90"
                              : isPast
                              ? "bg-gray-100/85 border border-gray-200/90 text-gray-500"
                              : "bg-[#E8F3ED] border border-[#b4d6be]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  isCancelled ? "bg-rose-500" : isPast ? "bg-gray-400" : "bg-green-600"
                                }`}
                              />
                              <span
                                className={`text-xs font-extrabold ${
                                  isCancelled
                                    ? "text-rose-700 line-through"
                                    : isPast
                                    ? "text-gray-600"
                                    : "text-[#185e26]"
                                }`}
                              >
                                {item.waktu}
                              </span>
                            </div>
                            {isCancelled ? (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                                Dibatalkan
                              </span>
                            ) : isPast ? (
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">
                                Selesai
                              </span>
                            ) : null}
                          </div>
                          <p
                            className={`text-xs font-bold leading-tight mt-0.5 ${
                              isCancelled ? "text-gray-700 line-through" : isPast ? "text-gray-700" : "text-gray-900"
                            }`}
                          >
                            {item.layanan}
                          </p>
                          <div
                            className={`text-[10px] flex flex-col mt-0.5 leading-tight ${
                              isPast ? "text-gray-500" : "text-gray-600"
                            }`}
                          >
                            {item.namaKlien && (
                              <span>
                                Klien:{" "}
                                <strong className={isPast ? "text-gray-700" : "text-gray-800"}>
                                  {item.namaKlien}
                                </strong>
                              </span>
                            )}
                            {item.psikolog && (
                              <span>Tenaga: {item.psikolog}</span>
                            )}
                            <span className="text-[9px] text-gray-400 italic mt-0.5">
                              [{item.metode}]
                            </span>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="h-full flex items-center justify-center py-16">
                      <span className="text-xs text-gray-300 italic select-none">
                        Tidak ada jadwal
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-6 ml-1 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-green-600"></span>
          <span className="text-xs font-bold text-gray-700">Sesi Aktif / Terjadwal</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
          <span className="text-xs font-bold text-gray-500">Sesi Selesai (Riwayat Masa Lalu)</span>
        </div>
        <span className="text-[11px] text-gray-400">
          * Riwayat sesi masa lalu dapat diakses hingga 4 minggu ke belakang. Sesi minggu berikutnya muncul bila ada pemesanan (booking).
        </span>
      </div>
    </div>
  )
}
