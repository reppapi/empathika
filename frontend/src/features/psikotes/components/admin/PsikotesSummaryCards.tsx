/** Kartu ringkasan statistik jumlah peserta, tes gratis, berbayar, dan yang sudah selesai. */
import React from "react";
import { Users, CheckCircle2, Clock, Activity } from "lucide-react";

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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-poppins">
      {/* 1. Klien Terdaftar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between gap-3 hover:border-purple-200 transition-all">
        <div className="min-w-0">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block truncate">
            Klien Terdaftar
          </span>
          <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#561269] mt-0.5 block tracking-tight">
            {summary.total_berbayar}
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block truncate">
            Peserta tiket resmi
          </span>
        </div>
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-purple-50 text-[#561269] flex items-center justify-center font-bold shrink-0">
          <Users className="w-5 h-5" />
        </div>
      </div>

      {/* 2. Selesai Dinilai */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between gap-3 hover:border-emerald-200 transition-all">
        <div className="min-w-0">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block truncate">
            Selesai Dinilai
          </span>
          <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-emerald-600 mt-0.5 block tracking-tight">
            {summary.total_selesai}
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block truncate">
            Hasil &amp; PDF siap
          </span>
        </div>
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      {/* 3. Sedang Berjalan */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between gap-3 hover:border-amber-200 transition-all">
        <div className="min-w-0">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block truncate">
            Sedang Berjalan
          </span>
          <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-amber-600 mt-0.5 block tracking-tight">
            {sedangBerjalan}
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block truncate">
            Belum menyelesaikan tes
          </span>
        </div>
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      {/* 4. Psikotes Gratis */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between gap-3 hover:border-blue-200 transition-all">
        <div className="min-w-0">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block truncate">
            Psikotes Gratis
          </span>
          <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-blue-600 mt-0.5 block tracking-tight">
            {summary.total_gratis ?? 0}
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block truncate">
            Sesi mandiri terselesaikan
          </span>
        </div>
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
          <Activity className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
