"use client"

import { Calendar } from "@/components/ui/calendar"
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
  onBooking: (times: string[], metode: "Online" | "Offline" | "Keduanya") => void | Promise<void>
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
    availableSlots,
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
  } = useJadwalAsesmenPicker({
    date,
    bookedSessions,
    onBooking,
    timeSlots,
  })

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Jadwal Sesi</h2>
          <p className="text-sm text-gray-500">
            Atur jadwal sesi konseling Anda dengan mudah. Pilih tanggal dan waktu yang tersedia sesuai dengan preferensi Anda.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {/* Calendar Picker (Left) */}
        <div className="rounded-[20px] border-2 border-[#DCD0E1] shadow-sm p-6 flex flex-col items-center justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onSelectDate}
            fromDate={today}
            disabled={{ before: today }}
            fixedWeeks
            className="w-full max-w-[320px] mx-auto bg-transparent"
          />
        </div>

        {/* Time Picker (Right) */}
        <div className="rounded-[20px] border-2 border-[#DCD0E1] shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 suppressHydrationWarning className="font-bold text-[15px] capitalize">
                {date ? formatFullDateIndonesian(date) : "Pilih Tanggal"}
              </h3>
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-xs font-bold text-[#561269] hover:underline cursor-pointer"
              >
                {selectedTimes.length === availableSlots.length ? "Batal Pilih Semua" : "Pilih Semua"}
              </button>
            </div>

            {/* Pilihan Metode Layanan Asesmen: Online, Offline, atau Keduanya */}
            <JadwalMetodeSelector metode={metode} setMetode={setMetode} />

            <p className="text-xs text-gray-500 mb-3">
              Pilih slot jam yang ingin Anda buka (bisa pilih beberapa sekaligus):
            </p>

            {/* Checkbox List Slot Waktu */}
            <div className="flex flex-col gap-2.5 mb-6">
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

              {/* Opsi Tambahan: Tentukan Jam Kustom Sendiri */}
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
                ? `Buka ${selectedTimes.length} Jam Sesi (${metode}) Sekaligus`
                : isCustomTime
                  ? `Buka Jam Kustom (${metode})`
                  : "Pilih Jam Terlebih Dahulu"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
