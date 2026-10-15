"use client"

import React from "react"
import { Video, MapPin, ArrowRight, UserCheck } from "lucide-react"
import { TodaySessionItem } from "../../types"
import { BiroClientProfile } from "../../data/biroDashboardData"

interface BiroDashboardTodaySessionsProps {
  sessions: TodaySessionItem[]
  clients: BiroClientProfile[]
  biroName: string
  onOpenClientList: () => void
  onSelectClientByName: (clientName: string) => void
}

export default function BiroDashboardTodaySessions({
  sessions,
  clients,
  biroName,
  onOpenClientList,
  onSelectClientByName,
}: BiroDashboardTodaySessionsProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 text-base">Sesi Konseling Hari Ini</h3>
              <span className="text-[10px] font-bold bg-[#561269]/10 text-[#561269] px-2 py-0.5 rounded-full">
                Klien Biro
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Jadwal konsultasi klien di bawah naungan {biroName}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenClientList}
            className="text-xs font-bold text-[#561269] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Semua Klien</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {sessions.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              Belum ada sesi konseling yang dijadwalkan hari ini untuk biro ini.
            </div>
          ) : (
            sessions.map((session, idx) => (
              <div
                key={idx}
                onClick={() => onSelectClientByName(session.klien)}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-gray-50/70 border border-gray-100 hover:bg-[#F9F5FA] hover:border-[#561269]/30 transition-all cursor-pointer group"
                title="Klik untuk melihat profil lengkap klien ini"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#561269]/10 text-[#561269] flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[#561269] group-hover:text-white transition-colors">
                    {session.metode === "Online" ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#561269] transition-colors">
                        {session.klien}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-medium">({session.metode})</span>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      {session.layanan} • <span className="font-semibold text-gray-700">{session.psikolog}</span>
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-1">
                  <span className="text-xs font-semibold text-gray-800">{session.waktu}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      session.status === "Selesai"
                        ? "bg-emerald-100 text-emerald-800"
                        : session.status === "Sedang Berjalan"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {session.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <span className="flex items-center gap-1 text-[11px]">
          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
          Hanya menampilkan klien naungan biro ini
        </span>
        <button
          type="button"
          onClick={onOpenClientList}
          className="text-[#561269] font-bold hover:underline cursor-pointer text-[11px]"
        >
          Lihat Direktori Klien ({clients.length})
        </button>
      </div>
    </div>
  )
}
