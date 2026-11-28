"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Sparkles, ShieldCheck, Clock } from "lucide-react"
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
    <div className="min-h-screen bg-[#FDFBFD] relative overflow-hidden font-poppins selection:bg-[#561269] selection:text-white">
      {/* ── Background Ambient Blobs & Grid Pattern (Senada dengan Formulir Kerja Sama & Internship) ── */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(86,18,105,0.05)_1px,_transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-purple-300/25 blur-3xl pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#EAB308]/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-24 w-72 h-72 rounded-full bg-fuchsia-300/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-12 -left-20 w-80 h-80 rounded-full bg-purple-400/10 blur-3xl pointer-events-none" />

      {/* Decorative Circles Outline */}
      <div className="absolute top-28 left-6 sm:left-14 w-44 h-44 rounded-full border border-purple-200/50 pointer-events-none" />
      <div className="absolute top-36 right-6 sm:right-16 w-56 h-56 rounded-full border border-[#EAB308]/20 pointer-events-none" />

      {/* Fluid Wave Curves */}
      <svg
        className="absolute top-0 left-0 w-full h-[520px] pointer-events-none opacity-25"
        preserveAspectRatio="none"
        viewBox="0 0 1200 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M-100 220 C 300 380, 700 60, 1300 250"
          stroke="url(#konsul-wave-1)"
          strokeWidth="1.5"
          strokeDasharray="6 6"
        />
        <path
          d="M-100 140 C 400 50, 800 360, 1300 160"
          stroke="url(#konsul-wave-2)"
          strokeWidth="1.5"
        />
        <defs>
          <linearGradient id="konsul-wave-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#561269" stopOpacity="0" />
            <stop offset="50%" stopColor="#EAB308" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#561269" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="konsul-wave-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#561269" stopOpacity="0" />
            <stop offset="50%" stopColor="#561269" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#561269" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-4 sm:px-6 pt-28 sm:pt-36 pb-16 sm:pb-24">
        {/* ── Hero Header Section ── */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          {/* Badge Sub-Header */}
          <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 bg-purple-50/90 border border-purple-200/80 rounded-full mb-3.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#EAB308] animate-pulse" />
            <span className="text-[10px] sm:text-xs font-extrabold text-[#561269] tracking-widest uppercase">
              LAYANAN KONSELING &amp; KONSULTASI {isBiro && biroProfile?.nama_biro ? biroProfile.nama_biro.toUpperCase() : "EMPATHIKA"}
            </span>
          </div>

          {/* Judul Utama */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#561269] tracking-tight mb-3 sm:mb-4">
            {isBiro && biroProfile?.nama_biro
              ? `Mulai Jadwalkan Konsultasi dengan ${biroProfile.nama_biro}!`
              : "Mulai Jadwalkan Konsultasi dengan Kami!"}
          </h1>

          {/* Deskripsi Pengantar */}
          <p className="text-gray-600 text-xs sm:text-base leading-relaxed max-w-2xl mx-auto mb-6">
            Temukan ruang aman dan nyaman untuk bercerita, mengeksplorasi diri, serta menemukan solusi terbaik bersama psikolog &amp; konselor profesional kami.
          </p>

          {/* Quick Info Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 text-xs text-gray-700">
            <div className="flex items-center gap-1.5 bg-white/90 border border-purple-100 shadow-2xs px-3.5 py-1.5 rounded-full backdrop-blur-xs">
              <Sparkles className="w-4 h-4 text-[#EAB308]" />
              <span className="font-semibold text-gray-700 text-[11px] sm:text-xs">Psikolog Profesional &amp; Berlisensi</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/90 border border-purple-100 shadow-2xs px-3.5 py-1.5 rounded-full backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-[#561269]" />
              <span className="font-semibold text-gray-700 text-[11px] sm:text-xs">100% Rahasia &amp; Aman</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/90 border border-purple-100 shadow-2xs px-3.5 py-1.5 rounded-full backdrop-blur-xs">
              <Clock className="w-4 h-4 text-[#EAB308]" />
              <span className="font-semibold text-gray-700 text-[11px] sm:text-xs">Online &amp; Tatap Muka (Offline)</span>
            </div>
          </div>
        </div>

        {/* Banner Error jika Backend Gagal */}
        {isError && (
          <div className="mb-8">
            <ClientErrorState onRetry={() => refetch()} isRetrying={isLoading} />
          </div>
        )}

        {/* Container Kartu Layanan */}
        <div className="rounded-3xl border border-purple-100/90 bg-white/95 backdrop-blur-xs p-6 sm:p-8 lg:p-12 shadow-xl shadow-purple-950/5">
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

