"use client"

import Link from "next/link"
import {
  ShieldCheck,
  Check,
  Sparkles,
  FileQuestion,
  ArrowRight,
} from "lucide-react"
import { type AsesmenPackage } from "../../data/asesmenData"

interface AsesmenOnlineViewProps {
  selectedAsesmen: AsesmenPackage
  selectedOnlinePlan: "gratis" | "berbayar"
  setSelectedOnlinePlan: (p: "gratis" | "berbayar") => void
  onlineCheckoutUrl: string
  withBiro: (path: string) => string
}

export function AsesmenOnlineView({
  selectedAsesmen,
  selectedOnlinePlan,
  setSelectedOnlinePlan,
  onlineCheckoutUrl,
  withBiro,
}: AsesmenOnlineViewProps) {
  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mt-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
        {/* Kolom Kiri: Detail Asesmen Online & Panduan */}
        <div className="lg:w-2/3 bg-white rounded-[2.5rem] p-6 sm:p-10 md:p-12 shadow-sm border border-gray-100 flex flex-col gap-10">
          {/* Tentang Asesmen Ini */}
          <div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-[#561269] mb-4 tracking-tight">
              Tentang {selectedAsesmen.title} (Online)
            </h2>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed font-light">
              {selectedAsesmen.description}
            </p>
          </div>

          {/* Perbandingan Pilihan Akses Asesmen (Gratis vs Berbayar) */}
          <div className="p-6 md:p-8 rounded-3xl bg-gray-50 border border-gray-200/80">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#561269]" />
              Pilihan Akses Asesmen: Skrining Ringkas &amp; Paket Lengkap
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-6">
              Pilih antara pengerjaan skrining mandiri tanpa biaya atau paket asesmen lengkap dengan laporan psikogram profesional.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Kartu Ringkasan Gratis */}
              <div
                onClick={() => setSelectedOnlinePlan("gratis")}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  selectedOnlinePlan === "gratis"
                    ? "border-emerald-500 bg-white shadow-md ring-2 ring-emerald-500/10"
                    : "border-gray-200 bg-white/70 hover:border-gray-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Skrining Awal
                    </span>
                    {selectedOnlinePlan === "gratis" && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 stroke-[3]" /> Dipilih
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-2xl font-black text-gray-900">Rp 0</span>
                    <span className="text-xs text-gray-400 font-semibold">/ Gratis</span>
                  </div>
                  <p className="text-xs font-bold text-gray-800 mb-3">
                    Ringkasan Hasil Asesmen Mandiri
                  </p>
                  <ul className="space-y-2 text-xs text-gray-600 mb-4">
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Pengerjaan tes online fleksibel</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Skor dan grafik ringkas instan</span>
                    </li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedOnlinePlan("gratis")
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedOnlinePlan === "gratis"
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Pilih Skrining Ringkas
                </button>
              </div>

              {/* Kartu Paket Lengkap Berbayar */}
              <div
                onClick={() => setSelectedOnlinePlan("berbayar")}
                className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between relative overflow-hidden cursor-pointer ${
                  selectedOnlinePlan === "berbayar"
                    ? "border-[#561269] bg-white shadow-md ring-2 ring-[#561269]/10"
                    : "border-gray-200 bg-white/70 hover:border-gray-300"
                }`}
              >
                <div className="absolute top-0 right-0 font-extrabold text-[10px] px-3 py-1 rounded-bl-xl uppercase tracking-wider bg-[#EAB308] text-gray-950">
                  Rekomendasi
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border text-[#561269] bg-purple-50 border-purple-200">
                      Paket Lengkap
                    </span>
                    {selectedOnlinePlan === "berbayar" && (
                      <span className="text-xs font-bold text-[#561269] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 stroke-[3]" /> Dipilih
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-2xl font-black text-[#561269]">
                      {selectedAsesmen.onlinePrice}
                    </span>
                    <span className="text-xs text-gray-400 font-semibold">/ satu kali tes</span>
                  </div>
                  <p className="text-xs font-bold text-gray-800 mb-3">
                    Laporan Hasil Asesmen Lengkap (PDF)
                  </p>
                  <ul className="space-y-2 text-xs text-gray-700 mb-4">
                    {selectedAsesmen.onlineBenefits.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[#561269] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedOnlinePlan("berbayar")
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedOnlinePlan === "berbayar"
                      ? "bg-[#561269] text-white"
                      : "bg-purple-50 text-[#561269] hover:bg-purple-100"
                  }`}
                >
                  Pilih Paket Lengkap
                </button>
              </div>
            </div>
          </div>

          {/* Apa yang akan didapatkan */}
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Apa yang akan kamu dapatkan?
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedAsesmen.onlineBenefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#561269]/10 flex items-center justify-center shrink-0 mt-0.5 text-[#561269]">
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="text-gray-600 text-xs sm:text-sm font-medium leading-relaxed">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Panduan Pengisian Asesmen Online (Box Oranye Khas Psikotes) */}
          <div>
            <h2 className="text-xl lg:text-2xl font-extrabold text-[#d97706] mb-5 flex items-center gap-3 tracking-tight">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              Panduan Pengisian Asesmen
            </h2>
            <div className="bg-orange-50 rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-sm">
              <ul className="space-y-4">
                {selectedAsesmen.guidelines.map((guide, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-black text-[#d97706] shadow-sm shrink-0 text-sm">
                      {idx + 1}
                    </span>
                    <span className="text-gray-700 leading-relaxed pt-1 font-medium text-xs sm:text-sm">
                      {guide}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-5 border-t border-orange-200">
                <p className="text-gray-700 font-bold text-xs sm:text-sm text-center">
                  Selamat mengerjakan! Semoga asesmen ini membantu Anda menggali potensi diri secara optimal.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Sticky Sidebar (Persis Psikotes Detail) */}
        <div className="lg:w-1/3 w-full sticky top-[120px]">
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-lg border border-gray-100 flex flex-col gap-6">
            {/* Info Jumlah Soal & Format */}
            <div className="flex items-center gap-3.5 bg-[#f8f9fa] p-4 rounded-2xl border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#561269] shadow-xs shrink-0">
                <FileQuestion className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-medium">Format Tes Digital</p>
                <p className="text-sm font-bold text-gray-900 leading-tight">
                  {selectedAsesmen.questions} ({selectedAsesmen.duration})
                </p>
              </div>
            </div>

            {/* Box Detail Paket Terpilih */}
            {selectedOnlinePlan === "berbayar" ? (
              <div className="flex flex-col gap-5 p-5 rounded-2xl bg-gradient-to-b from-purple-50/60 to-white border border-purple-100">
                <div>
                  <div className="mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#561269] bg-purple-100 px-2.5 py-0.5 rounded-md">
                      Laporan Lengkap (PDF)
                    </span>
                  </div>
                  <div className="pt-2">
                    <span className="text-[11px] text-gray-500 block">Total Biaya Akses Online</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-[#561269] tracking-tight">
                        {selectedAsesmen.onlinePrice}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">/ 1x asesmen</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border-t border-purple-100/80 pt-3 text-xs text-gray-700">
                  <p className="font-bold text-gray-900">Termasuk dalam paket ini:</p>
                  {selectedAsesmen.onlineBenefits.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#561269] shrink-0 mt-0.5" />
                      <span className="leading-snug">{item}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href={onlineCheckoutUrl as any}
                  className="w-full flex items-center justify-center gap-2 py-3.5 sm:py-4 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 font-extrabold text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-lg active:scale-98 cursor-pointer"
                >
                  <span>Lanjut ke Pembayaran</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-5 p-5 rounded-2xl bg-emerald-50/40 border border-emerald-100">
                <div>
                  <div className="mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                      Skrining Mandiri
                    </span>
                  </div>
                  <div className="pt-2">
                    <span className="text-[11px] text-gray-500 block">Biaya Akses</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">
                        Rp 0
                      </span>
                      <span className="text-xs text-gray-400 font-medium">/ Tanpa Biaya</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border-t border-emerald-100 pt-3 text-xs text-gray-700">
                  <p className="font-bold text-gray-900">Termasuk dalam paket gratis:</p>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Akses pengerjaan asesmen online</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Ringkasan skor dan interpretasi dasar</span>
                  </div>
                </div>

                <Link
                  href={withBiro(`/psikotes`) as any}
                  className="w-full flex items-center justify-center gap-2 py-3.5 sm:py-4 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 font-extrabold text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-lg active:scale-98 cursor-pointer"
                >
                  <span>Mulai Asesmen Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

