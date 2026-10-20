"use client"

import { useState, useEffect, useMemo } from "react"
import { Calendar } from "@/components/ui/calendar"
import { BookedAssessment } from "@/features/konseling/types"
import { formatDateKey } from "@/features/konseling/data/jadwalAdminData"

interface JadwalAsesmenPickerProps {
  date: Date | undefined
  onSelectDate: (newDate: Date | undefined) => void
  bookedSessions?: BookedAssessment[]
  bookingSuccessMsg: string | null
  onBooking: (times: string[]) => void
  timeSlots?: string[]
}

function formatFullDateIndonesian(d: Date): string {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ]
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

export default function JadwalAsesmenPicker({
  date,
  onSelectDate,
  bookedSessions = [],
  bookingSuccessMsg,
  onBooking,
  timeSlots = [
    "09:00 - 10:00",
    "10:00 - 11:00",
    "13:00 - 14:00",
    "14:30 - 15:30",
    "15:30 - 16:30",
  ],
}: JadwalAsesmenPickerProps) {
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  // Multi-select slot jam & jam kustom
  const [selectedTimes, setSelectedTimes] = useState<string[]>([])
  const [isCustomTime, setIsCustomTime] = useState(false)
  const [customStart, setCustomStart] = useState("")
  const [customEnd, setCustomEnd] = useState("")

  // Reset pilihan centang saat tanggal berganti
  useEffect(() => {
    setSelectedTimes([])
    setIsCustomTime(false)
    setCustomStart("")
    setCustomEnd("")
  }, [date])

  const toggleTimeSlot = (time: string) => {
    setSelectedTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    )
  }

  const toggleSelectAll = () => {
    if (selectedTimes.length === timeSlots.length) {
      setSelectedTimes([])
    } else {
      setSelectedTimes([...timeSlots])
    }
  }

  const handleBookingClick = () => {
    const timesToBook = [...selectedTimes]
    if (isCustomTime && customStart && customEnd) {
      const customFormatted = `${customStart} - ${customEnd}`
      if (!timesToBook.includes(customFormatted)) {
        timesToBook.push(customFormatted)
      }
    }
    if (timesToBook.length > 0) {
      onBooking(timesToBook)
      setSelectedTimes([])
      setIsCustomTime(false)
      setCustomStart("")
      setCustomEnd("")
    }
  }

  const isFormValid = selectedTimes.length > 0 || (isCustomTime && customStart && customEnd)

  return (
    <div className="mt-8 bg-white border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] rounded-3xl p-6 sm:p-8 font-poppins">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Jadwal Asesmen</h2>
        <p className="text-gray-500 text-sm">
          Atur jadwal Asesmen, pilih tanggal dan tentukan beberapa slot waktu sekaligus.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl">
        {/* Left: Date Picker Box */}
        <div className="rounded-[20px] border-2 border-[#DCD0E1] shadow-sm p-6 flex flex-col items-center justify-center bg-[#FAF8FB]/30">
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

        {/* Right: Time Slots Box (Multi-Select & Jam Kustom) */}
        <div className="rounded-[20px] border-2 border-[#DCD0E1] shadow-sm p-6 flex flex-col justify-between">
          <div>
            {/* Header: Tanggal Terpilih + Tombol Pilih Semua */}
            <div className="flex items-center justify-between mb-4">
              <h3 suppressHydrationWarning className="font-bold text-[15px] text-gray-900 capitalize">
                {date ? formatFullDateIndonesian(date) : "Pilih Tanggal"}
              </h3>
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-xs font-bold text-[#561269] hover:underline cursor-pointer"
              >
                {selectedTimes.length === timeSlots.length ? "Batal Pilih Semua" : "Pilih Semua"}
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-3">
              Pilih slot jam yang ingin Anda tentukan (bisa pilih beberapa sekaligus):
            </p>

            {/* List Checkbox Slot Waktu */}
            <div className="flex flex-col gap-2.5 mb-6">
              {timeSlots.map((time, idx) => {
                const isChecked = selectedTimes.includes(time)
                const isAlreadyBooked = date
                  ? bookedSessions.some(
                      (s) => s.date === formatDateKey(date) && s.waktu === time
                    )
                  : false

                return (
                  <label
                    key={idx}
                    className={`flex items-center justify-between border rounded-xl px-4 py-2.5 cursor-pointer transition-all ${
                      isChecked
                        ? "border-[#561269] bg-purple-50/70 shadow-2xs"
                        : isAlreadyBooked
                        ? "border-emerald-300 bg-emerald-50/40"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleTimeSlot(time)}
                        className="w-4 h-4 text-[#561269] focus:ring-[#561269] rounded border-gray-300 cursor-pointer"
                      />
                      <span
                        className={`text-[13px] font-medium ${
                          isChecked ? "text-[#561269] font-bold" : "text-gray-700"
                        }`}
                      >
                        {time}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isAlreadyBooked && !isChecked && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                          Sudah Ada Sesi
                        </span>
                      )}
                      {isChecked && (
                        <span className="text-[11px] font-semibold text-[#561269] bg-purple-100/80 px-2.5 py-0.5 rounded-full">
                          Dipilih
                        </span>
                      )}
                    </div>
                  </label>
                )
              })}

              {/* Opsi Tambahan: Tentukan Jam Kustom Sendiri */}
              <div
                className={`border rounded-xl px-4 py-2.5 transition-colors cursor-pointer ${
                  isCustomTime
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
                  <div className="flex items-center gap-2 pl-7 pt-2.5">
                    <div className="flex-1">
                      <span className="text-[10px] text-gray-500 font-semibold block mb-1">
                        Jam Mulai
                      </span>
                      <input
                        type="time"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="w-full text-xs font-semibold p-1.5 rounded border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#561269]"
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
                        className="w-full text-xs font-semibold p-1.5 rounded border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#561269]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Area: Pesan Sukses & Tombol Action */}
          <div className="flex flex-col gap-2 mt-4">
            {bookingSuccessMsg && (
              <p className="text-xs text-emerald-600 font-semibold text-center animate-fadeIn bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                ✓ {bookingSuccessMsg}
              </p>
            )}
            <button
              type="button"
              onClick={handleBookingClick}
              disabled={!isFormValid}
              className={`w-full font-bold py-3.5 rounded-full text-[13px] transition-all transform active:scale-98 ${
                isFormValid
                  ? "bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 cursor-pointer shadow-sm hover:shadow-md"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {selectedTimes.length > 0
                ? `Tentukan ${selectedTimes.length} Jadwal Asesmen Sekaligus`
                : isCustomTime
                ? "Tentukan Jam Kustom"
                : "Pilih Minimal 1 Slot Jam"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
