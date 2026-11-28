"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useTenantContext } from "@/context/TenantContext"
import { layananService } from "@/services/layanan.service"
import { getStoredLayanan } from "@/features/layanan/data/adminLayananData"
import ClientErrorState from "@/components/shared/ClientErrorState"
import { KonselingCard, CARD_THEMES } from "./konseling/KonselingCard"
import { KonselingSkeleton } from "./konseling/KonselingSkeleton"
import { KonselingEmptyState } from "./konseling/KonselingEmptyState"

export default function KonselingClient() {
  const { isBiro, biroProfile, withBiro } = useTenantContext()

  const {
    data: rawData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["layanan", "konsultasi"],
    queryFn: async () => {
      const res = await layananService.getAll({ kategori: "KONSULTASI" })
      return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
    },
    staleTime: 5 * 60 * 1000,
  })

  // Fallback lokal jika data dari API belum tersedia
  const fallbackLayanan = getStoredLayanan()
    .filter((l) => l.kategoriId === "01" && l.status === "Aktif")
    .map((l) => ({
      id: String(l.id),
      nama: l.layanan,
      deskripsi: l.deskripsi,
      metode: l.metode,
      aktif: l.status === "Aktif",
      status: l.status,
    }))

  const rawList = Array.isArray(rawData) && rawData.length > 0 ? rawData : fallbackLayanan
  const layananList = rawList.filter((l: any) => l.aktif !== false && l.status !== "Nonaktif")

  useEffect(() => {
    const handleSync = () => {
      refetch()
    }

    window.addEventListener("focus", handleSync)
    window.addEventListener("storage", handleSync)

    return () => {
      window.removeEventListener("focus", handleSync)
      window.removeEventListener("storage", handleSync)
    }
  }, [refetch])

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FDFBFD] font-poppins selection:bg-[#561269] selection:text-white">
      {/* ── Hiasan Latar Belakang (Non-Bintang: Hearts, Squiggles, Plus Accents, Rings, Blossom & Dot Clusters) ── */}
      {/* Soft Ambient Glows */}
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-purple-200/40 blur-3xl pointer-events-none" />
      <div className="absolute -top-16 -right-20 w-80 h-80 rounded-full bg-amber-100/50 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-72 h-72 rounded-full bg-pink-100/45 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 -left-20 w-80 h-80 rounded-full bg-purple-200/30 blur-3xl pointer-events-none" />

      {/* Floating Graphic Doodles & Shapes (Bukan Bintang) */}
      {/* Left Top: Cute Heart */}
      <div className="absolute top-28 left-4 sm:left-12 lg:left-20 w-8 sm:w-10 h-8 sm:h-10 text-rose-400/60 pointer-events-none animate-pulse [animation-duration:4s]">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>

      {/* Left Mid: Organic Wavy Squiggle */}
      <div className="absolute top-80 left-3 sm:left-10 lg:left-16 w-20 sm:w-28 opacity-40 pointer-events-none">
        <svg viewBox="0 0 100 24" fill="none">
          <path
            d="M 5,12 Q 25,0 45,12 T 85,12"
            stroke="#f48520"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Left Lower: Plus Accent (+) */}
      <div className="absolute bottom-40 left-6 sm:left-16 lg:left-24 w-6 sm:w-8 h-6 sm:h-8 opacity-40 pointer-events-none">
        <svg viewBox="0 0 24 24" fill="none">
          <line x1="12" y1="4" x2="12" y2="20" stroke="#561269" strokeWidth="3" strokeLinecap="round" />
          <line x1="4" y1="12" x2="20" y2="12" stroke="#561269" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      {/* Left Subtle Ring */}
      <div className="absolute top-52 left-6 sm:left-16 w-12 h-12 rounded-full border-2 border-dashed border-[#561269]/30 pointer-events-none" />

      {/* Right Top: Blossom / Flower Petal Ring */}
      <div className="absolute top-24 right-4 sm:right-12 lg:right-20 w-12 sm:w-16 h-12 sm:h-16 opacity-40 pointer-events-none">
        <svg viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="7" fill="#f0d164" />
          <circle cx="20" cy="9" r="4" fill="#EAB308" />
          <circle cx="20" cy="31" r="4" fill="#EAB308" />
          <circle cx="9" cy="20" r="4" fill="#EAB308" />
          <circle cx="31" cy="20" r="4" fill="#EAB308" />
        </svg>
      </div>

      {/* Right Mid: Cute Heart */}
      <div className="absolute top-72 right-5 sm:right-14 lg:right-24 w-7 sm:w-9 h-7 sm:h-9 text-[#561269]/40 pointer-events-none animate-pulse [animation-duration:5s]">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>

      {/* Right Mid-Lower: Plus Accent (+) */}
      <div className="absolute top-[480px] right-6 sm:right-16 lg:right-28 w-6 sm:w-8 h-6 sm:h-8 opacity-40 pointer-events-none">
        <svg viewBox="0 0 24 24" fill="none">
          <line x1="12" y1="4" x2="12" y2="20" stroke="#f48520" strokeWidth="3" strokeLinecap="round" />
          <line x1="4" y1="12" x2="20" y2="12" stroke="#f48520" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      {/* Right Lower: Playful Wavy Squiggle */}
      <div className="absolute bottom-36 right-4 sm:right-12 lg:right-20 w-24 sm:w-32 opacity-40 pointer-events-none">
        <svg viewBox="0 0 100 24" fill="none">
          <path
            d="M 5,12 Q 25,24 45,12 T 85,12"
            stroke="#561269"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Right Subtle Ring */}
      <div className="absolute top-48 right-8 sm:right-20 w-14 h-14 rounded-full border-2 border-[#EAB308]/35 pointer-events-none" />

      {/* Dot Grid Clusters */}
      <div className="absolute top-40 left-2 sm:left-6 w-10 h-10 opacity-30 pointer-events-none">
        <svg viewBox="0 0 30 30" fill="#561269">
          <circle cx="5" cy="5" r="2" />
          <circle cx="15" cy="5" r="2" />
          <circle cx="25" cy="5" r="2" />
          <circle cx="5" cy="15" r="2" />
          <circle cx="15" cy="15" r="2" />
          <circle cx="25" cy="15" r="2" />
          <circle cx="5" cy="25" r="2" />
          <circle cx="15" cy="25" r="2" />
          <circle cx="25" cy="25" r="2" />
        </svg>
      </div>
      <div className="absolute top-[420px] right-2 sm:right-8 w-10 h-10 opacity-30 pointer-events-none">
        <svg viewBox="0 0 30 30" fill="#EAB308">
          <circle cx="5" cy="5" r="2" />
          <circle cx="15" cy="5" r="2" />
          <circle cx="25" cy="5" r="2" />
          <circle cx="5" cy="15" r="2" />
          <circle cx="15" cy="15" r="2" />
          <circle cx="25" cy="15" r="2" />
          <circle cx="5" cy="25" r="2" />
          <circle cx="15" cy="25" r="2" />
          <circle cx="25" cy="25" r="2" />
        </svg>
      </div>

      {/* ── Content Utama ── */}
      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-6 pt-32 pb-12 lg:pt-36 lg:pb-20">
        {/* Judul Utama */}
        <h1 className="mb-8 text-center text-2xl font-bold text-[#561269] sm:text-3xl lg:mb-12 lg:text-[32px]">
          {isBiro && biroProfile?.nama_biro
            ? `Mulai jadwalkan konsultasi dengan ${biroProfile.nama_biro}!`
            : "Mulai jadwalkan konsultasi dengan kami!"}
        </h1>

        {/* Banner Error jika Backend Gagal */}
        {isError && (
          <div className="mb-8">
            <ClientErrorState onRetry={() => refetch()} isRetrying={isLoading} />
          </div>
        )}

        {/* Container Putih */}
        <div className="rounded-2xl border border-gray-300 bg-white p-6 sm:p-8 lg:p-12 shadow-[0px_4px_16px_rgba(0,0,0,0.1)]">
          {isLoading ? (
            <KonselingSkeleton />
          ) : layananList.length === 0 && !isError ? (
            <KonselingEmptyState />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {layananList.map((item, index) => (
                <KonselingCard
                  key={item.id}
                  item={item}
                  theme={CARD_THEMES[index % CARD_THEMES.length]}
                  withBiro={withBiro}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
