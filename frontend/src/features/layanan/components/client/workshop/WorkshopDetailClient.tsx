"use client"

import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { useTenantContext } from "@/context/TenantContext"
import { WORKSHOP_DETAILS_DATA } from "@/features/layanan/data/workshopData"
import { WorkshopHero } from "./WorkshopHero"
import { WorkshopDescriptionSection } from "./WorkshopDescriptionSection"
import { WorkshopGallery } from "./WorkshopGallery"

interface WorkshopDetailClientProps {
  slug: string
}

export default function WorkshopDetailClient({ slug }: WorkshopDetailClientProps) {
  const { withBiro } = useTenantContext()
  const data = WORKSHOP_DETAILS_DATA[slug]

  if (!data) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white font-poppins text-gray-800">
      {/* 1. BAGIAN ATAS: KOTAK FOTO HERO + GRADASI + JUDUL */}
      <WorkshopHero
        title={data.title}
        subtitle={data.subtitle}
        heroImage={data.heroImage}
        heroImageAlt={data.heroImageAlt}
      />

      {/* 2. BAGIAN TENGAH: DESKRIPSI (Pengantar, Manfaat, Detail, Penutup) */}
      <WorkshopDescriptionSection
        intro={data.intro}
        benefits={data.benefits}
        additionalInfo={data.additionalInfo}
        closing={data.closing}
      />

      {/* 3. BAGIAN BAWAH: 3 FOTO BERJAJAR (Kotak & Posisi Rapat ke Atas) */}
      <WorkshopGallery images={data.gallery} />

      {/* 4. BAGIAN PALING BAWAH: CTA REDIRECT KE KERJA SAMA */}
      <section className="pt-4 pb-20 sm:pb-24 text-center px-4">
        <div className="max-w-xl mx-auto flex flex-col items-center">
          <p className="text-base sm:text-lg font-bold text-[#561269] mb-4">
            Tertarik Mengadakan Workshop Ini Bersama Empathika?
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
