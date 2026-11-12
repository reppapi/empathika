"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronDown, AlertCircle, RefreshCw } from "lucide-react"
import { ChartPeriod, ChartBarItem } from "../../types"
import { PERIOD_LABELS } from "../../data/dashboardData"
import { adminService } from "@/services/admin.service"

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
  const [allChartData, setAllChartData] = useState<Record<ChartPeriod, ChartBarItem[]> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Muat data grafik murni dari backend database PostgreSQL
  const fetchChart = useCallback(() => {
    setIsLoading(true)
    setError(null)
    adminService
      .getDashboardChart()
      .then((res: any) => {
        if (res && res.minggu && res.bulan && res.bulan_lalu) {
          setAllChartData(res)
        } else {
          setError("Format data grafik tidak valid.")
        }
      })
      .catch((err) => {
        setError(err?.response?.data?.message || err?.message || "Gagal memuat data grafik dari database.")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  useEffect(() => {
    fetchChart()
  }, [fetchChart])

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

  const activeChart: ChartBarItem[] = allChartData ? allChartData[chartPeriod] || [] : []
  const totalSesi = activeChart.reduce((a, b) => a + (b.value || 0), 0)
  const avgSesi = activeChart.length > 0 ? Math.round(totalSesi / activeChart.length) : 0

  return (
    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-7 flex flex-col min-h-[380px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
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

      {/* Konten Grafik: Loading / Error / Data */}
      {isLoading ? (
        <div className="flex-1 flex items-end justify-between px-2 sm:px-6 gap-3 sm:gap-6 h-[220px] pt-4 pb-2 border-b border-gray-100 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="flex flex-col items-center w-full h-full justify-end gap-2">
              <div
                className="w-full max-w-[55px] bg-gray-200 rounded-t-lg"
                style={{ height: `${20 + (i * 12) % 65}%` }}
              />
              <div className="w-8 h-3 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-red-600 gap-3 border border-red-100 rounded-xl bg-red-50/50 my-auto">
          <AlertCircle className="w-7 h-7 text-red-500" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-red-700">Gagal Memuat Grafik</p>
            <p className="text-xs text-gray-600 mt-0.5">{error}</p>
          </div>
          <button
            type="button"
            onClick={fetchChart}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#5D205E] hover:bg-[#481849] text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer mt-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Coba Lagi</span>
          </button>
        </div>
      ) : activeChart.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs text-gray-400 py-16">
          Belum ada data reservasi sesi untuk periode ini.
        </div>
      ) : (
        <>
          {/* Bar Chart Visual */}
          <div className="flex-1 flex items-end justify-between px-2 sm:px-6 gap-3 sm:gap-6 h-[220px] pt-4 pb-2 border-b border-gray-100">
            {activeChart.map((item, index) => (
              <div key={index} className="flex flex-col items-center w-full group relative h-full justify-end">
                <span className="text-gray-900 font-bold mb-2 text-sm sm:text-base group-hover:text-[#5D205E] transition-colors">
                  {item.value}
                </span>
                <div
                  className="w-full max-w-[55px] bg-[#BFA3C5] rounded-t-lg transition-all duration-300 group-hover:bg-[#5D205E] cursor-pointer"
                  style={{ height: item.height || "0%" }}
                />
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
              Rata-rata: <strong>{avgSesi} sesi / periode</strong>
            </span>
          </div>
        </>
      )}
    </div>
  )
}
