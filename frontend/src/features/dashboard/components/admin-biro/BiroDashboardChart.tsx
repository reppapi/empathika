"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronDown, BarChart3 } from "lucide-react"
import { ChartPeriod, ChartBarItem } from "../../types"

interface BiroDashboardChartProps {
  chartData: Record<ChartPeriod, ChartBarItem[]>
  biroName: string
}

const PERIOD_LABELS: Record<ChartPeriod, string> = {
  minggu: "Minggu Ini",
  bulan: "Bulan Ini",
  bulan_lalu: "Bulan Lalu",
}

const VALID_PERIODS = ["minggu", "bulan", "bulan_lalu"] as const

export default function BiroDashboardChart({ chartData, biroName }: BiroDashboardChartProps) {
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
    const targetUrl = qs ? `/admin-biro?${qs}` : "/admin-biro"
    router.replace(targetUrl as any, { scroll: false })
  }

  const activeChart = chartData[chartPeriod] || []
  const totalReservasi = activeChart.reduce((acc, curr) => acc + curr.value, 0)
  const avgReservasi = activeChart.length > 0 ? Math.round(totalReservasi / activeChart.length) : 0

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-7 flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 text-lg">Grafik Reservasi Sesi Klien</h3>
              <span className="hidden sm:inline-block text-[11px] font-semibold text-[#561269] bg-[#561269]/10 px-2.5 py-0.5 rounded-full">
                Khusus Tenant Biro
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Statistik pemesanan layanan dan konsultasi klien terdaftar di {biroName}
            </p>
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 border border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-xl px-3.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#561269]" />
              <span>{PERIOD_LABELS[chartPeriod]}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 font-poppins text-xs">
                {VALID_PERIODS.map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => handlePeriodChange(period)}
                    className={`w-full text-left px-3.5 py-2 hover:bg-[#F9F5FA] transition-colors cursor-pointer ${
                      chartPeriod === period ? "font-bold text-[#561269] bg-[#F9F5FA]" : "text-gray-700"
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
        <div className="flex items-end justify-between px-2 sm:px-6 gap-3 sm:gap-6 h-[240px] pt-4 pb-2 border-b border-gray-100">
          {activeChart.map((item, index) => (
            <div key={index} className="flex flex-col items-center w-full group relative h-full justify-end">
              <span className="text-gray-900 font-bold mb-2 text-sm sm:text-base group-hover:text-[#561269] transition-colors">
                {item.value}
              </span>
              <div
                className="w-full max-w-[55px] bg-[#BFA3C5] rounded-t-lg transition-all duration-300 group-hover:bg-[#561269] cursor-pointer"
                style={{ height: item.height }}
                title={`${item.label}: ${item.value} sesi`}
              ></div>
              <span className="text-xs font-semibold text-gray-500 mt-3">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 mt-4 pt-1 gap-2">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#561269]"></span>
          Reservasi Terkonfirmasi ({totalReservasi} sesi total)
        </span>
        <span>
          Rata-rata: <strong>{avgReservasi} sesi / periode</strong>
        </span>
      </div>
    </div>
  )
}
