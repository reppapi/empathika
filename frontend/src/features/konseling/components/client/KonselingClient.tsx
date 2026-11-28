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
      {/* ── Hiasan Latar Belakang (Tema Warna Empathika: Ungu #561269 & Emas #EAB308) ── */}

      {/* 1. Subtle Dot Matrix Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(86,18,105,0.06)_1px,_transparent_1px)] [background-size:28px_28px] pointer-events-none" />

      {/* 2. Soft Ambient Brand Glows */}
      <div className="absolute -top-20 -left-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-[#561269]/10 blur-3xl pointer-events-none" />
      <div className="absolute -top-16 -right-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-[#EAB308]/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-72 h-72 rounded-full bg-[#561269]/8 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-80 h-80 rounded-full bg-[#EAB308]/12 blur-3xl pointer-events-none" />

      {/* 3. Fluid Wave Ribbon Curves (Persis seperti di Formulir Kerja Sama & Internship dengan warna Empathika) */}
      <svg
        className="absolute top-0 left-0 w-full h-[580px] pointer-events-none opacity-40"
        preserveAspectRatio="none"
        viewBox="0 0 1200 580"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Gelombang Emas Putus-Putus */}
        <path
          d="M-100 240 C 250 420, 650 60, 1300 280"
          stroke="url(#empathika-wave-gold)"
          strokeWidth="2"
          strokeDasharray="8 8"
        />
        {/* Gelombang Ungu Solid */}
        <path
          d="M-100 160 C 350 40, 750 380, 1300 180"
          stroke="url(#empathika-wave-purple)"
          strokeWidth="1.8"
        />
        {/* Gelombang Aksen Bawah Halus */}
        <path
          d="M-50 360 C 400 480, 850 180, 1250 390"
          stroke="url(#empathika-wave-gold)"
          strokeWidth="1.2"
          strokeDasharray="4 6"
        />
        <defs>
          <linearGradient id="empathika-wave-gold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#561269" stopOpacity="0" />
            <stop offset="25%" stopColor="#EAB308" stopOpacity="0.6" />
            <stop offset="75%" stopColor="#EAB308" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#561269" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="empathika-wave-purple" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EAB308" stopOpacity="0" />
            <stop offset="30%" stopColor="#561269" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#7a1b94" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#EAB308" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* 4. Organic Concentric Rings & Arcs (Empathika Brand Elements) */}
      {/* Sisi Kiri Atas: Ring Lingkaran Ganda Emas & Ungu */}
      <div className="absolute top-28 left-4 sm:left-12 lg:left-16 w-20 sm:w-28 h-20 sm:h-28 opacity-40 pointer-events-none">
        <svg viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="45" stroke="#561269" strokeWidth="2" strokeDasharray="5 5" />
          <circle cx="50" cy="50" r="28" stroke="#EAB308" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="8" fill="#561269" fillOpacity="0.25" />
        </svg>
      </div>

      {/* Sisi Kiri Tengah: Aksen Plus (+) Ungu */}
      <div className="absolute top-80 left-6 sm:left-14 lg:left-20 w-7 sm:w-9 h-7 sm:h-9 opacity-50 pointer-events-none">
        <svg viewBox="0 0 24 24" fill="none">
          <line x1="12" y1="3" x2="12" y2="21" stroke="#561269" strokeWidth="3" strokeLinecap="round" />
          <line x1="3" y1="12" x2="21" y2="12" stroke="#561269" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      {/* Sisi Kiri Bawah: Organic Pill / Capsule Shape */}
      <div className="absolute bottom-36 left-4 sm:left-12 lg:left-16 w-16 sm:w-20 opacity-35 pointer-events-none rotate-45">
        <div className="w-16 h-8 rounded-full border-2 border-[#EAB308] bg-[#EAB308]/10" />
      </div>

      {/* Sisi Kanan Atas: Ring Geometris Lingkaran Konsentris Ungu & Emas */}
      <div className="absolute top-24 right-4 sm:right-12 lg:right-20 w-24 sm:w-32 h-24 sm:h-32 opacity-40 pointer-events-none">
        <svg viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="44" stroke="#EAB308" strokeWidth="1.8" />
          <circle cx="50" cy="50" r="30" stroke="#561269" strokeWidth="2" strokeDasharray="6 4" />
          <circle cx="50" cy="50" r="14" fill="#EAB308" fillOpacity="0.2" />
        </svg>
      </div>

      {/* Sisi Kanan Tengah: Aksen Plus (+) Emas */}
      <div className="absolute top-72 right-6 sm:right-16 lg:right-24 w-8 sm:w-10 h-8 sm:h-10 opacity-50 pointer-events-none">
        <svg viewBox="0 0 24 24" fill="none">
          <line x1="12" y1="3" x2="12" y2="21" stroke="#EAB308" strokeWidth="3" strokeLinecap="round" />
          <line x1="3" y1="12" x2="21" y2="12" stroke="#EAB308" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      {/* Sisi Kanan Bawah: Double Rings Emas & Ungu */}
      <div className="absolute bottom-32 right-6 sm:right-14 lg:right-20 w-16 sm:w-20 h-16 sm:h-20 opacity-40 pointer-events-none">
        <svg viewBox="0 0 60 60" fill="none">
          <circle cx="30" cy="30" r="26" stroke="#561269" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx="30" cy="30" r="15" stroke="#EAB308" strokeWidth="2" />
        </svg>
      </div>

      {/* 5. Dot Grid Clusters (Khas Desain Banner Empathika) */}
      <div className="absolute top-44 left-3 sm:left-8 w-10 h-10 opacity-35 pointer-events-none">
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
      <div className="absolute top-[400px] right-3 sm:right-10 w-10 h-10 opacity-35 pointer-events-none">
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
        <div className="text-center mb-8 lg:mb-12">
          <h1 className="inline-block relative text-2xl font-bold text-[#561269] sm:text-3xl lg:text-[32px] tracking-tight">
            {isBiro && biroProfile?.nama_biro
              ? `Mulai jadwalkan konsultasi dengan ${biroProfile.nama_biro}!`
              : "Mulai jadwalkan konsultasi dengan kami!"}
            {/* Aksen Lengkungan Garis Kuning Emas di Bawah Judul */}
            <span className="block mx-auto mt-2 w-24 sm:w-32 h-1 bg-gradient-to-r from-transparent via-[#EAB308] to-transparent rounded-full" />
          </h1>
        </div>

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
