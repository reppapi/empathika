"use client"

import Link from "next/link"
import { MapPin, Clock, Users, Check, ArrowRight } from "lucide-react"
import { type AsesmenPackage } from "../../data/asesmenData"

interface AsesmenOfflineViewProps {
  selectedAsesmen: AsesmenPackage
  offlineCheckoutUrl: string
}

export function AsesmenOfflineView({
  selectedAsesmen,
  offlineCheckoutUrl,
}: AsesmenOfflineViewProps) {
  return (
    <div className="max-w-[950px] mx-auto px-4 sm:px-6 lg:px-8 mt-8 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-10 border border-[#DCD0E1]">
        {/* Header Rincian */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#561269] bg-purple-50 px-3 py-1 rounded-full border border-purple-200/70 mb-2">
              <MapPin className="w-3.5 h-3.5" /> Sesi Tatap Muka di Klinik Empathika
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#561269]">
              {selectedAsesmen.title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xl">
              {selectedAsesmen.tagline}
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0 sm:text-right">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200/60">
              <Clock className="w-3.5 h-3.5 text-[#561269]" />
              <span>Durasi: {selectedAsesmen.duration}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200/60">
              <Users className="w-3.5 h-3.5 text-[#561269]" />
              <span>Sesi Privat 1-on-1</span>
            </span>
          </div>
        </div>

        {/* Kotak Harga Khusus Hanya untuk Asesmen yang Dipilih */}
        <div className="mt-8">
          <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-4">
            Daftar Biaya Sesi Tatap Muka
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Weekday Box */}
            <div className="p-6 rounded-2xl border-2 border-purple-100 bg-gradient-to-b from-purple-50/50 to-white flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase text-[#561269] bg-purple-100 px-2.5 py-1 rounded-md">
                  Hari Kerja (Weekday)
                </span>
                <p className="text-xs text-gray-500 mt-2">Senin - Jumat (Sesuai Jam Operasional)</p>
                <div className="text-3xl font-extrabold text-[#561269] mt-3">
                  {selectedAsesmen.weekday}
                </div>
              </div>
              <p className="text-[11px] text-gray-500 mt-3 pt-3 border-t border-purple-100">
                Termasuk lembar asesmen fisik &amp; laporan evaluasi cetak resmi.
              </p>
            </div>

            {/* Weekend Box */}
            <div className="p-6 rounded-2xl border-2 border-amber-100 bg-gradient-to-b from-amber-50/50 to-white flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase text-amber-900 bg-amber-100 px-2.5 py-1 rounded-md">
                  Akhir Pekan (Weekend)
                </span>
                <p className="text-xs text-gray-500 mt-2">Sabtu - Minggu (Jadwal Khusus)</p>
                <div className="text-3xl font-extrabold text-[#CA8A04] mt-3">
                  {selectedAsesmen.weekend}
                </div>
              </div>
              <p className="text-[11px] text-gray-500 mt-3 pt-3 border-t border-amber-100">
                Pendampingan privat akhir pekan bersama asesor klinis.
              </p>
            </div>
          </div>
        </div>

        {/* Fasilitas Sesi Offline */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-4">
            Fasilitas &amp; Keunggulan Sesi Tatap Muka
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {selectedAsesmen.offlineBenefits.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tombol CTA Langsung ke Portal Pembayaran */}
        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <span className="text-xs text-gray-400 block">Metode Terpilih</span>
            <span className="text-sm font-bold text-gray-900 flex items-center gap-1.5 justify-center sm:justify-start">
              <MapPin className="w-4 h-4 text-[#561269]" /> Tatap Muka di Klinik Empathika
            </span>
          </div>

          <Link
            href={offlineCheckoutUrl as any}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 font-extrabold text-sm sm:text-base px-8 sm:px-12 py-3.5 sm:py-4 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <span>Lanjut ke Portal Pembayaran</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-[11px] text-gray-400 text-center sm:text-right mt-3">
          Setelah pembayaran berhasil, tim admin klinik Empathika akan menghubungi Anda melalui WhatsApp untuk mengonfirmasi jam slot kedatangan.
        </p>
      </div>
    </div>
  )
}

