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
      {/* ── Hiasan Latar Belakang Minimalis Khas Empathika (Soft Ambient Glows & Subtle Outline Rings Seperti Formulir Kerja Sama & Internship) ── */}
      {/* Soft Ambient Glows di Sudut Latar Belakang */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#561269]/10 blur-3xl pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-[#EAB308]/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-72 h-72 rounded-full bg-[#561269]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-80 h-80 rounded-full bg-[#EAB308]/10 blur-3xl pointer-events-none" />

      {/* Subtle Geometric Outline Rings (Elemen Cincin Tipis Halus Khas Formulir Kerja Sama & Internship) */}
      <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full border border-[#EAB308]/25 pointer-events-none" />
      <div className="absolute -top-28 -right-4 w-96 h-96 rounded-full border border-[#EAB308]/15 pointer-events-none" />
      <div className="absolute top-48 -left-20 w-80 h-80 rounded-full border border-[#561269]/15 pointer-events-none" />
      <div className="absolute bottom-24 -left-10 w-64 h-64 rounded-full border border-[#561269]/10 pointer-events-none" />

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
