"use client"

import { Calendar as CalendarIcon, Sparkles, ChevronDown } from "lucide-react"
import { PilihTanggalBox } from "@/components/shared/PilihTanggalBox"
import { BookedAssessment } from "@/features/konseling/types"
import {
  useJadwalAsesmenPicker,
  formatFullDateIndonesian,
} from "@/features/konseling/hooks/useJadwalAsesmenPicker"
import JadwalMetodeSelector from "./JadwalMetodeSelector"
import JadwalSlotItem from "./JadwalSlotItem"
import JadwalCustomTimeSection from "./JadwalCustomTimeSection"

interface JadwalAsesmenPickerProps {
  date: Date | undefined
  onSelectDate: (newDate: Date | undefined) => void
  bookedSessions?: BookedAssessment[]
  bookingSuccessMsg: string | null
  onBooking: (times: string[], metode: "Online" | "Offline" | "Keduanya", layanan?: string) => void | Promise<void>
  timeSlots?: string[]
}

export default function JadwalAsesmenPicker({
  date,
  onSelectDate,
  bookedSessions = [],
  bookingSuccessMsg,
  onBooking,
  timeSlots,
}: JadwalAsesmenPickerProps) {
  const {
    today,
    metode,
    setMetode,
    selectedLayanan,
    setSelectedLayanan,
    layananOptions,
    availableSlots,
    datesWithSlots,
    selectedTimes,
    DEFAULT_SLOTS,
    toggleTimeSlot,
    toggleSelectAll,
    handleDeleteCustomSlot,
    isCustomTime,
    setIsCustomTime,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    handleAddCustomTime,
    handleBookingClick,
    isFormValid,
    allowedMetode,
    serviceItems,
  } = useJadwalAsesmenPicker({
    date,
    bookedSessions,
    onBooking,
    timeSlots,
  })

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Jadwal Sesi Asesmen</h2>
          <p className="text-sm text-gray-500">
            Atur ketersediaan sesi asesmen klinik. Pilih layanan asesmen, metode pelaksanaan, tentukan tanggal, lalu centang slot jam yang ingin dibuka untuk klien.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl items-stretch">
        {/* Calendar Picker (Left) */}
        <PilihTanggalBox
          date={date}
          setDate={(newDate: Date) => onSelectDate && onSelectDate(newDate)}
          stepNumber={1}
          title="Pilih Tanggal Sesi"
          minDate={today}
          datesWithSlots={datesWithSlots}
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

        {/* Time Picker (Right) */}
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
                {selectedTimes.length === availableSlots.length ? "Batal Pilih Semua" : "Pilih Semua"}
              </button>
            </div>

            {/* Pilihan Layanan Asesmen */}
            <div className="mb-3 bg-purple-50/50 p-3 rounded-2xl border border-[#EDE0F2]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#561269]" />
                  Pilih Layanan Asesmen:
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

            {/* Pilihan Metode Layanan Asesmen: Online, Offline, atau Keduanya */}
            <JadwalMetodeSelector
              metode={metode}
              setMetode={setMetode}
              allowedMetode={allowedMetode}
            />

            {/* Info Helper: Cakupan Layanan Asesmen berdasarkan Metode Terpilih */}
            {selectedLayanan === "Semua Layanan Asesmen" && (
              <div className="mb-3.5 -mt-2 text-[11px] leading-relaxed">
                {(() => {
                  const applicable = serviceItems.filter((s) => {
                    const m = (s.metode || "Online/Offline").toLowerCase()
                    if (metode === "Online") return m.includes("online") || m.includes("keduanya") || m === "semua"
                    if (metode === "Offline") return m.includes("offline") || m.includes("keduanya") || m === "semua"
                    return true
                  })
                  const excluded = serviceItems.filter((s) => {
                    const m = (s.metode || "Online/Offline").toLowerCase()
                    if (metode === "Online") return !m.includes("online") && !m.includes("keduanya") && m !== "semua"
                    if (metode === "Offline") return !m.includes("offline") && !m.includes("keduanya") && m !== "semua"
                    return false
                  })

                  if (excluded.length > 0) {
                    return (
                      <div className="bg-amber-50/90 text-amber-900 border border-amber-200 p-2.5 rounded-xl flex items-start gap-1.5">
                        <span className="shrink-0 text-amber-600 font-bold">ℹ️</span>
                        <span>
                          Slot <strong>{metode}</strong> ini hanya berlaku untuk layanan asesmen yang mendukung {metode}:{" "}
                          <strong className="text-gray-900">{applicable.map((s) => s.nama || s.layanan).join(", ") || "Semua Asesmen Aktif"}</strong>.
                          <br />
                          <span className="text-amber-800/80">
                            Layanan <em>{excluded.map((s) => s.nama || s.layanan).join(", ")}</em> tidak dibuka untuk slot ini karena diatur {metode === "Offline" ? "hanya Online" : "hanya Offline"} oleh Admin.
                          </span>
                        </span>
                      </div>
                    )
                  }

                  return (
                    <div className="text-purple-700 font-medium flex items-center gap-1.5 px-1 py-0.5">
                      <span className="text-purple-600 font-bold">✓</span>
                      <span>
                        Slot <strong>{metode}</strong> ini berlaku untuk seluruh layanan asesmen aktif yang mendukung metode ini.
                      </span>
                    </div>
                  )
                })()}
              </div>
            )}

            <p className="text-xs text-gray-500 mb-3">
              Pilih slot jam yang ingin Anda buka (bisa pilih beberapa sekaligus):
            </p>

            {/* Checkbox List Slot Waktu (Scrollable sama seperti di Website Psikolog) */}
            <div className="flex flex-col gap-2.5 mb-3 max-h-[125px] overflow-y-auto pr-1.5 custom-scrollbar [scrollbar-width:thin] [scrollbar-color:#c4b0cb_#f8fafc] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-purple-200 hover:[&::-webkit-scrollbar-thumb]:bg-purple-300 [&::-webkit-scrollbar-track]:bg-gray-50">
              {availableSlots.map((time, idx) => (
                <JadwalSlotItem
                  key={idx}
                  time={time}
                  date={date}
                  bookedSessions={bookedSessions}
                  isChecked={selectedTimes.includes(time)}
                  isCustom={!DEFAULT_SLOTS.includes(time)}
                  onToggle={() => toggleTimeSlot(time)}
                  onDeleteCustom={() => handleDeleteCustomSlot(time)}
                />
              ))}
            </div>

            {/* Opsi Tambahan: Tentukan Jam Kustom Sendiri (Di luar scroll list agar leluasa) */}
            <div className="mb-4">
              <JadwalCustomTimeSection
                isCustomTime={isCustomTime}
                setIsCustomTime={setIsCustomTime}
                customStart={customStart}
                setCustomStart={setCustomStart}
                customEnd={customEnd}
                setCustomEnd={setCustomEnd}
                onAddCustomTime={handleAddCustomTime}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {bookingSuccessMsg && (
              <p className="text-xs text-emerald-600 font-semibold text-center animate-fadeIn bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                ✓ {bookingSuccessMsg}
              </p>
            )}
            <button
              type="button"
              onClick={handleBookingClick}
              disabled={!isFormValid}
              className={`w-full font-bold py-3.5 rounded-full text-[13px] transition-all ${
                isFormValid
                  ? "bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 cursor-pointer shadow-sm hover:shadow-md active:scale-95"
                  : "bg-[#d6d6d6] text-gray-500 cursor-not-allowed"
              }`}
            >
              {selectedTimes.length > 0
                ? `Buka ${selectedTimes.length} Jam Sesi Asesmen (${metode}) Sekaligus`
                : isCustomTime && customStart && customEnd && customEnd > customStart
                  ? `Buka Jam Kustom: ${customStart} - ${customEnd} (${metode})`
                  : isCustomTime
                    ? "Tentukan Jam Mulai & Selesai Dulu"
                    : "Pilih Jam Terlebih Dahulu"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
