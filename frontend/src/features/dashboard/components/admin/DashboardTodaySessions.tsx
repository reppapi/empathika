import React from "react"
import Link from "next/link"
import { ArrowRight, Video, MapPin } from "lucide-react"
import { TodaySessionItem } from "../../types"
import { AdminStatusBadge } from "@/components/shared/AdminStatusBadge"

interface DashboardTodaySessionsProps {
  sessions: TodaySessionItem[]
}

export default function DashboardTodaySessions({ sessions }: DashboardTodaySessionsProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-gray-900 text-base">Sesi Konseling Hari Ini</h3>
          <p className="text-xs text-gray-500 mt-0.5">Jadwal konsultasi klien & psikolog</p>
        </div>
        <Link
          href={"/admin/jadwal" as any}
          className="text-xs font-bold text-[#5D205E] hover:underline flex items-center gap-1"
        >
          Kelola
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
        {sessions.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">
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
    </div>
  )
}
