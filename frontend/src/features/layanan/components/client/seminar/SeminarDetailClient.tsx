"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useTenantContext } from "@/context/TenantContext"
import { SEMINAR_DETAIL_DATA } from "@/features/layanan/data/seminarData"
import { SeminarHero } from "./SeminarHero"
import { SeminarDescriptionSection } from "./SeminarDescriptionSection"
import { ProgramGallery } from "./ProgramGallery"

export default function SeminarDetailPage() {
  const { withBiro } = useTenantContext()
  const data = SEMINAR_DETAIL_DATA

  return (
    <div className="min-h-screen bg-white font-poppins text-gray-800">
      {/* 1. BAGIAN ATAS: FOTO BESAR 100vh + GRADASI + JUDUL */}
      <SeminarHero
        title={data.title}
        heroImage={data.heroImage}
        heroImageAlt={data.heroImageAlt}
        backHref="/layanan?category=04"
        backLabel="Kembali ke Layanan"
      />

      {/* 2. BAGIAN TENGAH: DESKRIPSI (Teks Pengantar, Program Seminar & Healing, Penutup) */}
      <SeminarDescriptionSection
        intro={data.intro}
        programs={data.programs}
        closing={data.closing}
      />

      {/* 3. BAGIAN BAWAH: 3 FOTO BERJAJAR (Kotak & Posisi Lebih Rapat ke Atas) */}
      <ProgramGallery images={data.gallery} />

      {/* 4. BAGIAN PALING BAWAH: CTA REDIRECT KE KERJA SAMA */}
      <section className="pt-4 pb-20 sm:pb-24 text-center px-4">
        <div className="max-w-xl mx-auto flex flex-col items-center">
          <p className="text-base sm:text-lg font-bold text-[#561269] mb-4">
            Tertarik Mengadakan Seminar Bersama Empathika?
          </p>
          <Link
            href={withBiro("/kerja-sama") as any}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#EAB308] hover:bg-yellow-500 text-black font-extrabold text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
          >
            <span>Mari Berkolaborasi</span>
            <ArrowRight className="w-5 h-5 ml-1" />
          </Link>
        </div>
      </section>
    </div>
  )
}
