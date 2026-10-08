"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

const CATEGORIES = [
  { id: "01", title: "Psikotes" },
  { id: "02", title: "Konsultasi" },
  { id: "03", title: "Pelatihan peer helper" },
  { id: "04", title: "Event" },
  { id: "05", title: "Asesmen" },
]

const KONSULTASI_SERVICES = [
  {
    title: "Konsultasi individu/kelompok",
    description: "Lorem ipsum dolor sit amet, consectetur. Lorem ipsum dolor sit amet, consectetur",
  },
  {
    title: "Peer Konselor",
    description: "Lorem ipsum dolor sit amet, consectetur. Lorem ipsum dolor sit amet, consectetur",
  },
  {
    title: "Hipnoterapi",
    description: "Lorem ipsum dolor sit amet, consectetur. Lorem ipsum dolor sit amet, consectetur",
  },
  {
    title: "Home Visit",
    description: "Lorem ipsum dolor sit amet, consectetur. Lorem ipsum dolor sit amet, consectetur",
  },
]

// Mapping data layanan ke masing-masing kategori
const SERVICES_DATA: Record<string, { title: string; description: string }[]> = {
  "01": [], // Data Psikotes (tambahkan di sini)
  "02": KONSULTASI_SERVICES,
  "03": [], // Data Pelatihan (tambahkan di sini)
  "04": [], // Data Event (tambahkan di sini)
  "05": [], // Data Asesmen (tambahkan di sini)
}

export default function LayananPage() {
  const [activeCategory, setActiveCategory] = useState("02") // Default ke Konsultasi sesuai gambar

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 pt-24 pb-4 lg:pt-[104px] lg:pb-8 lg:h-screen font-poppins overflow-hidden">
      
      {/* Container utama (Terbatas 1 layar) */}
      <div className="flex h-full flex-col gap-8 lg:flex-row lg:gap-16 items-start">
        
        {/* Kolom Kiri: Daftar Kategori (TIDAK BISA SCROLL) */}
        <div className="flex shrink-0 flex-col gap-3 lg:w-1/3 lg:gap-5">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="group flex flex-col items-start text-left transition-all"
              >
                <span 
                  className={`font-bold transition-all duration-300 ease-out ${
                    isActive ? "text-[28px] text-[#EAB308]" : "text-[22px] text-[#EAB308]/40"
                  }`}
                >
                  {cat.id}
                </span>
                <span 
                  className={`transition-all duration-300 ease-out ${
                    isActive 
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
        <div className="flex h-full flex-1 w-full flex-col overflow-hidden">
          {/* Card Utama */}
          <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            
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
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {/* Grid Layanan Kecil */}
              {SERVICES_DATA[activeCategory]?.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 pb-4">
                  {SERVICES_DATA[activeCategory].map((service, idx) => (
                    <div 
                      key={idx}
                      className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                    >
                      {/* Placeholder Gambar (Abu-abu) */}
                      <div className="h-40 w-full bg-gray-300 sm:h-44 p-4">
                        <div className="h-full w-full bg-gray-300"></div>
                      </div>
                      
                      {/* Konten Text */}
                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="mb-2 text-[15px] font-bold leading-snug text-black">
                          {service.title}
                        </h3>
                        <p className="mb-6 text-[11px] leading-relaxed text-gray-700">
                          {service.description}
                        </p>
                        
                        {/* Tombol Kuning di bawah */}
                        <div className="mt-auto flex justify-center">
                          <button className="flex h-8 w-3/4 items-center justify-center rounded-full bg-[#EAB308] text-white transition-transform hover:scale-105">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full min-h-[200px] items-center justify-center rounded-xl bg-gray-50 text-gray-500">
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
