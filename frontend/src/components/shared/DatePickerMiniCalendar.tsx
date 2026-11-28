"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, Sparkles, X } from "lucide-react"

export interface DatePickerMiniCalendarProps {
  value: string // YYYY-MM-DD
  onChange: (dateStr: string) => void
  datesWithSlots?: string[] // list of YYYY-MM-DD strings where slots are open
  slotsCountByDate?: Record<string, number>
  minDate?: string // YYYY-MM-DD
  required?: boolean
  disabled?: boolean
  label?: string
  placeholder?: string
  colorTheme?: "purple" | "amber"
  className?: string
  allowClear?: boolean
}

const INDO_MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
]

const INDO_MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
]

const INDO_DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
const INDO_DAYS_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

export const parseYMD = (str: string) => {
  if (!str) {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() }
  }
  const parts = str.split("-")
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const day = parseInt(parts[2], 10)
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return { year, month, day }
    }
  }
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() }
}

export const formatYMD = (year: number, month: number, day: number): string => {
  const m = String(month + 1).padStart(2, "0")
  const d = String(day).padStart(2, "0")
  return `${year}-${m}-${d}`
}

export const formatDisplayDateIndo = (dateStr: string): string => {
  if (!dateStr) return "Pilih Tanggal"
  const { year, month, day } = parseYMD(dateStr)
  const d = new Date(year, month, day)
  if (isNaN(d.getTime())) return dateStr
  const dayName = INDO_DAYS[d.getDay()]
  const monthName = INDO_MONTHS[month]
  return `${dayName}, ${day} ${monthName} ${year}`
}

