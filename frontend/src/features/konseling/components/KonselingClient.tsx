"use client"

import Link from "next/link"
import { KONSELING_DATA } from "../data/konselingData"

export default function KonselingClient() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 pt-32 pb-12 lg:pt-36 lg:pb-20 font-poppins">

      {/* Judul Utama */}
      <h1 className="mb-8 text-center text-2xl font-bold text-[#561269] sm:text-3xl lg:mb-12 lg:text-[32px]">
        Mulai jadwalkan konsultasi dengan kami!
      </h1>

      {/* Container Putih */}
      <div className="rounded-[2rem] border border-gray-100 bg-white p-6 sm:p-8 lg:p-12 shadow-sm">

        {/* Grid Kartu */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {KONSELING_DATA.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
            >
              <div className={`h-40 sm:h-48 w-full ${item.bgColor} overflow-hidden relative shrink-0`}>
                <div className="absolute inset-0 flex items-start p-6">
                  <div className="text-left w-full">
                    <h3 className={`${item.titleColor} font-extrabold text-[22px] sm:text-[28px] leading-[1.1] mb-2 drop-shadow-sm uppercase`}>{item.topTitle}</h3>
                    <p className={`${item.titleColor} text-xs sm:text-sm font-medium drop-shadow-sm opacity-90`}>{item.topSubtitle}</p>
                  </div>
                </div>
                
                {/* Shapes */}
                {item.shape === "circles" && (
                  <div className="absolute -bottom-4 right-0 opacity-40 mix-blend-overlay">
                     <svg width="200" height="150" viewBox="0 0 200 150" fill="none"><circle cx="150" cy="100" r="80" fill="white"/><circle cx="50" cy="120" r="50" fill="white"/></svg>
                  </div>
                )}
                {item.shape === "circles-dark" && (
                  <div className="absolute -bottom-4 right-0 opacity-20 mix-blend-overlay">
                     <svg width="200" height="150" viewBox="0 0 200 150" fill="none"><circle cx="150" cy="100" r="80" fill="black"/><circle cx="50" cy="120" r="50" fill="black"/></svg>
                  </div>
                )}
                {item.shape === "heart" && (
                  <div className="absolute bottom-4 right-10">
                     <svg className="w-16 h-16 text-pink-300 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  </div>
                )}
              </div>
              
              <div className="p-5 sm:p-6 flex flex-col flex-1">
                <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-2 leading-tight line-clamp-2">{item.bottomTitle}</h3>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-6">{item.bottomDescription}</p>
                
                <div className="mt-auto pt-2">
                  <Link href="/booking" className="w-full flex items-center justify-center py-2.5 sm:py-3 rounded-full bg-[#EAB308] text-black font-bold text-xs sm:text-sm hover:bg-yellow-500 transition-colors shadow-sm">
                    {item.btnText}
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
