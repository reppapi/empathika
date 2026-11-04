"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useTenantContext } from "@/context/TenantContext"

interface SeminarHeroProps {
  title: string
  heroImage: string
  heroImageAlt: string
  backHref?: string
  backLabel?: string
}

export function SeminarHero({
  title,
  heroImage,
  heroImageAlt,
  backHref = "/layanan?category=04",
  backLabel = "Kembali ke Layanan",
}: SeminarHeroProps) {
  const { withBiro } = useTenantContext()

  return (
    <section className="relative w-full h-screen min-h-[560px] max-h-[1080px] flex items-center justify-center overflow-hidden">
      {/* Background Hero Image (100vh) */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImage}
          alt={heroImageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Gradient Overlay Gelap ke Transparan untuk Kontras Teks Maksimal */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />
      </div>

      {/* Tombol Kembali di Pojok Kiri Atas */}
      <div className="absolute top-24 sm:top-28 left-4 sm:left-8 md:left-12 z-20">
        <Link
          href={withBiro(backHref) as any}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-medium text-xs sm:text-sm transition-all duration-200 border border-white/20 shadow-md hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{backLabel}</span>
        </Link>
      </div>

      {/* Judul Besar di Atas Gradasi */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center text-white mt-12 sm:mt-16">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 leading-tight drop-shadow-md">
          {title}
        </h1>
      </div>
    </section>
  )
}