export default function DatePickerMiniCalendar({
  value,
  onChange,
  datesWithSlots = [],
  slotsCountByDate = {},
  minDate,
  required = false,
  disabled = false,
  label,
  placeholder = "Pilih Tanggal",
  colorTheme = "purple",
  className = "",
  allowClear = false,
}: DatePickerMiniCalendarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const todayStr = useMemo(() => {
    const now = new Date()
    return formatYMD(now.getFullYear(), now.getMonth(), now.getDate())
  }, [])

  const initialParsed = useMemo(() => parseYMD(value || todayStr), [value, todayStr])
  const [viewYear, setViewYear] = useState<number>(initialParsed.year)
  const [viewMonth, setViewMonth] = useState<number>(initialParsed.month)

  // Sinkronkan viewYear dan viewMonth jika value berubah dari luar (misal klik pill tanggal)
  useEffect(() => {
    if (value) {
      const p = parseYMD(value)
      setViewYear(p.year)
      setViewMonth(p.month)
    }
  }, [value])

  // Menutup popup saat klik di luar container
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((prev) => prev - 1)
    } else {
      setViewMonth((prev) => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((prev) => prev + 1)
    } else {
      setViewMonth((prev) => prev + 1)
    }
  }

  // Jumlah hari dalam bulan yang sedang dilihat
  const daysInMonth = useMemo(() => {
    return new Date(viewYear, viewMonth + 1, 0).getDate()
  }, [viewYear, viewMonth])

  // Hari pertama dalam bulan tersebut (0 = Minggu, 1 = Senin, ...)
  const firstDayOfWeek = useMemo(() => {
    return new Date(viewYear, viewMonth, 1).getDay()
  }, [viewYear, viewMonth])

  // Cek apakah tanggal saat ini yang sedang dipilih memiliki slot
  const isSelectedDateHasSlots = useMemo(() => {
    return Boolean(value && datesWithSlots.includes(value))
  }, [value, datesWithSlots])

  // Hitung berapa hari dalam bulan ini yang memiliki slot terbuka
  const slotsInCurrentViewMonth = useMemo(() => {
    return datesWithSlots.filter((d) => {
      const p = parseYMD(d)
      return p.year === viewYear && p.month === viewMonth
    }).length
  }, [datesWithSlots, viewYear, viewMonth])

  const handleSelectDay = (day: number) => {
    const selectedKey = formatYMD(viewYear, viewMonth, day)
    onChange(selectedKey)
    setIsOpen(false)
  }

  const handleQuickJumpToday = () => {
    onChange(todayStr)
    const p = parseYMD(todayStr)
    setViewYear(p.year)
    setViewMonth(p.month)
    setIsOpen(false)
  }

  const handleJumpToNearestSlot = () => {
    if (datesWithSlots.length === 0) return
    // Cari slot yang sama atau setelah hari ini, atau slot pertama
    const futureSlots = datesWithSlots.filter((d) => d >= todayStr).sort()
    const targetDate = futureSlots[0] || datesWithSlots[0]
    if (targetDate) {
      onChange(targetDate)
      const p = parseYMD(targetDate)
      setViewYear(p.year)
      setViewMonth(p.month)
      setIsOpen(false)
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-[#5D205E]" />
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Trigger Button yang menggantikan input date standar */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full px-3.5 py-2.5 rounded-xl border transition-all text-xs font-medium cursor-pointer flex items-center justify-between group ${
          isOpen
            ? "border-[#E8C32A] ring-2 ring-[#E8C32A]/20 bg-white shadow-xs"
            : "border-gray-200 bg-gray-50/50 hover:bg-white hover:border-gray-300"
        } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <CalendarIcon
            className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
              colorTheme === "amber" ? "text-amber-600" : "text-[#5D205E]"
            }`}
          />
          <span className={`truncate text-xs ${value ? "font-semibold text-gray-900" : "font-normal text-gray-400"}`}>
            {value ? formatDisplayDateIndo(value) : placeholder}
          </span>
        </div>

        {/* Indikator status slot pada tanggal yang sedang aktif */}
        <div className="flex items-center gap-1.5 shrink-0">
          {allowClear && value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                onChange("")
              }}
              className="p-0.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition"
              title="Hapus tanggal"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          {value && datesWithSlots && datesWithSlots.length > 0 && (
            isSelectedDateHasSlots ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Slot Tersedia</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-medium border border-amber-200/60">
                Belum Ada Slot
              </span>
            )
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Kalender Kecil Popup */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-full sm:w-[320px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-3.5 font-poppins animate-fadeIn">
          {/* Header Kalender: Navigasi Bulan & Tahun */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-gray-100">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-center">
              <span className="text-xs font-extrabold text-gray-900">
                {INDO_MONTHS[viewMonth]} {viewYear}
              </span>
              {slotsInCurrentViewMonth > 0 && (
                <span className="block text-[10px] text-emerald-600 font-semibold">
                  {slotsInCurrentViewMonth} hari memiliki slot
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Header Nama Hari: Min, Sen, Sel, Rab, Kam, Jum, Sab */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {INDO_DAYS_SHORT.map((day, idx) => (
              <span
                key={day}
                className={`text-[10px] font-bold py-1 ${
                  idx === 0 ? "text-rose-500" : "text-gray-400"
                }`}
              >
                {day}
              </span>
            ))}
          </div>

          {/* Grid Tanggal */}
          <div className="grid grid-cols-7 gap-1">
            {/* Slot Kosong Sebelum Tanggal 1 */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8 sm:h-9" />
            ))}

            {/* Tanggal 1 hingga Akhir Bulan */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateKey = formatYMD(viewYear, viewMonth, day)
              const isSelected = dateKey === value
              const hasSlot = datesWithSlots.includes(dateKey)
              const slotCount = slotsCountByDate[dateKey] || 0
              const isToday = dateKey === todayStr
              const isPast = minDate ? dateKey < minDate : false

              // Style penentu tanggal:
              // - isSelected: background tema aktif (#5D205E)
              // - hasSlot: ciri khusus berwarna kuning/hijau dengan dot penanda
              // - normal: tanggal biasa
              let dayClasses = "text-gray-700 hover:bg-gray-100"
              if (isSelected) {
                dayClasses =
                  colorTheme === "amber"
                    ? "bg-amber-600 text-white font-extrabold shadow-md scale-105"
                    : "bg-[#5D205E] text-white font-extrabold shadow-md scale-105 ring-2 ring-[#E8C32A]"
              } else if (hasSlot) {
                dayClasses =
                  "bg-amber-100/90 text-amber-950 font-bold border border-amber-300 hover:bg-amber-200 hover:scale-105 shadow-2xs"
              } else if (isToday) {
                dayClasses = "ring-1 ring-gray-400 font-bold text-gray-900 bg-gray-50/80"
              }

              return (
                <button
                  key={dateKey}
                  type="button"
                  disabled={isPast}
                  onClick={() => !isPast && handleSelectDay(day)}
                  title={
                    isPast
                      ? `📅 ${dateKey}: Tanggal telah terlewat`
                      : hasSlot
                      ? slotCount > 0
                        ? `📅 ${dateKey}: ${slotCount} slot dibuka psikolog`
                        : `📅 ${dateKey}: Ada slot dibuka psikolog`
                      : `📅 ${dateKey}: Belum ada slot`
                  }
                  className={`relative h-8 sm:h-9 rounded-xl flex flex-col items-center justify-center transition-all select-none ${dayClasses} ${
                    isPast ? "opacity-30 cursor-not-allowed hover:bg-transparent" : "cursor-pointer"
                  }`}
                >
                  <span className="leading-none">{day}</span>

                  {/* Cirinya ada slot: Dot indikator di bawah angka tanggal */}
                  {hasSlot && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-0.5 shrink-0 ${
                        isSelected
                          ? "bg-[#E8C32A] ring-1 ring-white"
                          : "bg-amber-600 animate-pulse"
                      }`}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Footer Legend & Navigasi Cepat */}
          <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-2 text-[11px]">
            {/* Legend Penanda */}
            {datesWithSlots && datesWithSlots.length > 0 ? (
              <div className="flex items-center justify-between text-gray-600 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-md bg-amber-200 border border-amber-400 flex items-center justify-center">
                    <span className="w-1 h-1 rounded-full bg-amber-600"></span>
                  </span>
                  <span className="font-semibold text-amber-900">
                    Ada Slot Psikolog ({datesWithSlots.length} hari)
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-gray-200"></span>
                  <span className="text-gray-400">Tanpa Slot</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-gray-500 text-[10px]">
                <span>Pilih tanggal yang diinginkan</span>
                <span className="text-gray-400 italic">Bebas dipilih</span>
              </div>
            )}

            {/* Tombol Pintasan */}
            <div className="flex items-center justify-between gap-1 pt-1">
              <button
                type="button"
                onClick={handleQuickJumpToday}
                className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[10px] transition cursor-pointer"
              >
                Hari Ini
              </button>

              {allowClear && value && (
                <button
                  type="button"
                  onClick={() => {
                    onChange("")
                    setIsOpen(false)
                  }}
                  className="px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 font-bold text-[10px] transition cursor-pointer"
                >
                  Kosongkan
                </button>
              )}

              {datesWithSlots.length > 0 && (
                <button
                  type="button"
                  onClick={handleJumpToNearestSlot}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 font-extrabold text-[10px] transition cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Lompat ke Slot Terdekat</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
