"use client"

import Link from "next/link"
import { MapPin, Clock, Users, Check, ArrowRight, CheckCircle2 } from "lucide-react"
import { type AsesmenPackage } from "../../data/asesmenData"

interface AsesmenOfflineViewProps {
  selectedAsesmen: AsesmenPackage
  selectedOfflinePlan: "weekday" | "weekend"
  setSelectedOfflinePlan: (plan: "weekday" | "weekend") => void
  offlineCheckoutUrl: string
}

export function AsesmenOfflineView({
  selectedAsesmen,
  selectedOfflinePlan,
  setSelectedOfflinePlan,
  offlineCheckoutUrl,
}: AsesmenOfflineViewProps) {
  const isWeekday = selectedOfflinePlan === "weekday"
  const selectedPrice = isWeekday ? selectedAsesmen.weekday : selectedAsesmen.weekend
  const selectedLabel = isWeekday ? "Hari Kerja (Weekday)" : "Akhir Pekan (Weekend)"

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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">
              Daftar Biaya Sesi Tatap Muka
            </h3>
            <span className="text-[11px] text-gray-400">
              Klik salah satu untuk memilih paket
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Weekday Box (Interactive) */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedOfflinePlan("weekday")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  setSelectedOfflinePlan("weekday")
                }
              }}
              className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between group relative ${
                isWeekday
                  ? "border-[#561269] bg-gradient-to-b from-purple-50 via-white to-purple-50/30 shadow-md ring-2 ring-[#561269]/20"
                  : "border-purple-100 bg-gradient-to-b from-purple-50/50 to-white hover:border-[#561269]/40 hover:shadow-xs"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-md transition-colors ${
                      isWeekday
                        ? "text-[#561269] bg-purple-100"
                        : "text-gray-600 bg-purple-50 group-hover:bg-purple-100 group-hover:text-[#561269]"
                    }`}
                  >
                    Hari Kerja (Weekday)
                  </span>
                  {isWeekday ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#561269] bg-purple-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Dipilih
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-gray-400 group-hover:text-purple-600 transition-colors">
                      Klik pilih
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">Senin - Jumat (Sesuai Jam Operasional)</p>
                <div className="text-3xl font-extrabold text-[#561269] mt-3">
                  {selectedAsesmen.weekday}
                </div>
              </div>
              <p className="text-[11px] text-gray-500 mt-3 pt-3 border-t border-purple-100">
                Termasuk lembar asesmen fisik &amp; laporan evaluasi cetak resmi.
              </p>
            </div>

            {/* Weekend Box (Interactive) */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedOfflinePlan("weekend")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  setSelectedOfflinePlan("weekend")
                }
              }}
              className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between group relative ${
                !isWeekday
                  ? "border-[#CA8A04] bg-gradient-to-b from-amber-50 via-white to-amber-50/30 shadow-md ring-2 ring-[#CA8A04]/20"
                  : "border-amber-100 bg-gradient-to-b from-amber-50/50 to-white hover:border-[#CA8A04]/40 hover:shadow-xs"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-md transition-colors ${
                      !isWeekday
                        ? "text-amber-900 bg-amber-100"
                        : "text-gray-600 bg-amber-50 group-hover:bg-amber-100 group-hover:text-amber-900"
                    }`}
                  >
                    Akhir Pekan (Weekend)
                  </span>
                  {!isWeekday ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Dipilih
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-gray-400 group-hover:text-amber-600 transition-colors">
                      Klik pilih
                    </span>
                  )}
                </div>
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

        {/* Tombol CTA Langsung ke Pemilihan Jadwal */}
        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <span className="text-xs text-gray-400 block">Paket Biaya Terpilih</span>
            <span className="text-sm font-bold text-gray-900 flex items-center gap-1.5 justify-center sm:justify-start">
              <MapPin className="w-4 h-4 text-[#561269]" /> Tatap Muka &bull; {selectedLabel} ({selectedPrice})
            </span>
          </div>

          <Link
            href={offlineCheckoutUrl as any}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 font-extrabold text-sm sm:text-base px-8 sm:px-12 py-3.5 sm:py-4 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <span>Lanjut Pembayaran</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-[11px] text-gray-400 text-center sm:text-right mt-3">
          Langkah berikutnya: Anda akan memilih tanggal sesi dan slot waktu yang dibuka oleh admin klinik.
        </p>
      </div>
    </div>
  )
}
