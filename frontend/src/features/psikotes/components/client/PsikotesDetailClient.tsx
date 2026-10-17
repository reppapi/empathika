"use client"

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TEST_DATA } from "../../data/psikotesData";
import { Check, ShieldCheck, FileQuestion, ArrowRight } from "lucide-react";

export default function PsikotesDetailClient({ params }: { params: { testId: string } }) {
  // Gunakan fallback "mbti" jika testId tidak ada di mock data
  const data = TEST_DATA[params.testId as keyof typeof TEST_DATA] || TEST_DATA["mbti"];
  const [selectedPlan, setSelectedPlan] = useState<"gratis" | "berbayar">("berbayar");

  const checkoutUrl = `/event/checkout?judul=${encodeURIComponent(data.title + ' (Paket Lengkap)')}&harga=${encodeURIComponent(data.formattedPrice)}&kategori=Psikotes&subjudul=${encodeURIComponent('Akses paket tes psikotes lengkap beserta laporan analisis profesional.')}`;

  return (
    <div className="w-full font-sans bg-[#f8f9fa] pb-24">
      
      {/* 1. HERO BANNER */}
      <section className="relative w-full h-[400px] lg:h-[500px] bg-[#1c352d]">
        <Image 
          src={data.image} 
          alt={data.title}
          fill
          className="object-cover opacity-50 mix-blend-overlay"
          priority
          unoptimized
        />
        {/* Overlay gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
        
        <div className="absolute inset-0 flex flex-col justify-end pb-16 lg:pb-20 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight max-w-4xl leading-[1.1] drop-shadow-md">
            {data.title}
          </h1>
          <p className="text-gray-200 text-base md:text-xl font-light max-w-2xl drop-shadow-sm">
            {data.subtitle}
          </p>
        </div>
      </section>

      {/* 2. MAIN CONTENT AREA */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Description & Guidelines */}
          <div className="lg:w-2/3 bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 flex flex-col gap-10">
            
            {/* Overview */}
            <div>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-[#561269] mb-5 tracking-tight">Tentang Tes Ini</h2>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed font-light">
                {data.description}
              </p>
            </div>

            {/* Perbandingan Pilihan Paket (Gratis vs Berbayar) */}
            <div className="p-6 md:p-8 rounded-3xl bg-gray-50 border border-gray-200/80">
              <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#561269]" />
                Pilihan Akses Tes: Gratis &amp; Berbayar
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Kamu dapat memilih antara pengerjaan gratis untuk hasil ringkas atau paket berbayar untuk hasil analisis komprehensif.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Kartu Ringkasan Gratis */}
                <div 
                  onClick={() => setSelectedPlan("gratis")}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    selectedPlan === "gratis" 
                      ? "border-emerald-500 bg-white shadow-md ring-2 ring-emerald-500/10" 
                      : "border-gray-200 bg-white/70 hover:border-gray-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Akses Gratis
                      </span>
                      {selectedPlan === "gratis" && (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 stroke-[3]" /> Dipilih
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className="text-2xl font-black text-gray-900">Rp 0</span>
                      <span className="text-xs text-gray-400 font-semibold">/ Gratis</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">Cocok untuk pengenalan diri cepat tanpa biaya.</p>
                    <ul className="space-y-2 text-xs text-gray-600 mb-4">
                      {data.freeBenefits.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlan("gratis");
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition ${
                      selectedPlan === "gratis" 
                        ? "bg-emerald-600 text-white" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Pilih Paket Gratis
                  </button>
                </div>

                {/* Kartu Ringkasan Berbayar */}
                <div 
                  onClick={() => setSelectedPlan("berbayar")}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                    selectedPlan === "berbayar" 
                      ? "border-[#561269] bg-white shadow-md ring-2 ring-[#561269]/10" 
                      : "border-gray-200 bg-white/70 hover:border-gray-300"
                  }`}
                >
                  <div className="absolute top-0 right-0 bg-[#EAB308] text-gray-950 font-extrabold text-[10px] px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                    Rekomendasi
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#561269] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                        Paket Lengkap
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className="text-2xl font-black text-[#561269]">{data.formattedPrice}</span>
                      <span className="text-xs text-gray-400 font-semibold">/ satu kali tes</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">Laporan analisis lengkap &amp; komprehensif (PDF).</p>
                    <ul className="space-y-2 text-xs text-gray-700 mb-4">
                      {data.paidBenefits.map((item, idx) => (
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
                      e.stopPropagation();
                      setSelectedPlan("berbayar");
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition ${
                      selectedPlan === "berbayar" 
                        ? "bg-[#561269] text-white" 
                        : "bg-purple-50 text-[#561269] hover:bg-purple-100"
                    }`}
                  >
                    Pilih Paket Berbayar
                  </button>
                </div>
              </div>
            </div>

            {/* Benefits Umum */}
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Apa yang akan kamu dapatkan?</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {data.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#561269]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-[#561269]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <span className="text-gray-600 font-medium leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <hr className="border-gray-100" />

            {/* Guidelines */}
            <div>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-[#d97706] mb-6 flex items-center gap-3 tracking-tight">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                Panduan Pengisian
              </h2>
              <div className="bg-orange-50 rounded-3xl p-8 md:p-10 border border-orange-100 shadow-sm">
                <ul className="space-y-4">
                  {data.guidelines.map((guide, idx) => (
                    <li key={idx} className="flex items-start gap-5">
                      <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-black text-[#d97706] shadow-sm shrink-0 text-lg">
                        {idx + 1}
                      </span>
                      <span className="text-gray-700 leading-relaxed pt-1.5 font-medium text-base md:text-lg">{guide}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 pt-6 border-t border-orange-200">
                  <p className="text-gray-700 font-bold text-base md:text-lg leading-relaxed text-center">
                    Selamat mengerjakan! Semoga tes ini membantu kamu lebih mengenal diri sendiri.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Sidebar with Interactive CTA */}
          <div className="lg:w-1/3 w-full sticky top-[120px]">
            <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-lg border border-gray-100 flex flex-col gap-6">
              
              {/* Info Jumlah Soal */}
              <div className="flex items-center gap-3.5 bg-[#f8f9fa] p-4 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#561269] shadow-xs shrink-0">
                  <FileQuestion className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Jumlah Soal</p>
                  <p className="text-sm font-bold text-gray-900 leading-tight">{data.questions}</p>
                </div>
              </div>

              {/* Detail Plan Berbayar atau Gratis (Menyesuaikan otomatis dari klikan Pilihan Akses Tes) */}

              {/* Detail Plan Berbayar */}
              {selectedPlan === "berbayar" ? (
                <div className="flex flex-col gap-5 p-5 rounded-2xl bg-gradient-to-b from-purple-50/60 to-white border border-purple-100">
                  <div>
                    <div className="mb-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#561269] bg-purple-100 px-2.5 py-0.5 rounded-md">
                        {data.paidPackageName}
                      </span>
                    </div>

                    <div className="pt-2">
                      <span className="text-[11px] text-gray-500 block">Total Biaya Akses</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl sm:text-4xl font-extrabold text-[#561269] tracking-tight">
                          {data.formattedPrice}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">/ 1x tes</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-purple-100/80 pt-3 text-xs text-gray-700">
                    <p className="font-bold text-gray-900">Termasuk dalam paket ini:</p>
                    {data.paidBenefits.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#561269] shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button Berbayar */}
                  <Link 
                    href={checkoutUrl as any}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 font-extrabold text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-lg active:scale-98 cursor-pointer"
                  >
                    <span>Lanjut ke Pembayaran</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <p className="text-[11px] text-gray-400 text-center">
                    Pembayaran aman via QRIS, Bank Transfer, dan E-Wallet resmi.
                  </p>
                </div>
              ) : (
                /* Detail Plan Gratis */
                <div className="flex flex-col gap-5 p-5 rounded-2xl bg-emerald-50/40 border border-emerald-100">
                  <div>
                    <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md mb-2">
                      Akses Standar Empathika
                    </span>
                    <div>
                      <span className="text-[11px] text-gray-500 block">Biaya Pengerjaan</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl sm:text-4xl font-extrabold text-emerald-700 tracking-tight">
                          Rp 0
                        </span>
                        <span className="text-xs text-emerald-600 font-bold uppercase">Gratis</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-emerald-100 pt-3 text-xs text-gray-700">
                    <p className="font-bold text-gray-900">Fitur akses gratis:</p>
                    {data.freeBenefits.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button Gratis */}
                  <Link 
                    href={`/psikotes/${params.testId}/mulai`}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#561269] hover:bg-[#763E8B] text-white font-extrabold text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-lg active:scale-98 cursor-pointer"
                  >
                    <span>Mulai Tes Gratis</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setSelectedPlan("berbayar")}
                    className="text-xs text-[#561269] font-bold text-center hover:underline cursor-pointer"
                  >
                    Ingin laporan analisis lengkap? Pilih Paket Berbayar ({data.formattedPrice})
                  </button>
                </div>
              )}
              
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
