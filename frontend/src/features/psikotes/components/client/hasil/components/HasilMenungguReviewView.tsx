/** Komponen tampilan hasil asesmen yang sedang dalam proses telaah psikolog (SLA 3 hari kerja). */
"use client";

import React from "react";
import Link from "next/link";
import { Clock, Info } from "lucide-react";
import { REVIEW_MAX_DAYS } from "@/features/psikotes/utils/reviewSla";

export interface HasilMenungguReviewViewProps {
  displayTestName: string;
  peserta: {
    nama?: string;
    bookingId?: string | null;
    tanggal?: string;
  };
  slaInfo: {
    deadlineDate: Date;
  };
  getWhatsAppUrl: (msg: string) => string;
}

export function HasilMenungguReviewView({
  displayTestName,
  peserta,
  slaInfo,
  getWhatsAppUrl,
}: HasilMenungguReviewViewProps) {
  return (
    <div className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-200/80 shadow-xs">
      <div className="py-8 sm:py-12 px-3 sm:px-6 max-w-xl mx-auto text-center space-y-6">
        {/* Icon Elegan & Tenang */}
        <div className="inline-flex items-center justify-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-purple-50 text-[#561269] flex items-center justify-center border border-purple-100 shadow-xs">
            <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-[#561269]" />
          </div>
        </div>

        {/* Judul & Penjelasan Ringkas */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Asesmen Berhasil Diselesaikan!
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
            Terima kasih telah menyelesaikan asesmen <strong>{displayTestName}</strong>. Jawaban Anda berhasil disimpan. Selanjutnya, hasil asesmen akan melalui proses penelaahan oleh psikolog Empathika sebelum laporan diterbitkan.
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
            <span className="font-medium text-gray-800 text-right">
              Dalam Proses Telaah Psikolog
            </span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-500">Estimasi Laporan Selesai</span>
            <span className="font-medium text-gray-800 text-right">
              Maksimal {REVIEW_MAX_DAYS} hari kerja, yaitu {slaInfo.deadlineDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* Informasi Hasil */}
        <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100/80 text-left text-xs text-purple-950 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#561269] shrink-0 mt-0.5" />
          <p className="leading-relaxed text-gray-700">
            <strong className="text-gray-900 font-bold">Informasi Hasil:</strong> Laporan hasil asesmen dalam format PDF akan dikirimkan oleh admin melalui WhatsApp yang terdaftar. Anda juga dapat mengecek dan mengunduh laporan secara mandiri melalui website Empathika menggunakan kode tiket setelah proses penelaahan selesai.
          </p>
        </div>

        {/* Aksi Sederhana */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
          <Link
            href="/psikotes"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#561269] hover:bg-[#6e1886] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition"
          >
            Kembali ke Katalog Tes
          </Link>
        </div>

        {/* Pertanyaan & Kontak Admin WhatsApp */}
        <div className="pt-2 text-xs text-gray-500 space-y-1">
          <p>Ada pertanyaan mengenai hasil asesmen?</p>
          <p>
            Silakan hubungi Admin Empathika melalui WhatsApp.{" "}
            <a
              href={getWhatsAppUrl(`Halo Admin Empathika, saya ingin bertanya mengenai status review asesmen psikotes saya (Tiket: ${peserta.bookingId || "PSI-VERIFIED"})`)}
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


export default HasilMenungguReviewView;
