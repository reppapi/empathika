"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { CATEGORIES, SERVICES_DATA } from "../data/layananData"

export default function LayananClient() {
  const [activeCategory, setActiveCategory] = useState("02") // Default ke Konsultasi sesuai gambar

  const renderServiceCard = (service: any, idx: number) => {
    return (
      <div key={idx} className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
        <div className={`h-36 sm:h-44 w-full ${service.bgColor} overflow-hidden relative shrink-0`}>
          <div className="absolute inset-0 flex items-start p-6">
            <div className="text-left w-full">
              <h3 className={`${service.titleColor} font-extrabold text-[22px] sm:text-[28px] leading-[1.1] mb-2 drop-shadow-sm uppercase`}>{service.topTitle}</h3>
              <p className={`${service.titleColor} text-xs sm:text-sm font-medium drop-shadow-sm opacity-90`}>{service.topSubtitle}</p>
            </div>
          </div>

          {/* Shapes */}
          {service.shape === "circles" && (
            <div className="absolute -bottom-4 right-0 opacity-40 mix-blend-overlay">
              <svg width="200" height="150" viewBox="0 0 200 150" fill="none"><circle cx="150" cy="100" r="80" fill="white" /><circle cx="50" cy="120" r="50" fill="white" /></svg>
            </div>
          )}
          {service.shape === "circles-dark" && (
            <div className="absolute -bottom-4 right-0 opacity-20 mix-blend-overlay">
              <svg width="200" height="150" viewBox="0 0 200 150" fill="none"><circle cx="150" cy="100" r="80" fill="black" /><circle cx="50" cy="120" r="50" fill="black" /></svg>
            </div>
          )}
          {service.shape === "heart" && (
            <div className="absolute bottom-4 right-10">
              <svg className="w-16 h-16 text-pink-300 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
            </div>
          )}
        </div>

        <div className="p-5 sm:p-6 flex flex-col flex-1">
          <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-2 leading-tight line-clamp-2">{service.bottomTitle}</h3>
          <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-6">{service.bottomDescription}</p>

          <div className="mt-auto pt-2">
            <Link href="/booking" className="w-full flex items-center justify-center py-2.5 sm:py-3 rounded-full bg-[#EAB308] text-black font-bold text-xs sm:text-sm hover:bg-yellow-500 transition-colors shadow-sm">
              {service.btnText}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const renderEventCard = (event: any, idx: number) => {
    return (
      <div key={idx} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group h-full">
        <div className="relative h-40 sm:h-48 w-full shrink-0 overflow-hidden">
          <Image unoptimized src={event.image} alt="Event" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className={`absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-extrabold ${event.typeColor} shadow-sm uppercase tracking-wider`}>{event.type}</div>
        </div>
        <div className="p-4 sm:p-5 flex flex-col flex-1">
          <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2 line-clamp-2 leading-tight">{event.title}</h3>

          <div className="space-y-1.5 mb-4">
            <div className="flex items-center text-xs text-gray-500">
              <svg className="w-4 h-4 mr-2 text-[#d97706]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              {event.date}
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <svg className="w-4 h-4 mr-2 text-[#d97706]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {event.time}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 overflow-hidden shrink-0 relative"><Image unoptimized src={event.speakerImg} alt="Speaker" fill className="object-cover" /></div>
            <div className="text-[11px] sm:text-xs">
              <p className="font-bold text-gray-900">{event.speakerName}</p>
              <p className="text-gray-500">{event.speakerRole}</p>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">Harga Tiket</p>
              <p className="text-sm sm:text-base font-black text-[#561269]">{event.price}</p>
            </div>
            <button className="bg-[#561269] hover:bg-[#763E8B] text-white text-xs font-bold py-2 px-4 sm:px-5 rounded-xl transition-colors shrink-0">Daftar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 pt-24 pb-4 lg:pt-[104px] lg:pb-8 lg:h-screen lg:overflow-hidden font-poppins">

      {/* Container utama */}
      <div className="relative flex h-full flex-col gap-8 lg:block">

        {/* Kolom Kiri: Daftar Kategori (TIDAK BISA SCROLL) */}
        <div className="flex shrink-0 flex-col gap-3 lg:w-1/3 lg:gap-5 lg:pb-2">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="group flex flex-col items-start text-left transition-all"
              >
                <span
                  className={`font-bold transition-all duration-300 ease-out ${isActive ? "text-[28px] text-[#EAB308]" : "text-[22px] text-[#EAB308]/40"
                    }`}
                >
                  {cat.id}
                </span>
                <span
                  className={`transition-all duration-300 ease-out ${isActive
                    ? "text-[34px] font-bold text-[#561269]"
                    : "text-[24px] font-semibold text-[#B385C0] group-hover:text-[#763E8B]"
                    }`}
                >
                  {cat.title}
                </span>
              </button>
            )
          })}
        </div>

        {/* Kolom Kanan: Detail Layanan (BISA SCROLL INTERNAL) */}
        <div className="flex w-full flex-col overflow-visible py-3 lg:absolute lg:top-0 lg:right-0 lg:w-[62%] lg:h-full lg:py-0">
          {/* Card Utama */}
          <div className="flex h-full flex-col rounded-[2rem] border border-gray-100 bg-white shadow-sm p-6 sm:p-8">

            {/* Header Card Utama */}
            <div className="mb-6 shrink-0">
              <h2 className="text-2xl font-bold text-[#561269] sm:text-3xl">
                {CATEGORIES.find(c => c.id === activeCategory)?.title}
              </h2>
              <p className="mt-1 text-sm font-medium text-[#561269]">
                pilih jenis {CATEGORIES.find(c => c.id === activeCategory)?.title.toLowerCase()} yang anda mau
              </p>
            </div>

            {/* Area Konten Scrollable */}
            <div className="flex-1 overflow-y-auto pl-4 -ml-4 pt-4 -mt-4 pr-4 -mr-2 pb-6 custom-scrollbar">
              {/* Grid Layanan Kecil */}
              {SERVICES_DATA[activeCategory]?.length > 0 ? (
                <div className={`grid grid-cols-1 ${activeCategory === '04' ? 'lg:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-2'} gap-6`}>
                  {SERVICES_DATA[activeCategory].map((item, idx) =>
                    activeCategory === '04' ? renderEventCard(item, idx) : renderServiceCard(item, idx)
                  )}
                </div>
              ) : (
                <div className="flex h-full min-h-[200px] items-center justify-center rounded-xl bg-white text-gray-500 shadow-sm border border-gray-100">
                  Konten untuk {CATEGORIES.find(c => c.id === activeCategory)?.title} belum tersedia.
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
