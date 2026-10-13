import Image from "next/image";
import Link from "next/link";

import { TEST_DATA } from "../../data/psikotesData";

export default function PsikotesDetailClient({ params }: { params: { testId: string } }) {
  // Gunakan fallback "mbti" jika testId tidak ada di mock data
  const data = TEST_DATA[params.testId as keyof typeof TEST_DATA] || TEST_DATA["mbti"];

  return (
    // Kita meniadakan padding atas agar banner memenuhi ruang di bawah navbar yang transparan
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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight max-w-4xl leading-[1.1] drop-shadow-md">
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
          <div className="lg:w-2/3 bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 flex flex-col gap-12">
            
            {/* Overview */}
            <div>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-[#561269] mb-5 tracking-tight">Tentang Tes Ini</h2>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed font-light">
                {data.description}
              </p>
            </div>

            {/* Benefits */}
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

          {/* Right Column: Sticky Sidebar with CTA */}
          <div className="lg:w-1/3 w-full sticky top-[120px]">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-lg border border-gray-100 flex flex-col gap-8">
              
              {/* Meta info */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-5 bg-[#f8f9fa] p-5 rounded-2xl">
                  <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center text-[#561269] shadow-sm">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-0.5">Estimasi Waktu</p>
                    <p className="text-xl font-bold text-gray-900 tracking-tight">{data.duration}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-5 bg-[#f8f9fa] p-5 rounded-2xl">
                  <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center text-[#561269] shadow-sm">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-0.5">Jumlah Soal</p>
                    <p className="text-xl font-bold text-gray-900 tracking-tight">{data.questions}</p>
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Pricing / Free info */}
              <div className="text-center">
                <span className="inline-block px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-widest mb-3">Akses Gratis</span>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">Tes ini dapat diakses dan diselesaikan secara gratis oleh seluruh pengguna Empathika.</p>
              </div>

              {/* CTA Button */}
              <Link 
                href={`/psikotes/${params.testId}/mulai`}
                className="w-full flex items-center justify-center py-5 rounded-[1.25rem] bg-[#561269] hover:bg-[#763E8B] text-white font-extrabold text-lg transition-all duration-300 shadow-md hover:shadow-[0_8px_20px_rgba(86,18,105,0.25)] hover:-translate-y-1"
              >
                Mulai Tes Sekarang
              </Link>
              
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

