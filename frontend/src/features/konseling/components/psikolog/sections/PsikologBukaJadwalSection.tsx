"use client"

import React from "react"
import { PilihTanggalBox } from "@/components/shared/PilihTanggalBox"
import {
  Calendar as CalendarIcon,
  Video,
  Building2,
  Layers,
  Sparkles,
  ChevronDown,
  X,
  Trash2,
  CheckCircle2,
} from "lucide-react"
import {
  BookedSession,
  MetodeKonsultasi,
  DEFAULT_TIME_SLOTS,
} from "../types"
import {
  formatDateKey,
  formatFullDateIndonesian,
} from "../utils/psikologDateUtils"
import { findOriginalRescheduledRecord } from "@/features/konseling/utils/cancellationSync"

interface PsikologBukaJadwalSectionProps {
  date: Date | undefined
  handleSelectDate: (d: Date) => void
  today: Date
  datesWithSchedules: Date[]
  activePsikolog: { id: string; nama_gelar: string; kategori?: string; account?: any } | null
  selectedLayanan: string
  setSelectedLayanan: (l: string) => void
  layananOptions: string[]
  selectedMetode: MetodeKonsultasi
  setSelectedMetode: (m: MetodeKonsultasi) => void
  allowedMetode: { online: boolean; offline: boolean; both: boolean }
  timeSlots: string[]
  setTimeSlots: React.Dispatch<React.SetStateAction<string[]>>
  selectedTimes: string[]
  setSelectedTimes: React.Dispatch<React.SetStateAction<string[]>>
  toggleTimeSlot: (time: string) => void
  toggleSelectAll: () => void
  isCustomTime: boolean
  setIsCustomTime: (val: boolean) => void
  customStart: string
  setCustomStart: (val: string) => void
  customEnd: string
  setCustomEnd: (val: string) => void
  setDeletedCustomSlots: React.Dispatch<React.SetStateAction<string[]>>
  handleRemoveSlot: (time: string) => void
  handleDeleteCustomTimeSlot: (time: string) => void
  bookedSessions: BookedSession[]
  isCurrentPsikolog: (s: BookedSession) => boolean
  handleBooking: () => void
  bookingSuccessMsg: string | null
}

export function PsikologBukaJadwalSection({
  date,
  handleSelectDate,
  today,
  datesWithSchedules,
  activePsikolog,
  selectedLayanan,
  setSelectedLayanan,
  layananOptions,
  selectedMetode,
  setSelectedMetode,
  allowedMetode,
  timeSlots,
  setTimeSlots,
  selectedTimes,
  setSelectedTimes,
  toggleTimeSlot,
  toggleSelectAll,
  isCustomTime,
  setIsCustomTime,
  customStart,
  setCustomStart,
  customEnd,
  setCustomEnd,
  setDeletedCustomSlots,
  handleRemoveSlot,
  handleDeleteCustomTimeSlot,
  bookedSessions,
  isCurrentPsikolog,
  handleBooking,
  bookingSuccessMsg,
}: PsikologBukaJadwalSectionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Jadwal Sesi Asesmen</h2>
          <p className="text-sm text-gray-500">
            Atur ketersediaan sesi konseling Anda. Pilih metode konsultasi, tentukan tanggal, lalu centang slot jam yang ingin dibuka untuk klien.
          </p>
        </div>
        {activePsikolog && (
          <div className="flex items-center gap-3 bg-gradient-to-r from-[#FAF5FD] to-[#F5EDF9] border border-purple-200/90 rounded-2xl px-4 py-2.5 shrink-0 shadow-2xs w-full sm:w-auto">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-stretch">
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
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-bold transition-all ${!allowedMetode.online
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
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-bold transition-all ${!allowedMetode.offline
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
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-bold transition-all ${!allowedMetode.both
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
            <div className="flex flex-col gap-2.5 mb-3 max-h-[125px] overflow-y-auto pr-1.5 custom-scrollbar [scrollbar-width:thin] [scrollbar-color:#c4b0cb_#f8fafc] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-purple-200 hover:[&::-webkit-scrollbar-thumb]:bg-purple-300 [&::-webkit-scrollbar-track]:bg-gray-50">
              {timeSlots.map((time, idx) => {
                const isChecked = selectedTimes.includes(time)

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

            {/* Opsi Tambahan: Tentukan Jam Kustom Sendiri */}
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
  )
}
