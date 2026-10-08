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
    topTitle: "KONSULTASI",
    topSubtitle: "Individu / Kelompok",
    bottomTitle: "Konsultasi Individu atau Kelompok",
    bottomDescription: "Dapatkan sesi konseling tatap muka atau online bersama psikolog profesional untuk membahas permasalahan pribadi secara intensif dan privat.",
    bgColor: "bg-[#f48520]",
    titleColor: "text-white",
    btnText: "Booking Sesi",
    shape: "circles", 
  },
  {
    topTitle: "PEER KONSELOR",
    topSubtitle: "Layanan Teman Sebaya",
    bottomTitle: "Sesi Bersama Peer Konselor",
    bottomDescription: "Layanan pendampingan santai bersama teman sebaya (peer counselor) yang terlatih untuk mendengarkan keluh kesah Anda tanpa penghakiman.",
    bgColor: "bg-[#f0d164]",
    titleColor: "text-gray-900",
    btnText: "Booking Sesi",
    shape: "circles-dark",
  },
  {
    topTitle: "HIPNOTERAPI",
    topSubtitle: "Terapi Alam Bawah Sadar",
    bottomTitle: "Layanan Hipnoterapi",
    bottomDescription: "Terapi mendalam yang menyasar alam bawah sadar untuk membantu mengatasi trauma, kecemasan, fobia, hingga kebiasaan buruk yang sulit dihilangkan.",
    bgColor: "bg-[#e31e3d]",
    titleColor: "text-white",
    btnText: "Booking Sesi",
    shape: "heart",
  },
  {
    topTitle: "HOME VISIT",
    topSubtitle: "Layanan Kunjungan",
    bottomTitle: "Layanan Home Visit",
    bottomDescription: "Layanan spesial di mana psikolog kami akan langsung mengunjungi lokasi Anda demi kenyamanan, terutama bagi klien yang kesulitan mobilitas.",
    bgColor: "bg-[#561269]",
    titleColor: "text-white",
    btnText: "Booking Sesi",
    shape: "circles",
  },
]

const EVENTS_SERVICES = [
  {
    title: "Overcoming Burnout: Mengelola Lelah Mental di Tempat Kerja",
    type: "Webinar",
    typeColor: "text-[#561269]",
    date: "Sabtu, 24 Oktober 2026",
    time: "19:00 - 21:00 WIB",
    speakerName: "Sarah M., M.Psi",
    speakerRole: "Psikolog Klinis",
    price: "Rp 50.000",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    speakerImg: "https://ui-avatars.com/api/?name=Sarah+M&background=561269&color=fff"
  },
  {
    title: "Seni Mengenali Diri Sendiri & Self-Healing Therapy",
    type: "Workshop",
    typeColor: "text-[#d97706]",
    date: "Minggu, 1 November 2026",
    time: "10:00 - 14:00 WIB",
    speakerName: "Dr. Andi Pratama",
    speakerRole: "Pakar Mindfulness",
    price: "Rp 150.000",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    speakerImg: "https://ui-avatars.com/api/?name=Dr+Andi&background=d97706&color=fff"
  }
]

// Mapping data layanan ke masing-masing kategori
const SERVICES_DATA: Record<string, any[]> = {
  "01": KONSULTASI_SERVICES, 
  "02": KONSULTASI_SERVICES,
  "03": KONSULTASI_SERVICES, 
  "04": EVENTS_SERVICES, 
  "05": KONSULTASI_SERVICES, 
}

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function LayananContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category")
  
  // Gunakan parameter category dari URL jika ada, jika tidak default ke "02" (Konsultasi)
  const [activeCategory, setActiveCategory] = useState(categoryParam || "02")

  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam)
    }
  }, [categoryParam])

  const renderServiceCard = (service: any, idx: number) => {
    return (
      <div key={idx} className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
        <div className={`h-40 sm:h-48 w-full ${service.bgColor} overflow-hidden relative shrink-0`}>
          <div className="absolute inset-0 flex items-start p-6">
            <div className="text-left w-full">
              <h3 className={`${service.titleColor} font-extrabold text-[22px] sm:text-[28px] leading-[1.1] mb-2 drop-shadow-sm uppercase`}>{service.topTitle}</h3>
              <p className={`${service.titleColor} text-xs sm:text-sm font-medium drop-shadow-sm opacity-90`}>{service.topSubtitle}</p>
            </div>
          </div>
          
          {/* Shapes */}
          {service.shape === "circles" && (
            <div className="absolute -bottom-4 right-0 opacity-40 mix-blend-overlay">
               <svg width="200" height="150" viewBox="0 0 200 150" fill="none"><circle cx="150" cy="100" r="80" fill="white"/><circle cx="50" cy="120" r="50" fill="white"/></svg>
            </div>
          )}
          {service.shape === "circles-dark" && (
            <div className="absolute -bottom-4 right-0 opacity-20 mix-blend-overlay">
               <svg width="200" height="150" viewBox="0 0 200 150" fill="none"><circle cx="150" cy="100" r="80" fill="black"/><circle cx="50" cy="120" r="50" fill="black"/></svg>
            </div>
          )}
          {service.shape === "heart" && (
            <div className="absolute bottom-4 right-10">
               <svg className="w-16 h-16 text-pink-300 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
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
        <div className="flex h-full flex-1 w-full flex-col overflow-hidden">
          {/* Card Utama */}
          <div className="flex h-full flex-col rounded-2xl border border-gray-100 bg-gray-50/50 p-6 sm:p-8">

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
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-10">
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

export default function LayananPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto w-full max-w-[1200px] px-6 pt-24 pb-4 lg:pt-[104px] lg:pb-8 lg:h-screen font-poppins flex items-center justify-center">
        Memuat layanan...
      </div>
    }>
      <LayananContent />
    </Suspense>
  )
}
