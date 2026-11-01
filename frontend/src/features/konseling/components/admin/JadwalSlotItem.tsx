"use client"

import { Trash2 } from "lucide-react"
import { BookedAssessment } from "@/features/konseling/types"
import { formatDateKey } from "@/features/konseling/data/jadwalAdminData"

interface JadwalSlotItemProps {
  time: string
  date: Date | undefined
  bookedSessions: BookedAssessment[]
  isChecked: boolean
  isCustom: boolean
  onToggle: () => void
  onDeleteCustom: () => void
}

export default function JadwalSlotItem({
  time,
  date,
  bookedSessions,
  isChecked,
  isCustom,
  onToggle,
  onDeleteCustom,
}: JadwalSlotItemProps) {
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
      className={`flex items-center justify-between border rounded-xl px-4 py-2.5 transition-all ${
        isChecked
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
          onChange={onToggle}
          className="w-4 h-4 text-[#561269] focus:ring-[#561269] rounded border-gray-300 cursor-pointer"
        />
        <span
          className={`text-[13px] font-medium ${
            isChecked ? "text-[#561269] font-bold" : "text-gray-700"
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
                onDeleteCustom()
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
}

