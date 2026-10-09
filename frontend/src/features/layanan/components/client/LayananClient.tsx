"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { CATEGORIES, SERVICES_DATA } from "../../data/layananData"

export default function LayananClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const categoryQuery = searchParams.get("category")
  const [activeCategory, setActiveCategory] = useState(categoryQuery || "02") // Default ke Konsultasi

  useEffect(() => {
    if (categoryQuery && categoryQuery !== activeCategory) {
      setActiveCategory(categoryQuery)
    }
  }, [categoryQuery])

  const handleCategoryChange = (id: string) => {
    setActiveCategory(id)
    router.replace(`/layanan?category=${id}`, { scroll: false })
  }

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
            <Link href={service.href || (activeCategory === "04" ? `/event/${idx + 1}` : "/booking")} className="w-full flex items-center justify-center py-2.5 sm:py-3 rounded-full bg-[#EAB308] text-black font-bold text-xs sm:text-sm hover:bg-yellow-500 transition-colors shadow-sm">
              {service.btnText}
            </Link>
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
                onClick={() => handleCategoryChange(cat.id)}
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
          {/* Card Utama (Sesuai Desain Mockup) */}
          <div className="flex h-full flex-col rounded-2xl border border-gray-300 bg-white shadow-[0px_4px_16px_rgba(0,0,0,0.1)] p-6 sm:p-8">

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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                  {SERVICES_DATA[activeCategory].map((item, idx) =>
                    renderServiceCard(item, idx)
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
