import React, { useMemo } from "react"
import Link from "next/link"
import { ArrowRight, Wallet, AlertCircle, RefreshCw } from "lucide-react"
import { RecentTransactionItem } from "../../types"
import { AdminStatusBadge } from "@/components/shared/AdminStatusBadge"

interface DashboardRecentTransactionsProps {
  transactions?: RecentTransactionItem[]
  totalCount?: number
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
}

export default function DashboardRecentTransactions({
  transactions,
  totalCount = 0,
  isLoading = false,
  error = null,
  onRetry,
}: DashboardRecentTransactionsProps) {
  const displayTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) return []
    return transactions.map((trx: any) => ({
      id: trx.id,
      client: trx.client,
      layanan: trx.layanan,
      metode: trx.metode,
      total: trx.total,
      status: trx.status === "Menunggu Pembayaran" ? "Menunggu" : trx.status,
    }))
  }, [transactions])

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col min-h-[380px]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-gray-900 text-base">Transaksi Pembayaran Terbaru</h3>
          <p className="text-xs text-gray-500 mt-0.5">Pantau konfirmasi pembayaran masuk hari ini</p>
        </div>
        <Link
          href={"/admin/transaksi" as any}
          className="text-xs font-bold text-[#5D205E] hover:underline flex items-center gap-1"
        >
          {totalCount > 0 ? `Lihat Semua (${totalCount})` : "Lihat Semua"}
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="flex flex-col gap-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-200" />
                  <div className="flex flex-col gap-2">
                    <div className="w-28 h-3.5 bg-gray-200 rounded" />
                    <div className="w-40 h-3 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="w-24 h-6 bg-gray-200 rounded-lg" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-red-600 gap-2 border border-red-100 rounded-xl bg-red-50/50 my-auto">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <p className="text-xs font-bold uppercase tracking-wider text-red-700">Gagal Memuat Transaksi</p>
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
        ) : displayTransactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400">
            Belum ada riwayat transaksi pembayaran terbaru.
          </div>
        ) : (
          displayTransactions.map((trx, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-gray-50/70 border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#5D205E] flex items-center justify-center font-bold text-xs shrink-0">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-gray-900">{trx.client}</h4>
                    <span className="text-[10px] text-gray-400 font-mono">({trx.id})</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {trx.layanan} • <span className="font-semibold text-gray-600">{trx.metode}</span>
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-1">
                <span className="text-xs font-extrabold text-gray-900">{trx.total}</span>
                <AdminStatusBadge
                  variant={
                    trx.status === "Lunas"
                      ? "success"
                      : trx.status === "Gagal"
                      ? "danger"
                      : trx.status === "Refunded"
                      ? "neutral"
                      : "warning"
                  }
                  className="w-28"
                >
                  {trx.status}
                </AdminStatusBadge>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
