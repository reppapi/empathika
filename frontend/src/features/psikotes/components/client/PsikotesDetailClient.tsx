"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { TEST_DATA, UNIVERSAL_PAID_BENEFITS, UNIVERSAL_FREE_BENEFITS } from "../../data/psikotesData";
import { psikotesService, type PaketPsikotesApiResponse } from "@/services/psikotes.service";
import { Check, ShieldCheck, FileQuestion, ArrowRight } from "lucide-react";

export default function PsikotesDetailClient({ params }: { params: { testId: string } }) {
  const fallback = TEST_DATA[params.testId as keyof typeof TEST_DATA] || TEST_DATA["mbti"];
  const [apiData, setApiData] = useState<PaketPsikotesApiResponse | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<"gratis" | "berbayar">("gratis");

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await psikotesService.getById(params.testId);
        if (res && res.success && res.data) {
          setApiData(res.data);
        }
      } catch (err) {
        // Fallback to static mock if testId is mock key
      }
    };
    fetchDetail();
  }, [params.testId]);

  const hasPaidPackage = apiData
    ? (apiData.jenis_akses === "BERBAYAR" || (typeof apiData.harga === "number" && apiData.harga > 0))
    : (fallback.price > 0);

  useEffect(() => {
    if (!hasPaidPackage && selectedPlan === "berbayar") {
      setSelectedPlan("gratis");
    }
  }, [hasPaidPackage, selectedPlan]);

  const data = apiData
    ? {
        title: apiData.judul,
        subtitle: apiData.deskripsi || "Asesmen psikologi terstruktur untuk mengenali diri.",
        image: apiData.banner_url || fallback.image,
        description: apiData.deskripsi || fallback.description,
        duration: "15 Menit",
        questions: `${apiData.soal_psikotes?.length || 0} Pertanyaan`,
        price: apiData.harga || 0,
        formattedPrice: apiData.harga ? `Rp ${apiData.harga.toLocaleString("id-ID")}` : "Gratis",
        benefits: Array.isArray(apiData.benefits)
          ? (apiData.benefits as string[]).filter((b) => typeof b === "string" && b.trim().length > 0)
          : (fallback.benefits || []),
        guidelines: fallback.guidelines,
        freeBenefits: UNIVERSAL_FREE_BENEFITS,
        paidBenefits: UNIVERSAL_PAID_BENEFITS,
        paidPackageName: "Laporan Hasil Psikotes Lengkap (PDF)",
      }
    : {
        ...fallback,
        freeBenefits: UNIVERSAL_FREE_BENEFITS,
        paidBenefits: UNIVERSAL_PAID_BENEFITS,
      };

const checkoutUrl = `/psikotes/checkout?testId=${params.testId}&judul=${encodeURIComponent(data.title + ' (Paket Lengkap)')}&harga=${encodeURIComponent(data.formattedPrice)}&kategori=Psikotes&subjudul=${encodeURIComponent('Akses paket tes psikotes lengkap beserta laporan analisis profesional.')}`;

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
                    <p className="text-xs font-bold text-gray-800 mb-3">
                      Ringkasan Hasil Psikotes (Online)
                    </p>
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
                  onClick={() => {
                    if (hasPaidPackage) setSelectedPlan("berbayar");
                  }}
                  className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between relative overflow-hidden ${
                    !hasPaidPackage
                      ? "opacity-55 bg-gray-50 border-gray-200 cursor-not-allowed select-none"
                      : selectedPlan === "berbayar" 
                        ? "border-[#561269] bg-white shadow-md ring-2 ring-[#561269]/10 cursor-pointer" 
                        : "border-gray-200 bg-white/70 hover:border-gray-300 cursor-pointer"
                  }`}
                >
                  <div className={`absolute top-0 right-0 font-extrabold text-[10px] px-3 py-1 rounded-bl-xl uppercase tracking-wider ${
                    !hasPaidPackage ? "bg-gray-200 text-gray-500" : "bg-[#EAB308] text-gray-950"
                  }`}>
                    {hasPaidPackage ? "Rekomendasi" : "Belum Tersedia"}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        !hasPaidPackage
                          ? "text-gray-400 bg-gray-100 border-gray-200"
                          : "text-[#561269] bg-purple-50 border-purple-200"
                      }`}>
                        Paket Lengkap
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className={`text-2xl font-black ${!hasPaidPackage ? "text-gray-400" : "text-[#561269]"}`}>
                        {hasPaidPackage ? data.formattedPrice : "Rp 0"}
                      </span>
                      {hasPaidPackage && (
                        <span className="text-xs text-gray-400 font-semibold">/ satu kali tes</span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-gray-800 mb-3">
                      {hasPaidPackage 
                        ? "Laporan Hasil Psikotes Lengkap (PDF)" 
                        : "Paket asesmen ini saat ini hanya tersedia untuk akses gratis."}
                    </p>
                    <ul className="space-y-2 text-xs text-gray-700 mb-4">
                      {data.paidBenefits.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${!hasPaidPackage ? "text-gray-300" : "text-[#561269]"}`} />
                          <span className={!hasPaidPackage ? "text-gray-400" : "text-gray-700"}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    type="button"
                    disabled={!hasPaidPackage}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (hasPaidPackage) setSelectedPlan("berbayar");
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition ${
                      !hasPaidPackage
                        ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                        : selectedPlan === "berbayar" 
                          ? "bg-[#561269] text-white cursor-pointer" 
                          : "bg-purple-50 text-[#561269] hover:bg-purple-100 cursor-pointer"
                    }`}
                  >
                    {hasPaidPackage ? "Pilih Paket Berbayar" : "Hanya Tersedia Akses Gratis"}
                  </button>
                </div>
              </div>
            </div>

            {/* Benefits Umum (Apa yang akan kamu dapatkan) */}
            {data.benefits && data.benefits.length > 0 && (
              <>
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
              </>
            )}

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

                  {hasPaidPackage && (
                    <button
                      type="button"
                      onClick={() => setSelectedPlan("berbayar")}
                      className="text-xs text-[#561269] font-bold text-center hover:underline cursor-pointer"
                    >
                      Ingin laporan analisis lengkap? Pilih Paket Berbayar ({data.formattedPrice})
                    </button>
                  )}
                </div>
              )}
              
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
