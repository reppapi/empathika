"use client"

import { BookedAssessment } from "@/features/konseling/types"
import { formatDateKey, parseTimeRangeMinutes } from "@/features/konseling/data/jadwalAdminData"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

interface WeekDayItem {
  dayName: string
  dateKey: string
  dateLabel: string
  isSameAsSelected: boolean
}

interface JadwalMingguanGridProps {
  canGoPrevWeek: boolean
  isCurrentWeek?: boolean
  goToCurrentWeek?: () => void
  goToPrevWeek: () => void
  goToNextWeek: () => void
  weekRangeTitle: string
  weekDays: WeekDayItem[]
  currentWeekAllSessions: BookedAssessment[]
  selectedLayanan: string
  matchLayanan: (itemLayanan: string, filter: string) => boolean
  today: Date
  onSelectSession?: (session: BookedAssessment) => void
  onRemoveSlot?: (time: string, dateKey?: string) => void
  isLoading?: boolean
}

export default function JadwalMingguanGrid({
  canGoPrevWeek,
  isCurrentWeek = true,
  goToCurrentWeek,
  goToPrevWeek,
  goToNextWeek,
  weekRangeTitle,
  weekDays,
  currentWeekAllSessions,
  selectedLayanan,
  matchLayanan,
  today,
  onSelectSession,
  onRemoveSlot,
  isLoading = false,
}: JadwalMingguanGridProps) {
  const todayDateKey = formatDateKey(today)

  return (
    <div className="mt-8 bg-white border border-gray-100 shadow-sm rounded-2xl p-6 sm:p-8 font-poppins">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Jadwal Mingguan</h2>
      <p className="text-gray-500 text-sm mb-6">
        Lihat ringkasan sesi yang telah dibooking oleh klien dalam satu minggu
      </p>

      {/* Week Selector */}
      <div className="flex items-center gap-3 text-[13px] font-bold text-gray-800 mb-4">
        <button
          type="button"
          onClick={goToPrevWeek}
          disabled={!canGoPrevWeek}
          aria-label="Minggu Sebelumnya"
          title={canGoPrevWeek ? "Minggu Sebelumnya" : "Batas riwayat maksimal 3 bulan ke belakang"}
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
        {!isCurrentWeek && goToCurrentWeek && (
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
          {/* Header */}
          <div className="sticky top-0 z-10 grid grid-cols-7 border-b border-gray-200 bg-gray-50/95 backdrop-blur-xs shadow-2xs">
            {weekDays.map((wd, i) => (
              <div
                key={i}
                className={`py-3 flex flex-col items-center justify-center border-r border-gray-200 last:border-0 ${wd.isSameAsSelected ? "bg-purple-50/80 ring-1 ring-inset ring-[#561269]/20" : ""
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
          <div className="grid grid-cols-7 min-h-[360px] divide-x divide-gray-200">
            {weekDays.map((wd, i) => {
              const sessions = currentWeekAllSessions
                .filter((s) => {
                  const isUnbooked =
                    s.isAvailableSlot ||
                    s.status === "Tersedia" ||
                    !s.namaKlien ||
                    s.namaKlien.trim().toLowerCase() === "tersedia" ||
                    s.layanan === "Slot Tersedia" ||
                    s.layanan === "Slot Asesmen" ||
                    s.layanan === "Asesmen Tersedia"
                  const isCancelled = !isUnbooked && (s.status === "Dibatalkan" || (s as any).isCancelled)
                  return (
                    !isUnbooked &&
                    !isCancelled &&
                    s.date === wd.dateKey &&
                    matchLayanan(s.layanan, selectedLayanan)
                  )
                })
                .sort((a, b) => a.waktu.localeCompare(b.waktu))

              const isTodayColumn = wd.dateKey === todayDateKey
              const isPastDay = wd.dateKey < todayDateKey

              return (
                <div
                  key={i}
                  className={`p-2 flex flex-col gap-2 ${isTodayColumn
                    ? "bg-purple-50/25 ring-1 ring-inset ring-[#561269]/20"
                    : isPastDay
                      ? "bg-gray-50/40"
                      : "bg-white"
                    }`}
                >
                  {isLoading && currentWeekAllSessions.length === 0 ? (
                    <div className="flex flex-col gap-2 animate-pulse py-1">
                      <div className="h-16 bg-gray-200/60 rounded-xl" />
                      <div className="h-14 bg-gray-100/70 rounded-xl" />
                    </div>
                  ) : sessions.length > 0 ? (
                    sessions.map((item) => {
                      const isUnbooked =
                        item.isAvailableSlot ||
                        item.status === "Tersedia" ||
                        !item.namaKlien ||
                        item.namaKlien.trim().toLowerCase() === "tersedia" ||
                        item.layanan === "Slot Tersedia" ||
                        item.layanan === "Slot Asesmen" ||
                        item.layanan === "Asesmen Tersedia"
                      const isCancelled = !isUnbooked && (item.status === "Dibatalkan" || (item as any).isCancelled)
                      const isRescheduled = !isUnbooked && (item.status === "Reschedule" || Boolean(item.isRescheduled))

                      const isAsesmen =
                        (item.layanan && item.layanan.toLowerCase().includes("asesmen")) ||
                        Boolean((item as any).tipe_jadwal && (item as any).tipe_jadwal.toUpperCase() === "ASESMEN")

                      const showPsikolog =
                        !isAsesmen &&
                        Boolean(
                          item.psikolog &&
                          item.psikolog.trim() !== "" &&
                          item.psikolog !== "Admin Asesmen" &&
                          item.psikolog !== "Asesor Klinis Empathika" &&
                          item.psikolog !== "Belum Ditentukan"
                        )

                      const { startMinutes, endMinutes } = parseTimeRangeMinutes(item.waktu)
                      const now = new Date()
                      const currentMinutes = now.getHours() * 60 + now.getMinutes()

                      // Jika unbooked slot, jika jam mulai sudah tiba/lewat hari ini atau tanggal lampau -> sudah lewat
                      // Jika booked session, jika jam selesai sudah tiba/lewat hari ini atau tanggal lampau -> sudah selesai
                      const isPastTime =
                        item.date < todayDateKey ||
                        (item.date === todayDateKey && (
                          isUnbooked
                            ? (startMinutes > 0 && currentMinutes >= startMinutes)
                            : (endMinutes > 0 && currentMinutes >= endMinutes)
                        ))

                      const isSelesai =
                        item.status === "Selesai" ||
                        item.status === "COMPLETED" ||
                        (!isUnbooked && isPastTime)

                      // 1. DIBATALKAN (Jika dibatalkan dan tidak ada klien aktif, hapus keterangannya dan jangan render kartu)
                      if (isCancelled) {
                        return null
                      }

                      // 2. RESCHEDULE
                      if (isRescheduled) {
                        return (
                          <div
                            key={item.id}
                            onClick={() => onSelectSession && onSelectSession(item)}
                            className="rounded-xl p-2.5 flex flex-col gap-1.5 shadow-2xs transition-all cursor-pointer hover:shadow-md hover:scale-[1.01] bg-amber-50/85 border border-amber-300 text-gray-700 overflow-hidden"
                          >
                            <div className="flex items-center justify-between gap-1 flex-wrap">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="w-2 h-2 rounded-full shrink-0 bg-amber-500" />
                                <span className="text-[11px] sm:text-xs font-bold text-amber-800 line-through whitespace-nowrap">
                                  {item.waktu}
                                </span>
                              </div>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                                Reschedule
                              </span>
                            </div>
                            <p className="text-xs font-bold leading-tight mt-0.5 text-gray-700 line-through line-clamp-1">
                              {item.layanan}
                            </p>
                            <div className="text-[10px] flex flex-col mt-0.5 leading-tight text-gray-600 gap-0.5">
                              {item.namaKlien && (
                                <span className="truncate">
                                  Klien: <strong className="text-gray-700 line-through">{item.namaKlien}</strong>
                                </span>
                              )}
                              {showPsikolog && <span className="truncate">Tenaga: {item.psikolog}</span>}
                              <span className="text-[9px] text-amber-700 italic">
                                [{item.metode}]
                              </span>
                            </div>
                          </div>
                        )
                      }

                      // 3. UNBOOKED (SLOT TERSEDIA DIBUKA TAPI TIDAK ADA YANG BOOKING)
                      if (isUnbooked) {
                        // Kalau jamnya sudah lewat dan tidak ada yang booking -> DIABUIN
                        if (isPastTime) {
                          return (
                            <div
                              key={item.id}
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
                                {onRemoveSlot && isAsesmen && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      onRemoveSlot(item.waktu, item.date)
                                    }}
                                    title="Hapus slot asesmen ini dari jadwal"
                                    className="text-gray-400 hover:text-rose-600 p-0.5 rounded hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>

                              {/* Baris 3: Judul Slot */}
                              <p className="text-xs font-bold leading-tight mt-0.5 text-gray-700 line-clamp-2">
                                {isAsesmen ? "Slot Asesmen (Lewat)" : "Slot Tersedia (Tidak Terpakai)"}
                              </p>

                              {/* Baris 4: Metode & Keterangan */}
                              <div className="flex flex-col gap-0.5 text-[10px] text-gray-500 min-w-0">
                                <div className="flex items-center justify-between gap-1 min-w-0">
                                  {item.metode && (
                                    <span className="font-medium text-gray-600 bg-gray-200/80 px-1.5 py-0.5 rounded text-[9px] shrink-0">
                                      {item.metode}
                                    </span>
                                  )}
                                  <span className="italic text-gray-400 truncate text-[9px] min-w-0">Tidak terpakai</span>
                                </div>
                                {showPsikolog && <span className="truncate min-w-0">Tenaga: {item.psikolog}</span>}
                              </div>
                            </div>
                          )
                        }

                        // Slot Tersedia di Masa Depan (Masih Terbuka untuk Booking)
                        return (
                          <div
                            key={item.id}
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
                              {onRemoveSlot && isAsesmen && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    onRemoveSlot(item.waktu, item.date)
                                  }}
                                  title="Hapus slot asesmen ini dari jadwal"
                                  className="text-gray-400 hover:text-rose-600 p-0.5 rounded hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            {/* Baris 3: Judul Slot */}
                            <p className="text-xs font-bold leading-tight mt-0.5 text-purple-950 line-clamp-1">
                              {isAsesmen ? "Slot Asesmen" : "Slot Tersedia"}
                            </p>

                            {/* Baris 4: Metode & Keterangan Tersedia */}
                            <div className="flex flex-col gap-0.5 text-[10px] min-w-0">
                              <div className="flex items-center justify-between gap-1 min-w-0">
                                {item.metode && (
                                  <span className="text-[9px] font-medium text-purple-700 bg-purple-100/70 px-1.5 py-0.5 rounded shrink-0">
                                    {item.metode}
                                  </span>
                                )}
                                <span className="italic text-purple-600/80 font-medium truncate text-[9px] min-w-0">Tersedia</span>
                              </div>
                              {showPsikolog && <span className="truncate min-w-0">Tenaga: {item.psikolog}</span>}
                            </div>
                          </div>
                        )
                      }

                      // 3. SESI KLIEN (SUDAH DIBOOKING)
                      return (
                        <div
                          key={item.id}
                          onClick={() => onSelectSession && onSelectSession(isSelesai ? { ...item, status: "Selesai" } : item)}
                          className={`rounded-xl p-2.5 flex flex-col gap-1.5 shadow-xs transition-all cursor-pointer hover:shadow-md hover:scale-[1.01] overflow-hidden ${isSelesai
                              ? "bg-gray-100/85 border border-gray-200/90 text-gray-500"
                              : "bg-[#E8F3ED] border border-[#b4d6be]"
                            }`}
                        >
                          <div className="flex items-center justify-between gap-1 flex-wrap">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${isSelesai ? "bg-gray-400" : "bg-green-600"
                                  }`}
                              />
                              <span
                                className={`text-[11px] sm:text-xs font-bold whitespace-nowrap ${isSelesai
                                    ? "text-gray-600"
                                    : "text-[#185e26]"
                                  }`}
                              >
                                {item.waktu}
                              </span>
                            </div>
                            {isSelesai ? (
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 shrink-0">
                                Selesai
                              </span>
                            ) : item.metode ? (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white text-[#185e26] border border-[#b4d6be] shadow-2xs shrink-0">
                                {item.metode}
                              </span>
                            ) : null}
                          </div>
                          <p
                            className={`text-xs font-bold leading-tight mt-0.5 line-clamp-1 ${isSelesai ? "text-gray-700" : "text-gray-900"
                              }`}
                          >
                            {item.layanan}
                          </p>
                          <div
                            className={`text-[10px] flex flex-col mt-0.5 leading-tight gap-0.5 ${isSelesai ? "text-gray-500" : "text-gray-600"
                              }`}
                          >
                            {item.namaKlien && (
                              <span className="truncate">
                                Klien:{" "}
                                <strong className={isSelesai ? "text-gray-700" : "text-gray-800"}>
                                  {item.namaKlien}
                                </strong>
                              </span>
                            )}
                            {showPsikolog && <span className="truncate">Tenaga: {item.psikolog}</span>}
                            {isSelesai && item.metode && (
                              <span className="text-[9px] text-gray-400 italic">
                                [{item.metode}]
                              </span>
                            )}
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
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="text-xs font-bold text-amber-800">Sesi Reschedule</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
          <span className="text-xs font-bold text-gray-500">Sesi Selesai / Lewat (Riwayat Masa Lalu)</span>
        </div>
        <span className="text-[11px] text-gray-400">
          * Jadwal mingguan hanya menampilkan sesi konsultasi dan asesmen yang telah dibooking oleh klien.
        </span>
      </div>
    </div>
  )
}
