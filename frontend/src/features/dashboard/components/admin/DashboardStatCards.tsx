import React from "react"
import { ArrowUp } from "lucide-react"
import { MetricItem } from "../../types"

interface DashboardStatCardsProps {
  metrics: MetricItem[]
}

export default function DashboardStatCards({ metrics }: DashboardStatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
      {metrics.map((item, idx) => {
        const IconComp = item.icon
        const primaryColor = item.color || "#5D205E"
        const isAmber = item.color === "#D97706"

        return (
          <div
            key={idx}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group min-h-[170px]"
          >
            {/* Top Bar Accent Color */}
            <div
              className="h-1.5 w-full absolute top-0 left-0"
              style={{ backgroundColor: primaryColor }}
            />

            <div>
              {/* Header Card: Judul Lengkap Tanpa Terpotong */}
              <div className="flex items-start justify-between gap-2.5 mb-3 min-h-[38px]">
                <span className="text-[11px] sm:text-xs font-bold text-gray-600 uppercase tracking-normal leading-snug break-words">
                  {item.title}
                </span>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: isAmber ? "#FEF3C7" : "#F9F5FA",
                    color: primaryColor,
                  }}
                >
                  <IconComp className="w-4 h-4" />
                </div>
              </div>

              {/* Nilai Utama Metrik */}
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                {item.value}
              </h3>
            </div>

            {/* Indikator Perubahan / Status */}
            <p
              className={`text-[11px] font-semibold flex items-center gap-1 mt-3 ${
                isAmber ? "text-amber-600" : "text-emerald-600"
              }`}
            >
              {item.change.startsWith("+") && <ArrowUp className="w-3 h-3 shrink-0" />}
              <span>{item.change}</span>
            </p>
          </div>
        )
      })}
    </div>
  )
}
