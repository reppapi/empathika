"use client"

import { Users, Clock, CheckCircle2, CalendarClock } from "lucide-react"

interface JadwalSummaryCardsProps {
  stats: {
    total: number
    sedangBerlangsung: number
    selesai: number
    menunggu: number
  }
  activeStatus?: string
  onStatusChange?: (status: string) => void
}

export default function JadwalSummaryCards({
  stats,
  activeStatus = "semua",
  onStatusChange,
}: JadwalSummaryCardsProps) {
  const isAll = !activeStatus || activeStatus === "semua"
  const isBerlangsung = activeStatus === "berlangsung"
  const isSelesai = activeStatus === "selesai"
  const isMenunggu = activeStatus === "menunggu"

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 font-poppins">
      {/* Total Sesi */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onStatusChange?.("semua")}
        onKeyDown={(e) => e.key === "Enter" && onStatusChange?.("semua")}
        className={`bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4 transition-all cursor-pointer ${
          isAll
            ? "border-blue-500 ring-2 ring-blue-100 shadow-md"
            : "border-gray-100 hover:border-gray-200 hover:shadow-md"
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
          <Users className="w-6 h-6 text-blue-500" />
        </div>
        <div className="flex flex-col">
          <p className="text-xs font-semibold text-gray-500">Total Sesi hari ini</p>
          <p className="text-xl font-bold text-gray-900">{stats.total}</p>
        </div>
      </div>

      {/* Sedang Berlangsung */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onStatusChange?.(isBerlangsung ? "semua" : "berlangsung")}
        onKeyDown={(e) => e.key === "Enter" && onStatusChange?.(isBerlangsung ? "semua" : "berlangsung")}
        className={`bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4 transition-all cursor-pointer ${
          isBerlangsung
            ? "border-red-500 ring-2 ring-red-100 shadow-md bg-red-50/20"
            : "border-gray-100 hover:border-gray-200 hover:shadow-md"
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
          <Clock className="w-6 h-6 text-red-500" />
        </div>
        <div className="flex flex-col">
          <p className="text-xs font-semibold text-gray-500">Sedang Berlangsung</p>
          <p className="text-xl font-bold text-gray-900">{stats.sedangBerlangsung}</p>
        </div>
      </div>

      {/* Sesi Selesai */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onStatusChange?.(isSelesai ? "semua" : "selesai")}
        onKeyDown={(e) => e.key === "Enter" && onStatusChange?.(isSelesai ? "semua" : "selesai")}
        className={`bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4 transition-all cursor-pointer ${
          isSelesai
            ? "border-green-500 ring-2 ring-green-100 shadow-md bg-green-50/20"
            : "border-gray-100 hover:border-gray-200 hover:shadow-md"
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-6 h-6 text-green-500" />
        </div>
        <div className="flex flex-col">
          <p className="text-xs font-semibold text-gray-500">Sesi Selesai</p>
          <p className="text-xl font-bold text-gray-900">{stats.selesai}</p>
        </div>
      </div>

      {/* Menunggu Jadwal */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onStatusChange?.(isMenunggu ? "semua" : "menunggu")}
        onKeyDown={(e) => e.key === "Enter" && onStatusChange?.(isMenunggu ? "semua" : "menunggu")}
        className={`bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4 transition-all cursor-pointer ${
          isMenunggu
            ? "border-yellow-500 ring-2 ring-yellow-100 shadow-md bg-yellow-50/20"
            : "border-gray-100 hover:border-gray-200 hover:shadow-md"
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
          <CalendarClock className="w-6 h-6 text-yellow-500" />
        </div>
        <div className="flex flex-col">
          <p className="text-xs font-semibold text-gray-500">Menunggu Jadwal</p>
          <p className="text-xl font-bold text-gray-900">{stats.menunggu}</p>
        </div>
      </div>
    </div>
  )
}
