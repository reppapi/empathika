/** Kartu ringkasan statistik jumlah peserta, tes gratis, berbayar, dan yang sudah selesai. */
import React from "react";
import { Stethoscope, Clock, MessageCircle, FileSearch } from "lucide-react";

export interface PsikotesSummaryProps {
  summary: {
    total_peserta: number;
    total_gratis: number;
    total_berbayar: number;
    total_selesai: number;
    total_menunggu_review?: number;
    total_belum_ditugaskan?: number;
    total_sedang_ditinjau?: number;
    total_belum_kirim_wa?: number;
  };
}

export default function PsikotesSummaryCards({ summary }: PsikotesSummaryProps) {
  const menungguTes = Math.max(
    0,
    summary.total_berbayar - summary.total_selesai - (summary.total_menunggu_review ?? 0)
  );
  const menungguTinjau = summary.total_belum_ditugaskan ?? 0;
  const sedangDitinjau = summary.total_sedang_ditinjau ?? 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-poppins">
      {/* 1. Menunggu Tinjau (Belum Ditugaskan) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between gap-3 hover:border-purple-200 transition-all">
        <div className="min-w-0">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block truncate">
            Menunggu Tinjau
          </span>
          <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#561269] mt-0.5 block tracking-tight">
            {menungguTinjau}
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block truncate">
            Perlu ditugaskan ke psikolog
          </span>
        </div>
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-purple-50 text-[#561269] flex items-center justify-center font-bold shrink-0">
          <FileSearch className="w-5 h-5" />
        </div>
      </div>

      {/* 2. Sedang Ditinjau (Sudah Ditugaskan) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between gap-3 hover:border-blue-200 transition-all">
        <div className="min-w-0">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block truncate">
            Sedang Ditinjau
          </span>
          <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-blue-600 mt-0.5 block tracking-tight">
            {sedangDitinjau}
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block truncate">
            Dalam telaah psikolog
          </span>
        </div>
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
          <Stethoscope className="w-5 h-5" />
        </div>
      </div>

      {/* 3. Menunggu Tes */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between gap-3 hover:border-amber-200 transition-all">
        <div className="min-w-0">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block truncate">
            Menunggu Tes
          </span>
          <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-amber-600 mt-0.5 block tracking-tight">
            {menungguTes}
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block truncate">
            Belum menyelesaikan tes
          </span>
        </div>
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      {/* 4. Belum Kirim WA */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between gap-3 hover:border-rose-200 transition-all">
        <div className="min-w-0">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block truncate">
            Belum Kirim WA
          </span>
          <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-rose-600 mt-0.5 block tracking-tight">
            {summary.total_belum_kirim_wa ?? 0}
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block truncate">
            PDF siap, belum dikirim WA
          </span>
        </div>
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shrink-0">
          <MessageCircle className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
