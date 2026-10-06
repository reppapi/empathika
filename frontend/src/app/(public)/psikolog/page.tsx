"use client"

import { HeaderSection } from "@/features/psikolog/components/HeaderSection"
import { PsikologFilter } from "@/features/psikolog/components/PsikologFilter"
import { PsikologCard } from "@/features/psikolog/components/PsikologCard"
import { QuoteBanner } from "@/features/psikolog/components/QuoteBanner"
import { CtaSection } from "@/features/psikolog/components/CtaSection"
import { useFilterPsikolog } from "@/features/psikolog/hooks/useFilterPsikolog"
import { DATA_PSIKOLOG_DUMMY } from "@/features/psikolog/dummy"

export default function PsikologPage() {
  const {
    kategoriAktif,
    setKategoriAktif,
    search,
    setSearch,
    dataTerfilter,
  } = useFilterPsikolog(DATA_PSIKOLOG_DUMMY)

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

        {/* List Psikolog Cards:
            - Mobile: 1 kolom
            - Tablet / Split Screen (50% layar laptop): 2 kolom
            - Desktop standar (1024px+): 3 kolom
            - Layar lebar / Fullscreen (1400px+): 4 kolom
        */}
        {dataTerfilter.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {dataTerfilter.map((psikolog) => (
              <PsikologCard key={psikolog.id} psikolog={psikolog} />
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
