"use client"

import Link from "next/link"
import { useTenant } from "@/hooks/useTenant"

export function CtaSection() {
  const { withBiro } = useTenant()

  return (
    <section className="w-full bg-[#EFE9F3] py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 mt-16 text-center">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#3B074B] leading-tight">
          Satu cerita bisa menjadi awal dari perubahan.
          <br className="hidden sm:inline" />
          <span className="text-[#651877]"> Mulai konsultasimu hari ini.</span>
        </h2>

        <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-medium">
          Dapatkan bimbingan profesional dan wawasan baru dari psikolog berpengalaman untuk hidup yang lebih tenang dan bermakna.
        </p>

        <div className="pt-2">
          <Link
            href={withBiro("/konseling") as any}
            prefetch={true}
            className="inline-flex items-center gap-2 bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 font-bold text-base sm:text-lg md:text-xl px-8 sm:px-12 py-3.5 sm:py-4 rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Daftar Konseling</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
