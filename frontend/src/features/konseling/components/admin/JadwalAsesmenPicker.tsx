"use client"

import { useState, useEffect, useMemo } from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { PilihTanggalBox } from "@/components/shared/PilihTanggalBox"
import { BookedAssessment } from "@/features/konseling/types"
import { formatDateKey } from "@/features/konseling/data/jadwalAdminData"
import { Video, Building2, Layers, Trash2 } from "lucide-react"

interface JadwalAsesmenPickerProps {
  date: Date | undefined
  onSelectDate: (newDate: Date | undefined) => void
  bookedSessions?: BookedAssessment[]
  bookingSuccessMsg: string | null
  onBooking: (times: string[], metode: "Online" | "Offline" | "Keduanya") => void | Promise<void>
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
  const DEFAULT_SLOTS = useMemo(
    () => [
      "09:00 - 10:00",
      "10:00 - 11:00",
      "13:00 - 14:00",
      "14:30 - 15:30",
      "15:30 - 16:30",
    ],
    []
  )

  const [availableSlots, setAvailableSlots] = useState<string[]>(timeSlots)
  const [deletedCustomSlots, setDeletedCustomSlots] = useState<string[]>([])

  useEffect(() => {
    setAvailableSlots((prev) => {
      const merged = new Set([...DEFAULT_SLOTS, ...timeSlots, ...prev])
      bookedSessions.forEach((s) => {
        if (s.waktu) merged.add(s.waktu)
      })
      const filtered = Array.from(merged).filter((t) => !deletedCustomSlots.includes(t))
      return filtered.sort()
    })
  }, [timeSlots, bookedSessions, deletedCustomSlots, DEFAULT_SLOTS])

  const handleDeleteCustomSlot = (timeToRemove: string) => {
    setDeletedCustomSlots((prev) => [...prev, timeToRemove])
    setAvailableSlots((prev) => prev.filter((t) => t !== timeToRemove))
    setSelectedTimes((prev) => prev.filter((t) => t !== timeToRemove))
  }

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  // Indikator tanggal yang memiliki slot / sesi aktif
  const datesWithSlots = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

