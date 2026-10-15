import React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { AgendaItem } from "../../types"

interface DashboardAgendaProps {
  agendaList: AgendaItem[]
}

export default function DashboardAgenda({ agendaList }: DashboardAgendaProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-7 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-lg">Agenda & Peringatan</h3>
          <span className="text-xs font-semibold text-gray-400">Hari ini & terdekat</span>
        </div>

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
