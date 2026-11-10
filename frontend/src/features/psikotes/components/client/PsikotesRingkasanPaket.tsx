"use client"

import { CheckCircle2, FileText, Brain, ShieldCheck } from "lucide-react"

interface PsikotesRingkasanPaketProps {
  judul: string
  subjudul: string
  kategori: string
  bannerUrl?: string
}

export default function PsikotesRingkasanPaket({
  judul,
  subjudul,
  kategori,
  bannerUrl,
}: PsikotesRingkasanPaketProps) {
  return (
    <div className="bg-white rounded-[1.5rem] border border-[#DCD0E1] p-5 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] font-poppins">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">
          1
        </div>
        <h3 className="text-sm font-bold text-gray-800">Detail Paket Psikotes</h3>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        {/* Visual Banner Box */}
        <div className="relative w-full sm:w-[180px] h-[130px] rounded-2xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200/80 shadow-2xs flex items-center justify-center">
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt={judul}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#FAF5FD] to-[#EBDCF4] flex items-center justify-center">
              <Brain className="w-10 h-10 text-[#561269] opacity-80" />
            </div>
          )}
        </div>

        {/* Info Detail */}
        <div className="flex flex-col w-full">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#561269] mb-2 leading-tight">
            {judul}
          </h2>

          <p className="text-xs text-gray-600 mb-4 leading-relaxed">
            {subjudul}
          </p>

          {/* Manfaat / Fitur Paket */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Akses Pengerjaan Online Langsung</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
              <FileText className="w-4 h-4 text-[#561269] shrink-0" />
              <span>Laporan Analisis Komprehensif</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Sertifikat Digital Hasil Pemeriksaan</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Rekomendasi Karir &amp; Potensi Diri</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

