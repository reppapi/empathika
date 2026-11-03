"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { UNIVERSAL_PAID_BENEFITS, UNIVERSAL_FREE_BENEFITS } from "../../data/psikotesData";
import { psikotesService, type PaketPsikotesApiResponse } from "@/services/psikotes.service";
import { Check, FileQuestion, ArrowRight, Loader2, AlertCircle } from "lucide-react";

const DEFAULT_GUIDELINES = [
  "Jawab setiap pertanyaan dengan jujur sesuai dengan dirimu. Tidak ada jawaban benar atau salah.",
  "Tidak ada batas waktu, jadi kerjakan dengan santai dan nyaman.",
  "Selesaikan tes dalam satu sesi karena progres akan hilang jika keluar.",
  "Setelah selesai, kamu akan mendapatkan laporan hasil tes.",
];

const DEFAULT_BANNER = "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80";

export default function PsikotesDetailClient({ params }: { params: { testId: string } }) {
  const [apiData, setApiData] = useState<PaketPsikotesApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await psikotesService.getById(params.testId);
        if (res && res.success && res.data) {
          setApiData(res.data);
        }
      } catch (err) {
        // Paket not found or network error
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [params.testId]);

  const isPaidPackage = Boolean(
    apiData && (apiData.jenis_akses === "BERBAYAR" || (typeof apiData.harga === "number" && apiData.harga > 0))
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fbfbfb] flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-[#561269] mb-4" />
        <p className="text-sm text-gray-500 font-medium">Memuat detail psikotes...</p>
      </div>
    );
  }

  if (!apiData) {
    return (
      <div className="min-h-screen bg-[#fbfbfb] font-sans pt-[120px] pb-12 px-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Paket Tidak Ditemukan</h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Paket psikotes yang Anda cari tidak tersedia atau belum dipublikasikan.
          </p>
          <Link
            href="/psikotes"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#561269] text-white text-xs font-bold hover:bg-[#763E8B] transition shadow-sm"
          >
            Kembali ke Daftar Psikotes
          </Link>
        </div>
      </div>
    );
  }

  const data = {
    title: apiData.judul || "Tes Tingkat Kecemasan",
    subtitle:
      apiData.deskripsi ||
      "Kenali kondisi kecemasanmu dan pahami bagaimana perasaan serta pikiranmu dalam menjalani aktivitas sehari-hari. Melalui tes ini, kamu dapat memperoleh gambaran mengenai tingkat kecemasan yang kamu alami berdasarkan kondisi selama dua minggu terakhir.",
    image: apiData.banner_url || DEFAULT_BANNER,
    description:
      apiData.tentang_tes ||
      "Melalui tes ini, kamu bisa mengenali gejala kecemasan yang mungkin sedang dialami, seperti perasaan gelisah, kesulitan mengendalikan kekhawatiran, hingga ketegangan dalam menjalani aktivitas sehari-hari. Hasilnya dapat membantumu memahami kondisi emosional diri dan menjadi langkah awal untuk lebih memperhatikan kesehatan mental.",
    questions: `${apiData.soal_psikotes?.length || 0} Pertanyaan`,
    price: apiData.harga || 0,
    formattedPrice: apiData.harga ? `Rp ${apiData.harga.toLocaleString("id-ID")}` : "Gratis",
    guidelines: DEFAULT_GUIDELINES,
    freeBenefits: UNIVERSAL_FREE_BENEFITS,
    paidBenefits: UNIVERSAL_PAID_BENEFITS,
    paidPackageName: "Laporan Hasil Psikotes Lengkap (PDF)",
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
          <div className="px-6 sm:px-8 md:px-10">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight max-w-4xl leading-[1.1] drop-shadow-md">
              {data.title}
            </h1>
            <p className="text-gray-200 text-base md:text-xl font-light max-w-full drop-shadow-sm leading-relaxed">
              {data.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTENT AREA */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Description & Guidelines */}
          <div className="lg:w-2/3 bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm border border-gray-100 flex flex-col gap-8">
            
            {/* Overview */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#561269] mb-3.5 tracking-tight">Tentang Tes Ini</h2>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-normal">
                {data.description}
              </p>
            </div>

            {/* Guidelines */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3.5 flex items-center gap-2 tracking-tight">
                <svg className="w-5 h-5 text-[#d97706]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                Panduan Pengisian
              </h2>
              <div className="bg-amber-50/60 rounded-2xl p-5 sm:p-6 border border-amber-100 shadow-xs">
                <ul className="space-y-3">
                  {data.guidelines.map((guide, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-[#d97706] shadow-xs shrink-0 text-xs border border-amber-200/50 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-gray-700 leading-relaxed text-sm font-normal">{guide}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-3.5 border-t border-amber-200/50">
                  <p className="text-gray-600 text-xs sm:text-sm font-medium leading-relaxed text-center">
                    Selamat mengerjakan! Semoga tes ini membantu kamu lebih mengenal kondisi emosionalmu.
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

              {/* Detail Plan Berbayar atau Gratis */}
              {isPaidPackage ? (
                /* Detail Plan Berbayar */
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
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 font-extrabold text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-lg active:scale-98 cursor-pointer"
                  >
                    <span>Mulai Tes Gratis</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
              
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
