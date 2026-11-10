"use client"

import { useState, useEffect, useRef } from "react"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { CATEGORIES, WORKSHOP_SERVICES, SEMINAR_SERVICES } from "../../data/layananData"
import { WORKSHOP_DETAILS_DATA } from "../../data/workshopData"
import { getStoredLayanan, type AdminLayananItem } from "../../data/adminLayananData"
import { psikotesService, type PaketPsikotesApiResponse } from "@/services/psikotes.service"
import { layananService, type LayananApiResponse } from "@/services/layanan.service"
import { useTenantContext } from "@/context/TenantContext"
import ClientErrorState from "@/components/shared/ClientErrorState"

export default function LayananClient() {
  const { withBiro } = useTenantContext()
  const searchParams = useSearchParams()
  const categoryQuery = searchParams.get("category")
  const [activeCategory, setActiveCategory] = useState(categoryQuery || "01") // Default ke Konsultasi
  const [publishedPsikotes, setPublishedPsikotes] = useState<PaketPsikotesApiResponse[]>([])
  const [liveLayanan, setLiveLayanan] = useState<LayananApiResponse[]>([])
  const [loadingLayanan, setLoadingLayanan] = useState(true)
  const [isLayananError, setIsLayananError] = useState(false)
  const [loadingPsikotes, setLoadingPsikotes] = useState(true)
  const [isPsikotesError, setIsPsikotesError] = useState(false)
  const [storedAdminLayanan, setStoredAdminLayanan] = useState<AdminLayananItem[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  const fetchLayanan = async () => {
    try {
      setLoadingLayanan(true)
      setIsLayananError(false)
      const res = await layananService.getAll()
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
      setLiveLayanan(list)
    } catch (err) {
      console.warn("Gagal memuat layanan dari server database:", err)
      setIsLayananError(true)
    } finally {
      setLoadingLayanan(false)
    }
  }

  const fetchPsikotes = async () => {
    try {
      setLoadingPsikotes(true)
      setIsPsikotesError(false)
      const res = await psikotesService.getList({ status: "PUBLISHED" })
      if (res?.data && res.data.length > 0) {
        setPublishedPsikotes(res.data)
      } else {
        setPublishedPsikotes([])
      }
    } catch (err) {
      console.error("Gagal mengambil data paket psikotes layanan:", err)
      setPublishedPsikotes([])
      setIsPsikotesError(true)
    } finally {
      setLoadingPsikotes(false)
    }
  }

  useEffect(() => {
    fetchPsikotes()
    fetchLayanan()

    const handleSync = () => {
      fetchLayanan()
      fetchPsikotes()
    }

    window.addEventListener("storage", handleSync)

    return () => {
      window.removeEventListener("storage", handleSync)
    }
  }, [])

  useEffect(() => {
    if (categoryQuery) {
      setActiveCategory(categoryQuery)
    }
  }, [categoryQuery])

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
        if (item.status === "Nonaktif") return false
        const name = item.layanan.toLowerCase().trim()
        return name === titleLower || titleLower.includes(name) || name.includes(titleLower)
      })
      if (match?.bannerUrl && match.bannerUrl.trim().length > 0) {
        return match.bannerUrl.trim()
      }
      if (match?.foto_kegiatan && Array.isArray(match.foto_kegiatan) && match.foto_kegiatan[0]) {
        return match.foto_kegiatan[0].trim()
      }
    }
    return service.bannerUrl || null
  }

  const renderServiceCard = (service: any, idx: number) => {
    const banner = resolveBanner(service)

    const baseHref = service.href || (
      activeCategory === "01"
        ? "/booking"
        : activeCategory === "02"
        ? "/psikotes"
        : activeCategory === "03"
        ? "/layanan/workshop/seft"
        : activeCategory === "04"
        ? "/layanan/seminar"
        : `/asesmen?paket=${encodeURIComponent(service.bottomTitle)}`
    )

    const rawDestination =
      activeCategory === "05" && banner && !baseHref.includes("&banner=")
        ? `${baseHref}${baseHref.includes("?") ? "&" : "?"}banner=${encodeURIComponent(banner)}`
        : baseHref

    const destinationHref = withBiro(rawDestination)

    return (
      <div key={idx} className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
        <Link
          href={destinationHref as any}
          className={`h-36 sm:h-44 w-full ${service.bgColor || "bg-[#561269]"} overflow-hidden relative shrink-0 block cursor-pointer`}
        >
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

              <div className="absolute inset-0 flex items-start p-6 z-10">
                <div className="text-left w-full">
                  <h3 className={`${service.titleColor || "text-white"} font-extrabold text-[22px] sm:text-[28px] leading-[1.1] mb-2 drop-shadow-md uppercase`}>
                    {service.topTitle}
                  </h3>
                  {service.topSubtitle && (
                    <p className={`${service.titleColor || "text-gray-200"} text-xs sm:text-sm font-medium drop-shadow-sm opacity-90`}>
                      {service.topSubtitle}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </Link>

        <div className="p-5 sm:p-6 flex flex-col flex-1">
          <Link href={destinationHref as any} className="block group-hover:text-[#561269] transition-colors">
            <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-2 leading-tight line-clamp-2">{service.bottomTitle}</h3>
          </Link>
          <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-6">{service.bottomDescription}</p>

          <div className="mt-auto pt-2">
            <Link
              href={destinationHref as any}
              className="w-full flex items-center justify-center py-2.5 sm:py-3 rounded-full bg-[#EAB308] text-black font-bold text-xs sm:text-sm hover:bg-yellow-500 transition-colors shadow-sm"
            >
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

        {/* Kolom Kiri: Daftar Kategori (TIDAK BISA SCROLL & STABIL TANPA JUMPING) */}
        <div className="flex shrink-0 flex-col gap-3 lg:w-1/3 lg:gap-5 lg:pb-2">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className="group flex flex-col items-start text-left cursor-pointer h-[76px] lg:h-[84px] justify-center shrink-0 transition-transform duration-200"
              >
                <span
                  className={`font-bold transition-colors duration-200 leading-none ${
                    isActive ? "text-[26px] text-[#EAB308]" : "text-[22px] text-[#EAB308]/40"
                  }`}
                >
                  {cat.id}
                </span>
                <span
                  className={`transition-colors duration-200 leading-tight mt-1 ${
                    isActive
                      ? "text-[30px] lg:text-[32px] font-bold text-[#561269]"
                      : "text-[24px] lg:text-[26px] font-semibold text-[#B385C0] group-hover:text-[#763E8B]"
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

            {/* Header Card Utama - Stabil tanpa re-mount jump */}
            <div className="mb-6 shrink-0">
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
              <div key={`content-${activeCategory}`} className="transition-opacity duration-200">
                {/* 1. Status Error Jika Koneksi Gagal (Konsultasi, Psikotes, Workshop, Seminar, Asesmen) */}
                {(() => {
                  const isCurrentError = activeCategory === "02" ? isPsikotesError : isLayananError
                  if (!isCurrentError) return null

                  return (
                    <ClientErrorState
                      message={
                        activeCategory === "02"
                          ? "Gagal memuat daftar paket psikotes. Silakan periksa koneksi Anda dan coba lagi."
                          : "Gagal memuat daftar layanan. Silakan periksa koneksi Anda dan coba lagi."
                      }
                      onRetry={activeCategory === "02" ? fetchPsikotes : fetchLayanan}
                      isRetrying={activeCategory === "02" ? loadingPsikotes : loadingLayanan}
                    />
                  )
                })()}

                {/* 2. Loading State (Konsultasi, Psikotes, Workshop, Seminar, Asesmen) */}
                {(() => {
                  const isCurrentError = activeCategory === "02" ? isPsikotesError : isLayananError
                  const isCurrentLoading = activeCategory === "02" ? loadingPsikotes : loadingLayanan
                  if (isCurrentError || !isCurrentLoading) return null

                  return (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                      <Loader2 className="w-8 h-8 text-[#561269] animate-spin" />
                      <p className="text-sm text-gray-500 font-medium">
                        {activeCategory === "02" ? "Memuat paket psikotes..." : "Memuat data layanan..."}
                      </p>
                    </div>
                  )
                })()}

                {/* 3. Grid Layanan (Hanya tampil jika tidak error dan tidak loading) */}
                {(() => {
                  const isCurrentError = activeCategory === "02" ? isPsikotesError : isLayananError
                  const isCurrentLoading = activeCategory === "02" ? loadingPsikotes : loadingLayanan
                  if (isCurrentError || isCurrentLoading) return null

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
                            href: withBiro ? withBiro(`/psikotes/${p.id}`) : `/psikotes/${p.id}`,
                            bannerUrl: p.banner_url,
                          }
                        })
                      }
                      return []
                    }

                    // Ambil layanan murni dari database sesuai kategori aktif
                    const catEnum =
                      activeCategory === "01"
                        ? "KONSULTASI"
                        : activeCategory === "03"
                        ? "WORKSHOP"
                        : activeCategory === "04"
                        ? "SEMINAR"
                        : "ASESMEN"

                    // Cek semua item dari kategori ini yang terdaftar di database
                    const allCatItems = liveLayanan.filter(
                      (l) => (l.kategori || "").toUpperCase() === catEnum
                    )

                    // Hanya ambil layanan yang aktif (l.aktif !== false dan status !== "Nonaktif")
                    const dbMatches = allCatItems.filter((l) => {
                      return l.aktif !== false && (l as any).status !== "Nonaktif"
                    })

                    if (dbMatches.length > 0) {
                      const colors = ["bg-[#561269]", "bg-[#f48520]", "bg-[#1c352d]", "bg-[#f0d164]", "bg-[#e31e3d]"]
                      const textColors = ["text-white", "text-white", "text-white", "text-gray-900", "text-white"]
                      const shapes = ["circles", "circles-dark", "heart", "circles", "circles-dark"]

                      return dbMatches.map((item, idx) => {
                        let itemHref: string | undefined = undefined
                        let btnText = "Pilih Layanan"

                        if (activeCategory === "01") {
                          itemHref = withBiro(`/booking?layanan=${encodeURIComponent(item.nama)}`)
                          btnText = "Booking Konsultasi"
                        } else if (activeCategory === "03") {
                          const namaLower = item.nama.toLowerCase()
                          if (namaLower.includes("seft")) {
                            itemHref = withBiro("/layanan/workshop/seft")
                          } else if (namaLower.includes("peer") || namaLower.includes("sebaya") || namaLower.includes("konselor")) {
                            itemHref = withBiro("/layanan/workshop/peer-helper")
                          } else {
                            const foundSlug = Object.keys(WORKSHOP_DETAILS_DATA).find((s) => namaLower.includes(s))
                            itemHref = withBiro(foundSlug ? `/layanan/workshop/${foundSlug}` : "/layanan/workshop/seft")
                          }
                          btnText = "Lihat Workshop"
                        } else if (activeCategory === "04") {
                          itemHref = withBiro("/layanan/seminar")
                          btnText = "Lihat Seminar"
                        } else if (activeCategory === "05") {
                          btnText = "Pilih Asesmen"
                        }

                        let bannerUrl = item.banner_url
                        const rawFotos = (item as any).foto_kegiatan || (item?.tarif_tenaga_ahli as any)?.foto_kegiatan
                        if (!bannerUrl && Array.isArray(rawFotos) && rawFotos[0]) {
                          bannerUrl = rawFotos[0]
                        }

                        return {
                          topTitle: item.nama.toUpperCase(),
                          topSubtitle: item.metode || "Online/Offline",
                          bottomTitle: item.nama,
                          bottomDescription: item.deskripsi || "Layanan profesional Empathika.",
                          bgColor: colors[idx % colors.length],
                          titleColor: textColors[idx % textColors.length],
                          btnText,
                          shape: shapes[idx % shapes.length],
                          href: itemHref,
                          bannerUrl,
                        }
                      })
                    }

                    // Jika di database sudah ada item kategori ini tapi SEMUANYA dinonaktifkan oleh admin,
                    // jangan tampilkan fallback statis agar tetap tersembunyi sesuai setelan admin!
                    if (allCatItems.length > 0) {
                      return []
                    }

                    // Fallback HANYA jika di database benar-benar belum ada data awal untuk Workshop atau Seminar
                    if (activeCategory === "03" && WORKSHOP_SERVICES.length > 0) {
                      return WORKSHOP_SERVICES.map((ws) => ({
                        ...ws,
                        href: withBiro(ws.href),
                      }))
                    }
                    if (activeCategory === "04" && SEMINAR_SERVICES.length > 0) {
                      return SEMINAR_SERVICES.map((ss) => ({
                        ...ss,
                        href: withBiro(ss.href),
                      }))
                    }

                    return []
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
                      Belum ada layanan yang tersedia untuk kategori {CATEGORIES.find(c => c.id === activeCategory)?.title}.
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