    const dates: Date[] = []
    const dateSet = new Set<string>()
    bookedSessions.forEach((s) => {
      if (s.date && s.date >= todayKey && s.status !== "Dibatalkan") {
        dateSet.add(s.date)
      }
    })
    dateSet.forEach((dateStr) => {
      const parts = dateStr.split("-").map(Number)
      if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
        const d = new Date(parts[0], parts[1] - 1, parts[2])
        d.setHours(0, 0, 0, 0)
        if (d >= today) {
          dates.push(d)
        }
      }
    })
    return dates
  }, [bookedSessions])

  // Pilihan metode sesi: Online (Zoom), Offline (Klinik), atau Keduanya
  const [metode, setMetode] = useState<"Online" | "Offline" | "Keduanya">("Online")

  // Multi-select slot jam & jam kustom
  const [selectedTimes, setSelectedTimes] = useState<string[]>([])
  const [isCustomTime, setIsCustomTime] = useState(false)
  const [customStart, setCustomStart] = useState("08:00")
  const [customEnd, setCustomEnd] = useState("09:00")

  // Reset pilihan centang saat tanggal berganti
  useEffect(() => {
    setSelectedTimes([])
    setIsCustomTime(false)
  }, [date])

  const toggleTimeSlot = (time: string) => {
    setSelectedTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    )
  }

  const toggleSelectAll = () => {
    if (selectedTimes.length === availableSlots.length) {
      setSelectedTimes([])
    } else {
      setSelectedTimes([...availableSlots])
    }
  }

  const handleBookingClick = () => {
    const timesToBook = [...selectedTimes]
    if (isCustomTime && customStart && customEnd) {
      if (customEnd <= customStart) {
        alert("Jam selesai harus lebih akhir dari jam mulai.")
        return
      }
      const customFormatted = `${customStart} - ${customEnd}`
      if (!timesToBook.includes(customFormatted)) {
        timesToBook.push(customFormatted)
      }
      if (!availableSlots.includes(customFormatted)) {
        setAvailableSlots((prev) => [...prev, customFormatted].sort())
      }
      setDeletedCustomSlots((prev) => prev.filter((t) => t !== customFormatted))
    }
    if (timesToBook.length > 0) {
      onBooking(timesToBook, metode)
      setSelectedTimes([])
      setIsCustomTime(false)
    }
  }

  const isFormValid = selectedTimes.length > 0 || (isCustomTime && customStart && customEnd)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Jadwal Sesi</h2>
          <p className="text-sm text-gray-500">
            Atur ketersediaan sesi asesmen dan konseling klinik. Pilih metode layanan, tentukan tanggal, lalu centang slot jam yang ingin dibuka untuk klien.
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
                {selectedTimes.length === timeSlots.length ? "Batal Pilih Semua" : "Pilih Semua"}
              </button>
            </div>

            {/* Pilihan Metode Layanan Asesmen: Online, Offline, atau Keduanya */}
            <div className="mb-4 bg-purple-50/50 p-3 rounded-2xl border border-[#EDE0F2]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-800">
                  Pilih Metode Asesmen:
                </span>
                <span className="text-[11px] font-semibold text-[#561269]">
                  {metode === "Online"
                    ? "Sesi Online via Zoom"
                    : metode === "Offline"
                      ? "Sesi Tatap Muka di Klinik"
                      : "Fleksibel (Online & Offline)"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMetode("Online")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${metode === "Online"
                      ? "border-[#561269] bg-white text-[#561269] shadow-xs ring-1 ring-[#561269]"
                      : "border-gray-200 bg-white/70 text-gray-600 hover:bg-white"
                    }`}
                >
                  <Video className="w-3.5 h-3.5 text-[#561269]" />
                  <span>Online</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMetode("Offline")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${metode === "Offline"
                      ? "border-[#561269] bg-white text-[#561269] shadow-xs ring-1 ring-[#561269]"
                      : "border-gray-200 bg-white/70 text-gray-600 hover:bg-white"
                    }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-[#561269]" />
                  <span>Offline</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMetode("Keduanya")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${metode === "Keduanya"
                      ? "border-[#561269] bg-white text-[#561269] shadow-xs ring-1 ring-[#561269]"
                      : "border-gray-200 bg-white/70 text-gray-600 hover:bg-white"
                    }`}
                >
                  <Layers className="w-3.5 h-3.5 text-[#561269]" />
                  <span>Keduanya</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-3">
              Pilih slot jam yang ingin Anda buka (bisa pilih beberapa sekaligus):
            </p>

            {/* Checkbox List Slot Waktu */}
            <div className="flex flex-col gap-2.5 mb-6">
              {availableSlots.map((time, idx) => {
                const isChecked = selectedTimes.includes(time)
                const isCustom = !DEFAULT_SLOTS.includes(time)
                const openedSlot = date
                  ? bookedSessions.find(
                    (s: any) =>
                      s.date === formatDateKey(date) &&
                      s.waktu === time &&
                      (s.isAvailableSlot || s.namaKlien === "Tersedia")
                  )
                  : undefined
                const isAlreadyOpened = Boolean(openedSlot)
                const isAlreadyBooked = date
                  ? bookedSessions.some(
                    (s: any) =>
                      s.date === formatDateKey(date) &&
                      s.waktu === time &&
                      !s.isAvailableSlot &&
                      s.namaKlien !== "Tersedia"
                  )
                  : false

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between border rounded-xl px-4 py-2.5 transition-all ${isChecked
                        ? "border-[#561269] bg-purple-50/70 shadow-2xs"
                        : isAlreadyOpened
                          ? "border-emerald-300 bg-emerald-50/40"
                          : isAlreadyBooked
                            ? "border-blue-200 bg-blue-50/30"
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
                        className={`text-[13px] font-medium ${isChecked ? "text-[#561269] font-bold" : "text-gray-700"
                          }`}
                      >
                        {time}
                      </span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      {isAlreadyOpened && !isChecked && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                          Sudah Dibuka {openedSlot?.metode ? `(${openedSlot.metode})` : ""}
                        </span>
                      )}
                      {isAlreadyBooked && !isChecked && (
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">
                          Ada Klien
                        </span>
                      )}
                      {isChecked && (
                        <span className="text-[11px] font-semibold text-[#561269] bg-purple-100/80 px-2.5 py-0.5 rounded-full">
                          Dipilih
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
                              handleDeleteCustomSlot(time)
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

              {/* Opsi Tambahan: Tentukan Jam Kustom Sendiri */}
              <div
                className={`border rounded-xl px-4 py-2.5 transition-colors cursor-pointer ${isCustomTime
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
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (!customStart || !customEnd || customEnd <= customStart) {
                          alert("Jam selesai harus lebih akhir dari jam mulai.")
                          return
                        }
                        const customFormatted = `${customStart} - ${customEnd}`
                        if (!availableSlots.includes(customFormatted)) {
                          setAvailableSlots((prev) => [...prev, customFormatted].sort())
                        }
                        if (!selectedTimes.includes(customFormatted)) {
                          setSelectedTimes((prev) => [...prev, customFormatted])
                        }
                        setDeletedCustomSlots((prev) => prev.filter((t) => t !== customFormatted))
                        setIsCustomTime(false)
                      }}
                      className="text-left text-xs font-semibold text-[#561269] hover:text-[#3d0b4b] hover:underline cursor-pointer pt-0.5"
                    >
                      + Tambahkan ke Pilihan Jam
                    </button>
                  </div>
                )}
              </div>
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
              className={`w-full font-bold py-3.5 rounded-full text-[13px] transition-all ${isFormValid
                  ? "bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 cursor-pointer shadow-sm hover:shadow-md active:scale-95"
                  : "bg-[#d6d6d6] text-gray-500 cursor-not-allowed"
                }`}
            >
              {selectedTimes.length > 0
                ? `Buka ${selectedTimes.length} Jam Sesi (${metode}) Sekaligus`
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
