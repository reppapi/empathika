"use client"

import Image from "next/image"

interface AsesmenHeroProps {
  title: string
  subtitle: string
  image: string
}

export function AsesmenHero({ title, subtitle, image }: AsesmenHeroProps) {
  return (
    <section className="relative w-full h-[380px] sm:h-[420px] lg:h-[450px] bg-slate-900 flex items-center justify-center overflow-hidden">
      {/* Background Image & Cinematic Dark Overlay */}
      <Image
        src={image}
        alt={title}
        fill
        className="object-cover opacity-35 filter brightness-90"
        priority
        unoptimized
      />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-black/40" />

      {/* Content Tengah */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3 drop-shadow-md">
          {title}
        </h1>

        <p className="text-gray-200 text-xs sm:text-sm lg:text-base max-w-2xl mx-auto font-light leading-relaxed drop-shadow-sm">
          {subtitle}
        </p>
      </div>
    </section>
  )
}
