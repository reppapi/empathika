import React from "react"
import Link from "next/link"
import { ArrowRight, Video, MapPin, AlertCircle, RefreshCw } from "lucide-react"
import { TodaySessionItem } from "../../types"
import { AdminStatusBadge } from "@/components/shared/AdminStatusBadge"

interface DashboardTodaySessionsProps {
  sessions: TodaySessionItem[]
  totalCount?: number
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
}

export default function DashboardTodaySessions({
  sessions,
  totalCount = 0,
  isLoading = false,
  error = null,
  onRetry,
}: DashboardTodaySessionsProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col min-h-[380px]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-gray-900 text-base">Sesi Konseling Hari Ini</h3>
          <p className="text-xs text-gray-500 mt-0.5">Jadwal konsultasi klien & psikolog</p>
        </div>
        <Link
          href={"/admin/jadwal" as any}
          className="text-xs font-bold text-[#5D205E] hover:underline flex items-center gap-1"
        >
          {totalCount > 0 ? `Kelola (${totalCount})` : "Kelola"}
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="flex flex-col gap-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-200" />
                  <div className="flex flex-col gap-2">
                    <div className="w-28 h-3.5 bg-gray-200 rounded" />
                    <div className="w-40 h-3 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="w-24 h-6 bg-gray-200 rounded-lg" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-red-600 gap-2 border border-red-100 rounded-xl bg-red-50/50 my-auto">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <p className="text-xs font-bold uppercase tracking-wider text-red-700">Gagal Memuat Sesi Hari Ini</p>
            <p className="text-xs text-gray-600">{error}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#5D205E] hover:bg-[#481849] text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer mt-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Coba Lagi</span>
              </button>
            )}
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400">
            Belum ada jadwal sesi konseling untuk hari ini.
          </div>
        ) : (
          sessions.map((session, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-gray-50/70 border border-gray-100 hover:bg-gray-50 transition-colors animate-fadeIn"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#5D205E]/10 text-[#5D205E] flex items-center justify-center font-bold text-xs shrink-0">
                  {session.metode === "Online" ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{session.klien}</h4>
                  <p className="text-[11px] text-gray-500">
                    {session.layanan} • <span className="font-semibold text-gray-700">{session.psikolog}</span>
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-1">
                <span className="text-xs font-semibold text-gray-800">{session.waktu}</span>
                <AdminStatusBadge
                  className="w-36"
                  variant={
                    session.status === "Selesai"
                      ? "success"
                      : session.status === "Sedang Berjalan" || session.status === "Sedang Berlangsung"
                      ? "danger"
                      : session.status === "Segera Dimulai"
                      ? "info"
                      : session.status === "Dibatalkan"
                      ? "neutral"
                      : "warning"
                  }
                >
                  {session.status}
                </AdminStatusBadge>
              </div>
            </div>
          ))
        )}
      </div>

      {totalCount > sessions.length && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
          <span>Menampilkan {sessions.length} dari {totalCount} sesi hari ini</span>
          <Link
            href={"/admin/jadwal" as any}
            className="font-semibold text-[#5D205E] hover:underline flex items-center gap-1"
          >
            Lihat Semua ({totalCount})
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  )
}
