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
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className="h-1.5 w-full bg-[#5D205E] absolute top-0 left-0"></div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider line-clamp-1">
                  {item.title}
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#F9F5FA] flex items-center justify-center shrink-0">
                  <IconComp className="w-4 h-4 text-[#5D205E]" />
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                {item.value}
              </h3>
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-3">
              <ArrowUp className="w-3 h-3" />
              {item.change}
            </p>
          </div>
        )
      })}
    </div>
  )
}
