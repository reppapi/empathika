"use client"

import { useState, useEffect } from "react"
import { HeaderSection } from "@/features/psikolog/components/client/HeaderSection"
import { PsikologFilter } from "@/features/psikolog/components/client/PsikologFilter"
import { PsikologCard } from "@/features/psikolog/components/client/PsikologCard"
import { QuoteBanner } from "@/features/psikolog/components/client/QuoteBanner"
import { CtaSection } from "@/features/psikolog/components/client/CtaSection"
import { useFilterPsikolog } from "@/features/psikolog/hooks/useFilterPsikolog"
import { PsikologUI } from "@/types/psikolog"
import { psikologService } from "@/services/psikolog.service"
import { mapDbPsikologToUI } from "@/features/psikolog/utils/mapPsikolog"

export default function PsikologPage() {
  const [dataPsikolog, setDataPsikolog] = useState<PsikologUI[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Ambil data psikolog langsung dari database
    psikologService
      .getList()
      .then((dbList: any[]) => {
        if (dbList && dbList.length > 0) {
          const mapped = dbList.map(mapDbPsikologToUI)
          setDataPsikolog(mapped)
        }
      })
      .catch((err) => {
        console.error("Gagal mengambil data psikolog dari database:", err)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const {
    kategoriAktif,
    setKategoriAktif,
    search,
    setSearch,
    dataTerfilter,
  } = useFilterPsikolog(dataPsikolog)

  return (
    <div className="w-full flex flex-col min-h-screen bg-[#FCFAFD]">
      {/* 1. Header & Hero Section with Fluid Purple Curve */}
      <HeaderSection />

      {/* 2. Main Content Container (Lebar fluid yang menyesuaikan layar penuh, split-screen, dan mobile) */}
      <main className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 mt-8 sm:mt-12 flex-1">
        {/* Filter & Search Bar */}
        <PsikologFilter
          search={search}
          onSearchChange={setSearch}
          kategoriAktif={kategoriAktif}
          onKategoriChange={setKategoriAktif}
        />

        {/* List Psikolog Cards */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-3 border-[#561269] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-gray-500">Memuat direktori psikolog...</p>
          </div>
        ) : dataTerfilter.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {dataTerfilter.map((psikolog) => (
              <PsikologCard key={psikolog.id} psikolog={psikolog} mode="psikolog" />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4 bg-white rounded-3xl border border-dashed border-purple-200 shadow-sm">
            <div className="w-14 h-14 bg-purple-50 text-[#561269] rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-800 text-lg font-bold">Tidak ada psikolog yang ditemukan</p>
            <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
              Coba gunakan kata kunci pencarian yang berbeda atau pilih kategori &ldquo;Semua&rdquo;.
            </p>
          </div>
        )}

        {/* 3. Quote Banner Responsif */}
        <QuoteBanner />
      </main>

      {/* 4. Bottom CTA Section */}
      <CtaSection />
    </div>
  )
}
