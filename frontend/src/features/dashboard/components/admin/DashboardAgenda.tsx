import React from "react"
import Link from "next/link"
import { ArrowRight, AlertCircle, RefreshCw } from "lucide-react"
import { AgendaItem } from "../../types"

interface DashboardAgendaProps {
  agendaList: AgendaItem[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
}

export default function DashboardAgenda({
  agendaList,
  isLoading = false,
  error = null,
  onRetry,
}: DashboardAgendaProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-7 flex flex-col justify-between min-h-[380px]">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-lg">Agenda & Peringatan</h3>
          <span className="text-xs font-semibold text-gray-400">Hari ini & terdekat</span>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-2.5 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 rounded-xl border border-gray-100 flex items-start gap-3">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-gray-200" />
                <div className="w-full flex flex-col gap-2">
                  <div className="flex justify-between">
                    <div className="w-16 h-3 bg-gray-200 rounded-full" />
                    <div className="w-20 h-3 bg-gray-200 rounded" />
                  </div>
                  <div className="w-40 h-3.5 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-red-600 gap-2 border border-red-100 rounded-xl bg-red-50/50 my-6">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <p className="text-xs font-bold uppercase tracking-wider text-red-700">Gagal Memuat Agenda</p>
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
        ) : agendaList.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400">
            Belum ada agenda atau peringatan saat ini.
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 max-h-[340px] overflow-y-auto pr-1">
            {agendaList.map((item, index) => (
              <Link
                key={index}
                href={item.href as any}
                className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-[#5D205E]/30 hover:bg-[#F9F5FA] transition-all group cursor-pointer"
              >
                <div className={`mt-1.5 w-2 h-2 rounded-full ${item.dotColor} shrink-0`}></div>
                <div className="flex flex-col gap-1 w-full min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                      {item.type}
                    </span>
                    <span className="text-[11px] font-medium text-gray-500 shrink-0">
                      {item.time}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-800 leading-snug group-hover:text-[#5D205E] transition-colors truncate">
                    {item.title}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Link
        href={"/admin/jadwal" as any}
        className="flex items-center justify-center gap-1.5 mt-4 pt-3 border-t border-gray-100 text-xs font-bold text-[#5D205E] hover:underline"
      >
        Lihat Jadwal Selengkapnya
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  )
}
