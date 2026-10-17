"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { ChartPeriod } from "../../types"
import { DASHBOARD_CHART_DATA, PERIOD_LABELS } from "../../data/dashboardData"

const VALID_PERIODS = ["minggu", "bulan", "bulan_lalu"] as const

export default function DashboardChart() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const periodParam = searchParams ? (searchParams.get("period") || searchParams.get("periode")) : null
  const initialPeriod: ChartPeriod =
    periodParam && VALID_PERIODS.includes(periodParam as any)
      ? (periodParam as ChartPeriod)
      : "minggu"

  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>(initialPeriod)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Sinkronkan periode saat query param URL berubah (misal tombol Back / Forward browser)
  useEffect(() => {
    const p = searchParams ? (searchParams.get("period") || searchParams.get("periode")) : null
    if (p && VALID_PERIODS.includes(p as any)) {
      setChartPeriod(p as ChartPeriod)
    } else if (!p) {
      setChartPeriod("minggu")
    }
  }, [searchParams])

  const handlePeriodChange = (newPeriod: ChartPeriod) => {
    setChartPeriod(newPeriod)
    setIsDropdownOpen(false)
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "")
    if (newPeriod === "minggu") {
      params.delete("period")
      params.delete("periode")
    } else {
      params.set("period", newPeriod)
    }
    const qs = params.toString()
    const targetUrl = qs ? `/admin?${qs}` : "/admin"
    router.replace(targetUrl as any, { scroll: false })
  }

  const activeChart = DASHBOARD_CHART_DATA[chartPeriod]

  return (
    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-7 flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-8">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Grafik Reservasi Sesi</h3>
          <p className="text-xs text-gray-500 mt-0.5">Total janji temu & pendaftaran layanan klien</p>
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 border border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-xl px-3.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
          >
            {PERIOD_LABELS[chartPeriod]}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 font-poppins text-xs">
              {VALID_PERIODS.map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => handlePeriodChange(period)}
                  className={`w-full text-left px-3.5 py-2 hover:bg-[#F9F5FA] transition-colors cursor-pointer ${
                    chartPeriod === period ? "font-bold text-[#5D205E] bg-[#F9F5FA]" : "text-gray-700"
                  }`}
                >
                  {PERIOD_LABELS[period]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bar Chart Visual */}
      <div className="flex-1 flex items-end justify-between px-2 sm:px-6 gap-3 sm:gap-6 h-[240px] pt-4 pb-2 border-b border-gray-100">
        {activeChart.map((item, index) => (
          <div key={index} className="flex flex-col items-center w-full group relative h-full justify-end">
            <span className="text-gray-900 font-bold mb-2 text-sm sm:text-base group-hover:text-[#5D205E] transition-colors">
              {item.value}
            </span>
            <div
              className="w-full max-w-[55px] bg-[#BFA3C5] rounded-t-lg transition-all duration-300 group-hover:bg-[#5D205E] cursor-pointer"
              style={{ height: item.height }}
            ></div>
            <span className="text-xs font-semibold text-gray-500 mt-3">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-1">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#5D205E]"></span>
          Reservasi Terkonfirmasi
        </span>
        <span>
          Rata-rata: <strong>{Math.round(activeChart.reduce((a, b) => a + b.value, 0) / activeChart.length)} sesi / periode</strong>
        </span>
      </div>
    </div>
  )
}
