import React from "react"
import Link from "next/link"
import { ArrowRight, Wallet } from "lucide-react"
import { RecentTransactionItem } from "../../types"

interface DashboardRecentTransactionsProps {
  transactions: RecentTransactionItem[]
}

export default function DashboardRecentTransactions({ transactions }: DashboardRecentTransactionsProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-gray-900 text-base">Transaksi Pembayaran Terbaru</h3>
          <p className="text-xs text-gray-500 mt-0.5">Pantau konfirmasi pembayaran masuk</p>
        </div>
        <Link
          href={"/admin/transaksi" as any}
          className="text-xs font-bold text-[#5D205E] hover:underline flex items-center gap-1"
        >
          Lihat Semua
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {transactions.map((trx, idx) => (
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
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  trx.status === "Lunas"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {trx.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
