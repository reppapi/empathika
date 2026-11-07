import React from "react";
import { Users, CheckCircle, Clock } from "lucide-react";

export interface PsikotesSummaryProps {
  summary: {
    total_peserta: number;
    total_gratis: number;
    total_berbayar: number;
    total_selesai: number;
  };
}

export default function PsikotesSummaryCards({ summary }: PsikotesSummaryProps) {
  const sedangBerjalan = Math.max(0, summary.total_berbayar - summary.total_selesai);
  const totalPeserta = summary.total_peserta || (summary.total_berbayar + summary.total_gratis);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Peserta Berbayar */}
      <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            Peserta Berbayar
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#561269] mt-1 block">
            {summary.total_berbayar}
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">
            Klien paket laporan lengkap (PDF)
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#561269] flex items-center justify-center font-bold">
          <Users className="w-6 h-6" />
        </div>
      </div>

      {/* 2. Peserta Selesai */}
      <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            Peserta Selesai
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1 block">
            {summary.total_selesai}
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">
            Hasil laporan siap diunduh
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
          <CheckCircle className="w-6 h-6" />
        </div>
      </div>

      {/* 3. Sedang Berjalan */}
      <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            Sedang Berjalan
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1 block">
            {sedangBerjalan}
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">
            Akses aktif belum selesai
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
          <Clock className="w-6 h-6" />
        </div>
      </div>

      {/* 4. Total Semua Peserta */}
      <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            Total Semua Peserta
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-blue-700 mt-1 block">
            {totalPeserta}
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">
            Akumulasi seluruh sesi asesmen
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
          <Users className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
