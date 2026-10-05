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
    <div className="w-full flex flex-col min-h-screen">
      {/* 1. Header & Hero Section with Purple Curve */}
      <HeaderSection />

      {/* 2. Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-10 flex-1">
        {/* Filter & Search */}
        <PsikologFilter
          search={search}
          onSearchChange={setSearch}
          kategoriAktif={kategoriAktif}
          onKategoriChange={setKategoriAktif}
        />

        {/* List Psikolog Cards (3 kolom di desktop) */}
        {dataTerfilter.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dataTerfilter.map((psikolog) => (
              <PsikologCard key={psikolog.id} psikolog={psikolog} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500 text-lg font-medium">Tidak ada psikolog yang ditemukan.</p>
            <p className="text-gray-400 text-sm mt-1">Coba gunakan kata kunci pencarian atau kategori lain.</p>
          </div>
        )}

        {/* 3. Quote Banner ("TEXTTEXT | texttext") */}
        <QuoteBanner />
      </main>

      {/* 4. Bottom CTA Section ("Satu cerita bisa menjadi awal dari perubahan...") */}
      <CtaSection />
    </div>
  )
}
