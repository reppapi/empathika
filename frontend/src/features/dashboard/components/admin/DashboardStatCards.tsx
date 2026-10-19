import React from "react"
import Link from "next/link"
import { ArrowUp, ArrowRight } from "lucide-react"
import { MetricItem } from "../../types"

import { usePathname } from "next/navigation"

interface DashboardStatCardsProps {
  metrics: MetricItem[]
}

export default function DashboardStatCards({ metrics }: DashboardStatCardsProps) {
  const pathname = usePathname()
  const isBiro = pathname?.startsWith("/admin-biro")

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
    if (title.includes("Klien Aktif")) return "/admin/jadwal"
    if (title.includes("Sesi Konseling")) return "/admin/jadwal?status=selesai"
    if (title.includes("Workshop") || title.includes("Event")) return "/admin/event?tab=workshop"
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
