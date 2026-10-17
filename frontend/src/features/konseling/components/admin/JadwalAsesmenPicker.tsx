"use client"

import { Calendar } from "@/components/ui/calendar"

interface JadwalAsesmenPickerProps {
  date: Date | undefined
  onSelectDate: (newDate: Date | undefined) => void
  selectedTime: string
  onSelectTime: (time: string) => void
  bookingSuccessMsg: string | null
  onBooking: () => void
  timeSlots: string[]
}

export default function JadwalAsesmenPicker({
  date,
  onSelectDate,
  selectedTime,
  onSelectTime,
  bookingSuccessMsg,
  onBooking,
  timeSlots,
}: JadwalAsesmenPickerProps) {
  return (
    <div className="mt-8 bg-white border border-gray-100 shadow-sm rounded-2xl p-6 sm:p-8 font-poppins">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Jadwal Asesmen</h2>
      <p className="text-gray-500 text-sm mb-8">Atur jadwal Asesmen, Pilih tanggal dan waktu yang tersedia.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12 max-w-4xl">
        {/* Left: Date Picker Box */}
        <div className="border border-purple-200 rounded-2xl p-6 shadow-sm flex justify-center items-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onSelectDate}
            fixedWeeks
            className="w-full max-w-[320px]"
          />
        </div>

        {/* Right: Time Slots Box */}
        <div className="border border-purple-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
          <div>
            <h3 className="font-bold text-gray-900 mb-6 capitalize">
              {date
                ? date.toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Pilih Tanggal"}
            </h3>

            <div className="flex flex-col gap-3">
              {timeSlots.map((time, i) => {
                const isActive = selectedTime === time
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onSelectTime(time)}
                    className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer transition-colors w-full text-left ${
                      isActive ? "border-[#561269] bg-purple-50/50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isActive ? "border-[#561269]" : "border-gray-300"
                      }`}
                    >
                      {isActive && <div className="w-2 h-2 rounded-full bg-[#561269]" />}
                    </div>
                    <span className="text-sm font-medium text-gray-800">{time}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-6">
            {bookingSuccessMsg && (
              <p className="text-xs text-emerald-600 font-semibold text-center">
                ✓ {bookingSuccessMsg}
              </p>
            )}
            <button
              type="button"
              onClick={onBooking}
              disabled={!selectedTime}
              className={`w-full font-bold py-3.5 rounded-full shadow-sm transition-all transform active:scale-98 ${
                selectedTime
                  ? "bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 cursor-pointer shadow-sm hover:shadow-md"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Pilih Jadwal ini
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
