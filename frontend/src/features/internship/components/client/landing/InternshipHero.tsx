"use client"

import React from "react"
import { Briefcase, ArrowRight } from "lucide-react"
import HeroStarryOverlay from "@/components/shared/HeroStarryOverlay"

interface InternshipHeroProps {
  onScrollToPositions: () => void
}

export function InternshipHero({ onScrollToPositions }: InternshipHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#561269] via-[#651877] to-[#430b53] text-white pt-28 pb-20 md:pt-36 md:pb-28">
      <HeroStarryOverlay density="dense" showAurora showFlare />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white mb-6">
          Eksplorasi Potensi, Kolaborasi & Beri{" "}
          <span className="text-[#EAB308] underline decoration-wavy decoration-[#EAB308]/60 underline-offset-8">
            Kontribusi Nyata
          </span>
        </h1>

        {/* About the Program */}
        <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-6 sm:p-8 text-white/90 text-base sm:text-lg leading-relaxed shadow-xl mb-10 text-justify sm:text-center">
          <p className="font-semibold text-[#EAB308] text-sm uppercase tracking-wider mb-2">
            About the Program
          </p>
          <p>
            Empathika membuka kesempatan bagi mahasiswa dan fresh graduate untuk bergabung dalam
            Program Internship yang dirancang untuk memberikan pengalaman langsung dalam industri
            kesehatan mental dan digital media. Melalui program ini, peserta akan mendapatkan
            kesempatan untuk mengeksplorasi minat, berkolaborasi dalam tim profesional, dan
            berkontribusi dalam proyek nyata yang berdampak bagi masyarakat.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onScrollToPositions}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] text-[#0f172a] font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Briefcase className="w-5 h-5 text-[#0f172a]" />
            Lihat Posisi Terbuka
          </button>
          <a
            href="#tiga-pilar"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-white font-semibold text-base backdrop-blur-sm transition-all duration-200 flex items-center justify-center gap-2"
          >
            Tentang 3 Pilar
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
