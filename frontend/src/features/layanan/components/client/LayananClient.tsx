"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { CATEGORIES, SERVICES_DATA } from "../../data/layananData"
import { getStoredLayanan, type AdminLayananItem } from "../../data/adminLayananData"
import { psikotesService, type PaketPsikotesApiResponse } from "@/services/psikotes.service"
import { useTenantContext } from "@/context/TenantContext"

export default function LayananClient() {
  const { withBiro } = useTenantContext()
  const searchParams = useSearchParams()
  const categoryQuery = searchParams.get("category")
  const [activeCategory, setActiveCategory] = useState(categoryQuery || "01") // Default ke Konsultasi
  const [publishedPsikotes, setPublishedPsikotes] = useState<PaketPsikotesApiResponse[]>([])
  const [loadingPsikotes, setLoadingPsikotes] = useState(true)
  const [storedAdminLayanan, setStoredAdminLayanan] = useState<AdminLayananItem[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  // Muat data dari dashboard Admin Layanan (tersinkronisasi jika foto diubah)
  useEffect(() => {
    const loadStored = () => {
      try {
        setStoredAdminLayanan(getStoredLayanan())
      } catch (e) {
        console.error("Gagal membaca admin layanan:", e)
      }
    }
    loadStored()

    if (typeof window !== "undefined") {
      window.addEventListener("storage", loadStored)
      return () => window.removeEventListener("storage", loadStored)
    }
  }, [])

  useEffect(() => {
    const fetchPsikotes = async () => {
      try {
        setLoadingPsikotes(true)
        const res = await psikotesService.getList({ status: "PUBLISHED" })
        if (res?.data && res.data.length > 0) {
          setPublishedPsikotes(res.data)
        } else {
          setPublishedPsikotes([])
        }
      } catch (err) {
        console.error("Gagal mengambil data paket psikotes layanan:", err)
        setPublishedPsikotes([])
      } finally {
        setLoadingPsikotes(false)
      }
    }
    fetchPsikotes()
  }, [])

  useEffect(() => {
    if (categoryQuery && categoryQuery !== activeCategory) {
      setActiveCategory(categoryQuery)
    }
  }, [categoryQuery, activeCategory])

  const handleCategoryChange = (id: string) => {
    if (id === activeCategory) return
    setActiveCategory(id)
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", withBiro(`/layanan?category=${id}`))
    }
    // Reset scroll posisi konten ke paling atas secara instan & rapi
    scrollRef.current?.scrollTo({ top: 0, behavior: "instant" })
  }

  // Cari banner foto kustom dari dashboard Admin Layanan jika telah dimasukkan
  const resolveBanner = (service: any) => {
    if (storedAdminLayanan && storedAdminLayanan.length > 0) {
      const titleLower = (service.bottomTitle || service.topTitle || "").toLowerCase().trim()
      const match = storedAdminLayanan.find((item) => {
        const name = item.layanan.toLowerCase().trim()
        return name === titleLower || titleLower.includes(name) || name.includes(titleLower)
      })
      if (match?.bannerUrl && match.bannerUrl.trim().length > 0) {
        return match.bannerUrl.trim()
      }
    }
    return service.bannerUrl || null
  }

  const renderServiceCard = (service: any, idx: number) => {
    const banner = resolveBanner(service)

    return (
      <div key={idx} className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
        <div className={`h-36 sm:h-44 w-full ${service.bgColor || "bg-[#561269]"} overflow-hidden relative shrink-0`}>
          {/* Tampilkan foto jika dimasukkan dari admin / banner */}
          {banner ? (
            <div className="absolute inset-0 z-0">
              <Image
                src={banner}
                alt={service.bottomTitle || service.topTitle}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized
              />
              {/* Overlay gelap agar teks judul & subjudul di atasnya selalu kontras dan terbaca */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25" />
            </div>
          ) : (
            <>
              {/* Shapes bawaan jika belum ada foto kustom */}
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
            </>
          )}

          <div className="absolute inset-0 flex items-start p-6 z-10">
            <div className="text-left w-full">
              <h3 className={`${banner ? "text-white" : service.titleColor} font-extrabold text-[22px] sm:text-[28px] leading-[1.1] mb-2 drop-shadow-md uppercase`}>
                {service.topTitle}
              </h3>
              {service.topSubtitle && (
                <p className={`${banner ? "text-gray-200" : service.titleColor} text-xs sm:text-sm font-medium drop-shadow-sm opacity-90`}>
                  {service.topSubtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 flex flex-col flex-1">
          <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-2 leading-tight line-clamp-2">{service.bottomTitle}</h3>
          <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-6">{service.bottomDescription}</p>

          <div className="mt-auto pt-2">
            {(() => {
              const baseHref = service.href || (
                activeCategory === "01"
                  ? "/booking"
                  : activeCategory === "02"
                  ? "/psikotes"
                  : activeCategory === "03" || activeCategory === "04"
                  ? "/event"
                  : `/asesmen?paket=${encodeURIComponent(service.bottomTitle)}`
              )

              const rawDestination =
                activeCategory === "05" && banner && !baseHref.includes("&banner=")
                  ? `${baseHref}${baseHref.includes("?") ? "&" : "?"}banner=${encodeURIComponent(banner)}`
                  : baseHref

              const destinationHref = withBiro(rawDestination)
              return (
                <Link
                  href={destinationHref as any}
                  className="w-full flex items-center justify-center py-2.5 sm:py-3 rounded-full bg-[#EAB308] text-black font-bold text-xs sm:text-sm hover:bg-yellow-500 transition-colors shadow-sm"
                >
                  {service.btnText}
                </Link>
              )
            })()}
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
                className="group flex flex-col items-start text-left transition-all cursor-pointer"
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
          <div className="flex h-full flex-col rounded-2xl border border-gray-300 bg-white shadow-[0px_4px_16px_rgba(0,0,0,0.1)] p-6 sm:p-8">

            {/* Header Card Utama - Halus & Bebas Freeze */}
            <div key={`header-${activeCategory}`} className="mb-6 shrink-0 animate-fade-in">
              <h2 className="text-2xl font-bold text-[#561269] sm:text-3xl">
                {CATEGORIES.find(c => c.id === activeCategory)?.title}
              </h2>
              <p className="mt-1 text-sm font-medium text-[#561269]">
                pilih jenis {CATEGORIES.find(c => c.id === activeCategory)?.title.toLowerCase()} yang anda mau
              </p>
            </div>

            {/* Area Konten Scrollable */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto pl-4 -ml-4 pt-4 -mt-4 pr-4 -mr-2 pb-6 custom-scrollbar"
            >
              <div key={`content-${activeCategory}`} className="animate-fade-in">
                {/* Grid Layanan Kecil */}
                {(() => {
                  const currentServices = (() => {
                    if (activeCategory === "02") {
                      if (publishedPsikotes.length > 0) {
                        return publishedPsikotes.map((p, idx) => {
                          const colors = ["bg-[#f48520]", "bg-[#561269]", "bg-[#1c352d]", "bg-[#f0d164]", "bg-[#e31e3d]"]
                          const textColors = ["text-white", "text-white", "text-white", "text-gray-900", "text-white"]
                          const shapes = ["circles", "circles-dark", "heart", "circles", "circles-dark"]
                          return {
                            topTitle: p.judul.toUpperCase(),
                            topSubtitle: "",
                            bottomTitle: p.judul,
                            bottomDescription: p.deskripsi || "Asesmen psikologi terstruktur untuk mengenali diri.",
                            bgColor: colors[idx % colors.length],
                            titleColor: textColors[idx % textColors.length],
                            btnText: "Ikuti Tes",
                            shape: shapes[idx % shapes.length],
                            href: `/psikotes/${p.id}`,
                          }
                        })
                      }
                      return SERVICES_DATA["02"] || []
                    }
                    return SERVICES_DATA[activeCategory] || []
                  })()

                  if (currentServices.length > 0) {
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                        {currentServices.map((item, idx) =>
                          renderServiceCard(item, idx)
                        )}
                      </div>
                    )
                  }

                  return (
                    <div className="flex h-full min-h-[200px] items-center justify-center rounded-xl bg-white text-gray-500 shadow-sm border border-gray-100">
                      Konten untuk {CATEGORIES.find(c => c.id === activeCategory)?.title} belum tersedia.
                    </div>
                  )
                })()}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
