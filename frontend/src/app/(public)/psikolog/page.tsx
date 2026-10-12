"use client"

import { useState, useEffect } from "react"
import { HeaderSection } from "@/features/psikolog/components/HeaderSection"
import { PsikologFilter } from "@/features/psikolog/components/PsikologFilter"
import { PsikologCard } from "@/features/psikolog/components/PsikologCard"
import { QuoteBanner } from "@/features/psikolog/components/QuoteBanner"
import { CtaSection } from "@/features/psikolog/components/CtaSection"
import { useFilterPsikolog } from "@/features/psikolog/hooks/useFilterPsikolog"
import { DATA_PSIKOLOG_DUMMY } from "@/features/psikolog/dummy"
import { PsikologUI } from "@/types/psikolog"

export default function PsikologPage() {
  const [dataPsikolog, setDataPsikolog] = useState<PsikologUI[]>(DATA_PSIKOLOG_DUMMY)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("empathika_tenaga_ahli_data")
      if (saved) {
        const list = JSON.parse(saved)
        // Hanya tampilkan yang telah diberi izin akses aktif oleh admin utama
        const aktifOnly = list.filter((item: any) => item.statusAkses === "AKTIF")
        if (aktifOnly.length > 0) {
          const mapped: PsikologUI[] = aktifOnly.map((t: any) => ({
            id: t.id,
            id_spesialisasi: `spec-${t.id}`,
            nama_gelar: t.nama,
            email: t.email,
            no_str: t.noStr || null,
            no_sipp: t.noSipp || null,
            foto: t.foto,
            bio: t.bio,
            quote: t.quote,
            instagram: t.instagram,
            status: "ACTIVE",
            jumlah_sesi: t.jumlahSesi || 50,
            tarif_per_jam: 0,
            spesialisasi: { id: `spec-${t.id}`, nama: t.spesialisasi },
            category: t.kategori,
            keahlian: t.keahlian || [],
            pendidikanText: t.pendidikanText,
          }))
          setDataPsikolog(mapped)
        }
      }
    } catch {}
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
        {dataTerfilter.length > 0 ? (
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
