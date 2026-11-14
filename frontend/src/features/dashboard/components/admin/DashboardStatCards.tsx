import React from "react"
import Link from "next/link"
import { ArrowUp, ArrowRight, AlertCircle, RefreshCw } from "lucide-react"
import { MetricItem } from "../../types"

import { usePathname } from "next/navigation"

interface DashboardStatCardsProps {
  metrics: MetricItem[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
}

export default function DashboardStatCards({
  metrics,
  isLoading = false,
  error = null,
  onRetry,
}: DashboardStatCardsProps) {
  const pathname = usePathname()
  const isBiro = pathname?.startsWith("/admin-biro")

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col justify-between min-h-[170px] animate-pulse shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="h-3 w-24 bg-gray-200 rounded" />
                <div className="w-8 h-8 rounded-lg bg-gray-200" />
              </div>
              <div className="h-7 w-28 bg-gray-200 rounded mt-2" />
            </div>
            <div className="h-3 w-20 bg-gray-200 rounded mt-3" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50/90 border border-red-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-red-800 shadow-sm">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-red-600">Gagal Memuat Ringkasan Operasional</p>
            <p className="text-xs sm:text-sm font-medium mt-0.5">{error}</p>
          </div>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Coba Lagi</span>
          </button>
        )}
      </div>
    )
  }

  const getMetricLink = (title: string): string => {
    if (isBiro) {
      if (title.includes("Pendapatan")) return "/admin-biro/transaksi"
      if (title.includes("Klien Aktif")) return "/admin-biro?modal=clients"
      if (title.includes("Sesi Konseling")) return "/admin-biro?status=selesai"
      if (title.includes("Menunggu Pembayaran")) return "/admin-biro/transaksi?status=pending"
      if (title.includes("Pendaftar") || title.includes("Layanan")) return "/admin-biro/transaksi"
      return "/admin-biro"
    }

    if (title.includes("Pendapatan")) return "/admin/transaksi"
    if (title.includes("Review") || title.includes("Psikotes")) return "/admin/psikotes"
    if (title.includes("Klien Aktif")) return "/admin/jadwal"
    if (title.includes("Sesi Konseling")) return "/admin/jadwal?status=selesai"
    if (title.includes("Event") || title.includes("Workshop")) return "/admin/event"
    if (title.includes("Menunggu Pembayaran")) return "/admin/transaksi?status=pending"
    return "/admin"
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
      {metrics.map((item, idx) => {
        const IconComp = item.icon
        const primaryColor = item.color || "#5D205E"
        const isAmber = item.color === "#D97706"
        const cardLink = getMetricLink(item.title)

        return (
          <Link
            key={idx}
            href={cardLink as any}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden group min-h-[170px] cursor-pointer hover:border-purple-200"
          >
            {/* Top Bar Accent Color */}
            <div
              className="h-1.5 w-full absolute top-0 left-0 transition-all group-hover:h-2"
              style={{ backgroundColor: primaryColor }}
            />

            <div>
              {/* Header Card: Judul Lengkap Tanpa Terpotong */}
              <div className="flex items-start justify-between gap-2.5 mb-3 min-h-[38px]">
                <span className="text-[11px] sm:text-xs font-bold text-gray-600 uppercase tracking-normal leading-snug break-words group-hover:text-gray-900 transition-colors">
                  {item.title}
                </span>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
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

            {/* Indikator Perubahan / Status & Panah Deep Link */}
            <div className="flex items-center justify-between mt-3">
              <p
                className={`text-[11px] font-semibold flex items-center gap-1 ${
                  isAmber ? "text-amber-600" : "text-emerald-600"
                }`}
              >
                {item.change.startsWith("+") && <ArrowUp className="w-3 h-3 shrink-0" />}
                <span>{item.change}</span>
              </p>
              <span className="text-gray-300 group-hover:text-[#5D205E] transition-colors">
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
