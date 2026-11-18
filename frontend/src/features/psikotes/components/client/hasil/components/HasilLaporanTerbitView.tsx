/** Komponen tampilan hasil asesmen yang laporannya sudah resmi terbit & siap diunduh (PDF). */
"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Download, Loader2 } from "lucide-react";

export interface HasilLaporanTerbitViewProps {
  displayTestName: string;
  peserta: {
    nama?: string;
    bookingId?: string | null;
    tanggal?: string;
  };
  bookingReport?: {
    psikolog?: {
      nama?: string;
      nama_gelar?: string;
    } | null;
    tanggalReview?: string | null;
  } | null;
  isDownloading: boolean;
  onDownloadPdf: () => void;
  getWhatsAppUrl: (msg: string) => string;
}

export function HasilLaporanTerbitView({
  displayTestName,
  peserta,
  bookingReport,
  isDownloading,
  onDownloadPdf,
  getWhatsAppUrl,
}: HasilLaporanTerbitViewProps) {
  return (
    <div className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-200/80 shadow-xs">
      <div className="py-8 sm:py-12 px-3 sm:px-6 max-w-xl mx-auto text-center space-y-6">
        {/* Icon Sukses & Terverifikasi */}
        <div className="inline-flex items-center justify-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-xs">
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
          </div>
        </div>

        {/* Judul & Penjelasan Ringkas */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Laporan Hasil Asesmen Telah Terbit!
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
            Laporan hasil asesmen <strong>{displayTestName}</strong> Anda telah selesai ditelaah dan diverifikasi secara resmi oleh psikolog Empathika. Silakan unduh dokumen lengkapnya melalui tombol di bawah ini.
          </p>
        </div>

        {/* Ringkasan Data Asesmen: Simpel & Bersih */}
        <div className="bg-gray-50/80 rounded-2xl border border-gray-200/80 p-4 sm:p-5 text-left text-xs sm:text-sm space-y-2.5">
          <h3 className="font-bold text-gray-900 text-sm pb-2 border-b border-gray-200">
            Informasi Asesmen
          </h3>
          <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
            <span className="text-gray-500">Nama Peserta</span>
            <span className="font-bold text-gray-900 truncate max-w-[200px] text-right">
              {peserta.nama || "Peserta Asesmen"}
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
            <span className="text-gray-500">Kode Tiket</span>
            <span className="font-mono font-bold text-[#561269] text-right">
              {peserta.bookingId || "PSI-VERIFIED"}
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
            <span className="text-gray-500">Tanggal Tes</span>
            <span className="font-medium text-gray-800">{peserta.tanggal}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
            <span className="text-gray-500">Status</span>
            <span className="font-medium text-emerald-700 text-right">
              Selesai
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
            <span className="text-gray-500">Psikolog Pemeriksa</span>
            <span className="font-medium text-gray-900 text-right">
              {bookingReport?.psikolog?.nama_gelar || bookingReport?.psikolog?.nama || "Psikolog Klinis Empathika"}
            </span>
          </div>
          {bookingReport?.tanggalReview && (
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-500">Tanggal Diterbitkan</span>
              <span className="font-medium text-gray-800 text-right">
                {new Date(bookingReport.tanggalReview).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
        </div>

        {/* Informasi Dokumen Resmi */}
        <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100/80 text-left text-xs text-purple-950 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#561269] shrink-0 mt-0.5" />
          <p className="leading-relaxed text-gray-700">
            <strong className="text-gray-900 font-bold">Dokumen Resmi &amp; Rahasia:</strong> Laporan dalam format PDF mencakup telaah klinis mendalam, rekomendasi psikologis, tanda tangan digital psikolog berizin praktik (SIPP), serta legalitas resmi Empathika.
          </p>
        </div>

        {/* Aksi Utama: Unduh Laporan PDF dan Kembali */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={isDownloading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#561269] hover:bg-[#6e1886] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition active:scale-98 cursor-pointer disabled:opacity-70"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mengunduh Dokumen...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Unduh Laporan Lengkap (PDF)</span>
              </>
            )}
          </button>

          <Link
            href="/psikotes"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition"
          >
            Kembali ke Katalog Tes
          </Link>
        </div>

        {/* Konsultasi & Bantuan WhatsApp */}
        <div className="pt-2 text-xs text-gray-500 space-y-1">
          <p>Ingin mendiskusikan hasil telaah klinis ini lebih lanjut dengan psikolog?</p>
          <p>
            <Link href="/konseling" className="text-[#561269] font-bold hover:underline">
              Jadwalkan Sesi Konseling
            </Link>
            {" "}atau{" "}
            <a
              href={getWhatsAppUrl(`Halo Admin Empathika, saya ingin bertanya mengenai laporan hasil asesmen psikotes saya (Tiket: ${peserta.bookingId || "PSI-VERIFIED"})`)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#561269] font-bold hover:underline inline-flex items-center gap-1"
            >
              Hubungi Admin WhatsApp
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}


export default HasilLaporanTerbitView;
