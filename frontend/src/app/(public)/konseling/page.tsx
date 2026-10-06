"use client"

import Link from "next/link"

const KONSELING_DATA = Array(9).fill({
  title: "Konsultasi individu/kelompok",
  description: "Lorem ipsum dolor sit amet, consectetur . Lorem ipsum dolor sit amet, consectetur",
})

export default function KonselingPage() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 pt-32 pb-12 lg:pt-36 lg:pb-20 font-poppins">
      
      {/* Judul Utama */}
      <h1 className="mb-8 text-center text-2xl font-bold text-[#561269] sm:text-3xl lg:mb-12 lg:text-[32px]">
        Mulai jadwalkan konsultasi dengan kami!
      </h1>

      {/* Container Putih */}
      <div className="rounded-[2rem] border border-gray-200 bg-white p-6 sm:p-8 lg:p-12 shadow-sm">
        
        {/* Grid Kartu */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {KONSELING_DATA.map((item, index) => (
            <div 
              key={index} 
              className="flex flex-col rounded-[1.25rem] border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
            >
              {/* Image Placeholder */}
              <div className="mb-5 h-44 w-full bg-gray-300 rounded-md"></div>
              
              {/* Text Content */}
              <div className="flex flex-1 flex-col">
                <h3 className="mb-3 text-[15px] font-bold leading-snug text-black">
                  {item.title}
                </h3>
                <p className="mb-8 text-[11px] leading-relaxed text-gray-800">
                  {item.description}
                </p>
                
                {/* Button */}
                <div className="mt-auto flex justify-center">
                  <Link 
                    href="/booking"
                    className="flex h-9 w-[85%] items-center justify-center gap-3 rounded-full bg-[#EAB308] px-4 transition-transform hover:scale-105"
                  >
                    <span className="text-[12px] font-medium text-black">Booking Sesi</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3.5 w-3.5 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
