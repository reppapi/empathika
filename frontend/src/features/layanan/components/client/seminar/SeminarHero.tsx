"use client"

import Image from "next/image"

interface SeminarHeroProps {
  title: string
  heroImage: string
  heroImageAlt: string
}

export function SeminarHero({
  title,
  heroImage,
  heroImageAlt,
}: SeminarHeroProps) {
  return (
    <section className="w-full pt-28 sm:pt-32 pb-4 sm:pb-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Kotak Foto Hero (Secukupnya, tidak full layar) */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] min-h-[260px] sm:min-h-[360px] max-h-[460px] rounded-none overflow-hidden bg-gray-100 shadow-sm border border-gray-200 flex items-center justify-center">
          <Image
            src={heroImage}
            alt={heroImageAlt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover object-center"
          />
          {/* Gradient Overlay Gelap ke Transparan untuk Kontras Teks Maksimal */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25" />

          {/* Judul di Atas Foto */}
          <div className="relative z-10 w-full px-6 sm:px-10 text-center text-white">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight drop-shadow-md">
              {title}
            </h1>
          </div>
        </div>
      </div>
    </section>
  )
}
