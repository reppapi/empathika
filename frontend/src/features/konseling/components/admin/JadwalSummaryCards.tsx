"use client"

import { Users, Clock, CheckCircle2, CalendarClock } from "lucide-react"

interface JadwalSummaryCardsProps {
  stats: {
    total: number
    sedangBerlangsung: number
    selesai: number
    menunggu: number
  }
}

export default function JadwalSummaryCards({ stats }: JadwalSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 font-poppins">
      {/* Total Sesi */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
          <Users className="w-6 h-6 text-blue-500" />
        </div>
        <div className="flex flex-col">
          <p className="text-xs font-semibold text-gray-500">Total Sesi hari ini</p>
          <p className="text-xl font-bold text-gray-900">{stats.total}</p>
        </div>
      </div>

      {/* Sedang Berlangsung */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
          <Clock className="w-6 h-6 text-red-500" />
        </div>
        <div className="flex flex-col">
          <p className="text-xs font-semibold text-gray-500">Sedang Berlangsung</p>
          <p className="text-xl font-bold text-gray-900">{stats.sedangBerlangsung}</p>
        </div>
      </div>

      {/* Sesi Selesai */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-6 h-6 text-green-500" />
        </div>
        <div className="flex flex-col">
          <p className="text-xs font-semibold text-gray-500">Sesi Selesai</p>
          <p className="text-xl font-bold text-gray-900">{stats.selesai}</p>
        </div>
      </div>

      {/* Menunggu Jadwal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
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
