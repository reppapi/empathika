"use client"

/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { CtaSection } from '@/features/psikolog/components/client/CtaSection'
import { useTenantContext } from '@/context/TenantContext'
import {
  tentangKamiService,
  DEFAULT_TENTANG_KAMI,
  type TentangKamiContent,
} from '@/services/tentang-kami.service'

/**
 * Generator turunan warna harmonis untuk 4 pilar chevron Tentang Kami
 * secara dinamis berdasarkan warna identitas resmi Biro.
 */
function generateBiroColorShades(baseHex: string) {
  let hex = baseHex ? baseHex.replace("#", "").trim() : "561269"
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    hex = "561269"
  }

  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)

  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)))
  const toHex = (num: number) => clamp(num).toString(16).padStart(2, "0")
  const rgbToHex = (cr: number, cg: number, cb: number) => `#${toHex(cr)}${toHex(cg)}${toHex(cb)}`

  // 1. Pilar 1: Deep rich base shade (gelap berbobot ~18%)
  const pilar1 = rgbToHex(r * 0.82, g * 0.82, b * 0.82)

  // 2. Pilar 2: Medium base shade (agak terang ~22% ke putih)
  const pilar2 = rgbToHex(r + (255 - r) * 0.22, g + (255 - g) * 0.22, b + (255 - b) * 0.22)

  // 3. Pilar 3: Medium-light shade (terang lembut ~48% ke putih)
  const pilar3 = rgbToHex(r + (255 - r) * 0.48, g + (255 - g) * 0.48, b + (255 - b) * 0.48)

  // 4. Pilar 4: Ultra-light pastel tint (~92% ke putih)
  const pilar4 = rgbToHex(r + (255 - r) * 0.92, g + (255 - g) * 0.92, b + (255 - b) * 0.92)

  // Warna teks & ikon untuk Pilar 4 kontras tinggi menggunakan warna dasar gelap
  const pilar4Text = pilar1

  return {
    themeColor: `#${hex}`,
    pilar1,
    pilar2,
    pilar3,
    pilar4,
    pilar4Text,
  }
}

function renderNilaiIcon(iconName?: string, customColor?: string) {
  const iconColor = customColor || "currentColor"
  switch (iconName) {
    case 'star':
      return (
        <svg style={{ color: iconColor }} className="w-7 h-7 lg:w-8 lg:h-8 drop-shadow-lg relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    case 'shield':
      return (
        <svg style={{ color: iconColor }} className="w-7 h-7 lg:w-8 lg:h-8 drop-shadow-sm relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    case 'users':
      return (
        <svg style={{ color: iconColor }} className="w-7 h-7 lg:w-8 lg:h-8 drop-shadow-sm relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    case 'lightbulb':
      return (
        <svg style={{ color: iconColor }} className="w-7 h-7 lg:w-8 lg:h-8 drop-shadow-lg relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    case 'award':
      return (
        <svg style={{ color: iconColor }} className="w-7 h-7 lg:w-8 lg:h-8 drop-shadow-lg relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    case 'heart':
    default:
      return (
        <svg style={{ color: iconColor }} className="w-7 h-7 lg:w-8 lg:h-8 drop-shadow-lg relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
  }
}

const BACKUP_GALLERY_FALLBACKS = [
  "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=600&q=80",
]
const BACKUP_TEAM_PHOTO =
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80"

function getSafeImageUrl(url?: string, fallback = ""): string {
  if (!url || typeof url !== "string") return fallback
  const trimmed = url.trim()
  if (/^(https?:\/\/|\/uploads\/|\/images\/|\/)/i.test(trimmed)) {
    return trimmed
  }
  return fallback
}

function handleImageFallback(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  primaryFallback: string,
  backupFallback: string
) {
  const target = e.currentTarget
  if (target.dataset.triedFallback === "backup") {
    return
  }
  if (!target.dataset.triedFallback && primaryFallback && !primaryFallback.startsWith("http://localhost")) {
    target.dataset.triedFallback = "primary"
    target.src = primaryFallback
  } else {
    target.dataset.triedFallback = "backup"
    target.src = backupFallback
  }
}

export default function TentangKamiClient() {
  const { isBiro, biroProfile, withBiro } = useTenantContext()
  const brandName = isBiro && biroProfile?.nama_biro ? biroProfile.nama_biro : "Empathika"

  const rawThemeColor = isBiro
    ? (biroProfile?.warna_tema ||
        (typeof window !== "undefined" ? localStorage.getItem("biro_theme_color") : null) ||
        "#561269")
    : "#561269"

  const shades = useMemo(() => generateBiroColorShades(rawThemeColor), [rawThemeColor])
  const themeColor = shades.themeColor

  const [content, setContent] = useState<TentangKamiContent>(DEFAULT_TENTANG_KAMI)

  useEffect(() => {
    let isMounted = true
    tentangKamiService
      .getPublic()
      .then((res) => {
        if (isMounted && res) {
          setContent(res)
        }
      })
      .catch((err) => {
        console.warn("Gagal memuat konten dinamis Tentang Kami:", err)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const deskripsi =
    isBiro && biroProfile?.deskripsi ? biroProfile.deskripsi : content.hero.tagline
  const gallery = content.hero.gallery || DEFAULT_TENTANG_KAMI.hero.gallery

  const nilaiItems = content.nilai.items?.length === 4 ? content.nilai.items : DEFAULT_TENTANG_KAMI.nilai.items

  return (
    <div className="w-full font-sans bg-[#fbfbfb] text-gray-900 overflow-hidden pb-0 -mt-36 lg:-mt-24">

      {/* ================================================================= */}
      {/* 1. HERO SECTION: Clean & Modern */}
      {/* ================================================================= */}
      <section className="relative w-full pt-60 md:pt-64 lg:pt-72 pb-24 lg:pb-32 bg-gradient-to-b from-[#f4f2ee] to-[#fbfbfb]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">

          <h1 className="text-4xl md:text-5xl lg:text-[4.5rem] font-extrabold text-[#2a0835] mb-6 leading-[1.1] tracking-tight">
            Tentang <span style={{ color: themeColor }}>{brandName}</span>
          </h1>

          <p className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg lg:text-xl font-light mb-16 md:mb-24 leading-relaxed">
            {deskripsi}
          </p>

          {/* ======================================================== */}
          {/* Responsive Bento Grid: Mobile & Tablet (< md)             */}
          {/* ======================================================== */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-lg sm:max-w-xl mx-auto md:hidden mt-4 px-1">
            {/* Kolom Kiri: Slot 1 (4:3), Slot 3 (3:4 Portrait), Slot 5 (1:1) */}
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Slot 1: Rasio 4:3 (Landscape) */}
              <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow group">
                <img
                  src={getSafeImageUrl(gallery[0], DEFAULT_TENTANG_KAMI.hero.gallery[0])}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt="Empathika Gallery 1"
                  onError={(e) => handleImageFallback(e, DEFAULT_TENTANG_KAMI.hero.gallery[0], BACKUP_GALLERY_FALLBACKS[0])}
                />
              </div>

              {/* Slot 3: Rasio 3:4 (Portrait Tegak Tinggi) */}
              <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow group">
                <img
                  src={getSafeImageUrl(gallery[2], DEFAULT_TENTANG_KAMI.hero.gallery[2])}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt="Empathika Gallery 3"
                  onError={(e) => handleImageFallback(e, DEFAULT_TENTANG_KAMI.hero.gallery[2], BACKUP_GALLERY_FALLBACKS[2])}
                />
              </div>

              {/* Slot 5: Rasio 1:1 (Kotak) */}
              <div className="aspect-square w-full rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow group">
                <img
                  src={getSafeImageUrl(gallery[4], DEFAULT_TENTANG_KAMI.hero.gallery[4])}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt="Empathika Gallery 5"
                  onError={(e) => handleImageFallback(e, DEFAULT_TENTANG_KAMI.hero.gallery[4], BACKUP_GALLERY_FALLBACKS[4])}
                />
              </div>
            </div>

            {/* Kolom Kanan: Slot 2 (1:1), Slot 4 (3:4 Portrait), Slot 6 (16:9) */}
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Slot 2: Rasio 1:1 (Kotak) */}
              <div className="aspect-square w-full rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow group">
                <img
                  src={getSafeImageUrl(gallery[1], DEFAULT_TENTANG_KAMI.hero.gallery[1])}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt="Empathika Gallery 2"
                  onError={(e) => handleImageFallback(e, DEFAULT_TENTANG_KAMI.hero.gallery[1], BACKUP_GALLERY_FALLBACKS[1])}
                />
              </div>

              {/* Slot 4: Rasio 3:4 (Portrait Tegak Tinggi) */}
              <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow group">
                <img
                  src={getSafeImageUrl(gallery[3], DEFAULT_TENTANG_KAMI.hero.gallery[3])}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt="Empathika Gallery 4"
                  onError={(e) => handleImageFallback(e, DEFAULT_TENTANG_KAMI.hero.gallery[3], BACKUP_GALLERY_FALLBACKS[3])}
                />
              </div>

              {/* Slot 6: Rasio 16:9 (Landscape Lebar) */}
              <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow group">
                <img
                  src={getSafeImageUrl(gallery[5], DEFAULT_TENTANG_KAMI.hero.gallery[5])}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt="Empathika Gallery 6"
                  onError={(e) => handleImageFallback(e, DEFAULT_TENTANG_KAMI.hero.gallery[5], BACKUP_GALLERY_FALLBACKS[5])}
                />
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* Desktop Staggered Bento Grid (>= md)                      */}
          {/* ======================================================== */}
          <div className="hidden md:grid md:grid-cols-4 gap-4 w-full max-w-4xl mx-auto h-auto md:h-[320px] mt-4">

            {/* Column 1 */}
            <div className="flex flex-col gap-4 md:translate-y-6">
              <div className="h-[120px] md:h-[140px] rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                <img
                  src={getSafeImageUrl(gallery[0], DEFAULT_TENTANG_KAMI.hero.gallery[0])}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt="Empathika Gallery 1"
                  onError={(e) => handleImageFallback(e, DEFAULT_TENTANG_KAMI.hero.gallery[0], BACKUP_GALLERY_FALLBACKS[0])}
                />
              </div>
              <div className="h-[140px] md:h-[160px] rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                <img
                  src={getSafeImageUrl(gallery[1], DEFAULT_TENTANG_KAMI.hero.gallery[1])}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt="Empathika Gallery 2"
                  onError={(e) => handleImageFallback(e, DEFAULT_TENTANG_KAMI.hero.gallery[1], BACKUP_GALLERY_FALLBACKS[1])}
                />
              </div>
            </div>

            {/* Column 2 */}
            <div className="h-[260px] md:h-[280px] rounded-[1.5rem] overflow-hidden shadow-md hover:shadow-lg transition-shadow translate-y-2 group">
              <img
                src={getSafeImageUrl(gallery[2], DEFAULT_TENTANG_KAMI.hero.gallery[2])}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                alt="Empathika Gallery 3"
                onError={(e) => handleImageFallback(e, DEFAULT_TENTANG_KAMI.hero.gallery[2], BACKUP_GALLERY_FALLBACKS[2])}
              />
            </div>

            {/* Column 3 */}
            <div className="h-[200px] md:h-[300px] rounded-[1.5rem] overflow-hidden shadow-md hover:shadow-lg transition-shadow md:-translate-y-4 group">
              <img
                src={getSafeImageUrl(gallery[3], DEFAULT_TENTANG_KAMI.hero.gallery[3])}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                alt="Empathika Gallery 4"
                onError={(e) => handleImageFallback(e, DEFAULT_TENTANG_KAMI.hero.gallery[3], BACKUP_GALLERY_FALLBACKS[3])}
              />
            </div>

            {/* Column 4 */}
            <div className="flex flex-col gap-4 md:translate-y-8">
              <div className="h-[160px] md:h-[180px] rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                <img
                  src={getSafeImageUrl(gallery[4], DEFAULT_TENTANG_KAMI.hero.gallery[4])}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt="Empathika Gallery 5"
                  onError={(e) => handleImageFallback(e, DEFAULT_TENTANG_KAMI.hero.gallery[4], BACKUP_GALLERY_FALLBACKS[4])}
                />
              </div>
              <div className="h-[100px] md:h-[120px] rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                <img
                  src={getSafeImageUrl(gallery[5], DEFAULT_TENTANG_KAMI.hero.gallery[5])}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt="Empathika Gallery 6"
                  onError={(e) => handleImageFallback(e, DEFAULT_TENTANG_KAMI.hero.gallery[5], BACKUP_GALLERY_FALLBACKS[5])}
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 2. MARI BERKENALAN (Grid Layout for clean typography) */}
      {/* ================================================================= */}
      <section className="w-full py-24 lg:py-32 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start lg:items-center">
            <div className="lg:w-5/12">
              <h2 style={{ color: themeColor }} className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
                {content.berkenalan.judul}
              </h2>
            </div>
            <div className="lg:w-7/12 grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-600 text-base md:text-lg leading-relaxed font-light">
              <p>{content.berkenalan.paragraf1}</p>
              <p>{content.berkenalan.paragraf2}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 3. NILAI YANG KAMI BAWA (Organic Premium Journey) */}
      {/* ================================================================= */}
      <section className="w-full py-16 md:py-24 bg-[#fbfbfb] relative overflow-hidden">
        {/* Title Container (Constrained) */}
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 text-center mb-12 md:mb-16">
          <h2 style={{ color: themeColor }} className="text-3xl md:text-5xl font-extrabold mb-4 drop-shadow-sm">
            {content.nilai.judulSection}
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            {content.nilai.subjudulSection}
          </p>
        </div>

        {/* Tabbed Chevron Container (Full Width Edge-to-Edge) */}
        <div className="flex flex-col lg:flex-row w-full items-stretch min-h-[360px] lg:min-h-[410px]">

          {/* Block 1: Pilar 1 */}
          <div className="relative flex-1 z-40 drop-shadow-[0_8px_15px_rgba(0,0,0,0.15)] lg:drop-shadow-[10px_0_15px_rgba(0,0,0,0.18)] group">
            <div
              style={{ backgroundColor: shades.pilar1 }}
              className="w-full h-full relative
              [clip-path:polygon(0_0,100%_0,100%_calc(100%-2.5rem),58%_calc(100%-2.5rem),50%_100%,42%_calc(100%-2.5rem),0_calc(100%-2.5rem))] 
              lg:[clip-path:polygon(0_0,calc(100%-2.5rem)_0,calc(100%-2.5rem)_42%,100%_50%,calc(100%-2.5rem)_58%,calc(100%-2.5rem)_100%,0_100%)]
              transition-transform duration-500 hover:scale-[1.015] flex flex-col items-center text-center lg:items-start lg:text-left justify-center
              pt-12 pb-20 px-6 sm:px-10 md:px-14 
              lg:py-16 xl:py-18 lg:pl-10 xl:pl-14 lg:pr-18"
            >
              {/* Clean Subtle Glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/20 pointer-events-none"></div>

              <div className="relative z-10 flex flex-col items-center lg:items-start w-full">
                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-[1.2rem] bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-md border-[2px] border-white/25 mb-4 lg:mb-5 group-hover:-translate-y-1.5 transition-transform duration-500 relative">
                  <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  {renderNilaiIcon(nilaiItems[0]?.icon, "#ffffff")}
                </div>
                <h3 className="font-black text-2xl lg:text-[1.65rem] text-white mb-2.5 drop-shadow-sm tracking-tight leading-tight">
                  {nilaiItems[0]?.judul}
                </h3>
                <p className="text-white/90 text-[0.925rem] lg:text-[1.025rem] leading-relaxed font-light drop-shadow-xs max-w-xs">
                  {nilaiItems[0]?.deskripsi}
                </p>
              </div>
            </div>
          </div>

          {/* Block 2: Pilar 2 */}
          <div className="relative flex-1 z-30 -mt-10 lg:-mt-0 lg:-ml-10 drop-shadow-[0_8px_15px_rgba(0,0,0,0.12)] lg:drop-shadow-[10px_0_15px_rgba(0,0,0,0.15)] group">
            <div
              style={{ backgroundColor: shades.pilar2 }}
              className="w-full h-full relative
              [clip-path:polygon(0_0,42%_0,50%_2.5rem,58%_0,100%_0,100%_calc(100%-2.5rem),58%_calc(100%-2.5rem),50%_100%,42%_calc(100%-2.5rem),0_calc(100%-2.5rem))] 
              lg:[clip-path:polygon(0_0,calc(100%-2.5rem)_0,calc(100%-2.5rem)_42%,100%_50%,calc(100%-2.5rem)_58%,calc(100%-2.5rem)_100%,0_100%,0_58%,2.5rem_50%,0_42%)]
              transition-transform duration-500 hover:scale-[1.015] flex flex-col items-center text-center lg:items-start lg:text-left justify-center
              pt-16 pb-20 px-6 sm:px-10 md:px-14
              lg:py-16 xl:py-18 lg:pl-16 xl:pl-20 lg:pr-18"
            >
              {/* Clean Subtle Glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/15 pointer-events-none"></div>

              <div className="relative z-10 flex flex-col items-center lg:items-start w-full">
                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-[1.2rem] bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-md border-[2px] border-white/25 mb-4 lg:mb-5 group-hover:-translate-y-1.5 transition-transform duration-500 relative">
                  <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  {renderNilaiIcon(nilaiItems[1]?.icon, "#ffffff")}
                </div>
                <h3 className="font-black text-2xl lg:text-[1.65rem] text-white mb-2.5 drop-shadow-sm tracking-tight leading-tight">
                  {nilaiItems[1]?.judul}
                </h3>
                <p className="text-white/90 text-[0.925rem] lg:text-[1.025rem] leading-relaxed font-light drop-shadow-xs max-w-xs">
                  {nilaiItems[1]?.deskripsi}
                </p>
              </div>
            </div>
          </div>

          {/* Block 3: Pilar 3 */}
          <div className="relative flex-1 z-20 -mt-10 lg:-mt-0 lg:-ml-10 drop-shadow-[0_8px_15px_rgba(0,0,0,0.1)] lg:drop-shadow-[10px_0_15px_rgba(0,0,0,0.12)] group">
            <div
              style={{ backgroundColor: shades.pilar3 }}
              className="w-full h-full relative
              [clip-path:polygon(0_0,42%_0,50%_2.5rem,58%_0,100%_0,100%_calc(100%-2.5rem),58%_calc(100%-2.5rem),50%_100%,42%_calc(100%-2.5rem),0_calc(100%-2.5rem))] 
              lg:[clip-path:polygon(0_0,calc(100%-2.5rem)_0,calc(100%-2.5rem)_42%,100%_50%,calc(100%-2.5rem)_58%,calc(100%-2.5rem)_100%,0_100%,0_58%,2.5rem_50%,0_42%)]
              transition-transform duration-500 hover:scale-[1.015] flex flex-col items-center text-center lg:items-start lg:text-left justify-center
              pt-16 pb-20 px-6 sm:px-10 md:px-14
              lg:py-16 xl:py-18 lg:pl-16 xl:pl-20 lg:pr-18"
            >
              {/* Clean Subtle Glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/10 pointer-events-none"></div>

              <div className="relative z-10 flex flex-col items-center lg:items-start w-full">
                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-[1.2rem] bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-md border-[2px] border-white/30 mb-4 lg:mb-5 group-hover:-translate-y-1.5 transition-transform duration-500 relative">
                  <div className="absolute inset-0 bg-white/25 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  {renderNilaiIcon(nilaiItems[2]?.icon, "#ffffff")}
                </div>
                <h3 className="font-black text-2xl lg:text-[1.65rem] text-white mb-2.5 drop-shadow-sm tracking-tight leading-tight">
                  {nilaiItems[2]?.judul}
                </h3>
                <p className="text-white/95 text-[0.925rem] lg:text-[1.025rem] leading-relaxed font-light drop-shadow-xs max-w-xs">
                  {nilaiItems[2]?.deskripsi}
                </p>
              </div>
            </div>
          </div>

          {/* Block 4: Pilar 4 */}
          <div className="relative flex-1 z-10 -mt-10 lg:-mt-0 lg:-ml-10 drop-shadow-[0_8px_15px_rgba(0,0,0,0.06)] lg:drop-shadow-[10px_0_15px_rgba(0,0,0,0.08)] group">
            <div
              style={{ backgroundColor: shades.pilar4 }}
              className="w-full h-full relative
              [clip-path:polygon(0_0,42%_0,50%_2.5rem,58%_0,100%_0,100%_100%,0_100%)] 
              lg:[clip-path:polygon(0_0,100%_0,100%_100%,0_100%,0_58%,2.5rem_50%,0_42%)]
              transition-transform duration-500 hover:scale-[1.015] flex flex-col items-center text-center lg:items-start lg:text-left justify-center
              pt-16 pb-14 px-6 sm:px-10 md:px-14
              lg:py-16 xl:py-18 lg:pl-16 xl:pl-20 lg:pr-10 xl:pr-14"
            >
              {/* Clean Subtle Glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent pointer-events-none"></div>

              <div className="relative z-10 flex flex-col items-center lg:items-start w-full">
                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-[1.2rem] bg-white/80 backdrop-blur-xl flex items-center justify-center shadow-md border-[2px] border-white/80 mb-4 lg:mb-5 group-hover:-translate-y-1.5 transition-transform duration-500 relative">
                  <div className="absolute inset-0 bg-white/60 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  {renderNilaiIcon(nilaiItems[3]?.icon, shades.pilar4Text)}
                </div>
                <h3
                  style={{ color: shades.pilar4Text }}
                  className="font-black text-2xl lg:text-[1.65rem] mb-2.5 drop-shadow-xs tracking-tight leading-tight"
                >
                  {nilaiItems[3]?.judul}
                </h3>
                <p
                  style={{ color: shades.pilar4Text, opacity: 0.9 }}
                  className="text-[0.925rem] lg:text-[1.025rem] leading-relaxed font-normal max-w-xs"
                >
                  {nilaiItems[3]?.deskripsi}
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================================================================= */}
      {/* 4. KENAPA EMPATHIKA HADIR? (Editorial Magazine Layout) */}
      {/* ================================================================= */}
      <section className="w-full py-24 lg:py-32 bg-[#fbfbfb]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

            {/* Left: 3D Single Photo Layout */}
            <div 
              className="lg:w-1/2 w-full relative h-[320px] sm:h-[420px] md:h-[500px] lg:h-[550px] flex items-center justify-center group"
              style={{ perspective: '1200px' }}
            >
              <div
                style={{ backgroundColor: themeColor }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] sm:w-[300px] h-[240px] sm:h-[300px] opacity-15 blur-[80px] rounded-full z-0 transition-colors duration-700"
              ></div>

              <div 
                className="relative w-[90%] sm:w-[80%] h-[85%] rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all duration-700 ease-out z-10 border-[6px] sm:border-[8px] border-white group-hover:shadow-[0_30px_70px_rgba(0,0,0,0.2)] group-hover:-translate-y-2 group-hover:rotate-1"
              >
                 <div className="absolute inset-0 rounded-[2rem] overflow-hidden bg-gray-100">
                   <img
                     src={getSafeImageUrl(
                       content.kenapaHadir.fotoTim,
                       DEFAULT_TENTANG_KAMI.kenapaHadir.fotoTim
                     )}
                     alt="Empathika Team"
                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                     onError={(e) =>
                       handleImageFallback(
                         e,
                         DEFAULT_TENTANG_KAMI.kenapaHadir.fotoTim,
                         BACKUP_TEAM_PHOTO
                       )
                     }
                   />
                   <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-white/5 to-transparent opacity-40 mix-blend-overlay"></div>
                 </div>
              </div>
            </div>

            {/* Right: Typography Content */}
            <div className="lg:w-1/2">
              <h2 style={{ color: themeColor }} className="text-3xl md:text-5xl font-extrabold mb-8 leading-tight">
                {content.kenapaHadir.judul}
              </h2>
              <div className="space-y-6 text-gray-600 text-base md:text-lg leading-relaxed font-light">
                <p>{content.kenapaHadir.paragraf1}</p>
                <p>{content.kenapaHadir.paragraf2}</p>
                <p>{content.kenapaHadir.paragraf3}</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 5. ADA UNTUK SETIAP LANGKAHMU (Modern Clean Cards Grid) */}
      {/* ================================================================= */}
      <section className="w-full py-16 lg:py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 lg:mb-20">
            <h2 style={{ color: themeColor }} className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6">
              {content.layananSection?.judul || "Ada untuk Setiap Langkahmu"}
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-base md:text-lg font-light leading-relaxed">
              {content.layananSection?.deskripsi ||
                "Kami menyediakan beragam layanan psikologi untuk menemani setiap fase kehidupan dan membantu memenuhi kebutuhanmu."}
            </p>
          </div>

          {/* Dynamic Bento Box Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1100px] mx-auto mt-10 md:mt-12">
            
            {/* 1. Konsultasi (Span 2) - Dark Theme */}
            <Link
              href={withBiro("/layanan?category=01") as any}
              style={{ backgroundColor: shades.pilar1 }}
              className="md:col-span-2 rounded-[2.5rem] p-6 md:p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group block"
            >
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.5rem] bg-white/10 backdrop-blur-md text-white flex items-center justify-center mb-6 border border-white/20 relative z-10 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
              </div>
              <div className="relative z-10">
                <h3 className="font-extrabold text-3xl text-white mb-3 tracking-tight">Konsultasi</h3>
                <p className="text-white/80 text-base md:text-lg leading-relaxed font-light max-w-lg">Ruang untuk berbicara dengan psikolog profesional mengenai hal-hal yang sedang kamu hadapi, memahami diri, dan menemukan langkah yang sesuai dengan kebutuhanmu.</p>
              </div>
            </Link>

            {/* 2. Psikotes (Span 1) - Orange Glass Theme */}
            <Link href={withBiro("/layanan?category=02") as any} className="md:col-span-1 lg:col-span-1 bg-gradient-to-br from-[#fff7f0] to-[#ffe8d6] rounded-[2.5rem] p-6 md:p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group border border-orange-100 block">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.5rem] bg-[#d97706]/10 text-[#d97706] flex items-center justify-center mb-auto border border-[#d97706]/20 group-hover:bg-[#d97706] group-hover:text-white transition-colors duration-300">
                <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
              </div>
              <div className="mt-6">
                <h3 className="font-extrabold text-2xl text-[#d97706] mb-3 tracking-tight">Psikotes</h3>
                <p className="text-gray-600 text-sm leading-relaxed font-light">Tes psikologi untuk membantu mengenali potensi, kepribadian, minat, serta berbagai aspek diri melalui proses yang praktis dan terarah.</p>
              </div>
            </Link>

            {/* 3. Seminar (Span 1) - Soft Purple Theme */}
            <Link href={withBiro("/layanan?category=04") as any} className="md:col-span-1 lg:col-span-1 bg-[#f9f5fa] rounded-[2.5rem] p-6 md:p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group border border-[#cdb1db]/40 block">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.5rem] bg-[#8e4a9e]/10 text-[#8e4a9e] flex items-center justify-center mb-auto border border-[#8e4a9e]/20 group-hover:bg-[#8e4a9e] group-hover:text-white transition-colors duration-300">
                <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
              <div className="mt-6">
                <h3 className="font-extrabold text-2xl text-[#8e4a9e] mb-3 tracking-tight leading-tight">Seminar</h3>
                <p className="text-gray-600 text-sm leading-relaxed font-light">Kegiatan edukatif yang menghadirkan wawasan dan perspektif baru seputar psikologi, kesehatan mental, serta pengembangan diri.</p>
              </div>
            </Link>

            {/* 4. Asesmen (Span 1) - Dark Green Theme */}
            <Link href={withBiro("/layanan?category=05") as any} className="md:col-span-1 lg:col-span-1 bg-[#1c352d] rounded-[2.5rem] p-6 md:p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group relative overflow-hidden block">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.5rem] bg-white/10 text-white flex items-center justify-center mb-auto border border-white/20 group-hover:bg-white group-hover:text-[#1c352d] transition-colors duration-300 relative z-10">
                <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              </div>
              <div className="mt-6 relative z-10">
                <h3 className="font-extrabold text-2xl text-white mb-3 tracking-tight">Asesmen</h3>
                <p className="text-white/80 text-sm leading-relaxed font-light">Layanan evaluasi psikologis untuk mendukung kebutuhan seleksi, pemetaan potensi, dan pengembangan sumber daya manusia di perusahaan maupun organisasi.</p>
              </div>
            </Link>

            {/* 5. Workshop (Span 1) - Clean White Theme */}
            <Link href={withBiro("/layanan?category=03") as any} className="md:col-span-2 lg:col-span-1 bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group border border-gray-100 block">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.5rem] bg-gray-50 text-gray-800 flex items-center justify-center mb-auto border border-gray-100 group-hover:bg-gray-800 group-hover:text-white transition-colors duration-300">
                <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
              </div>
              <div className="mt-6">
                <h3 className="font-extrabold text-2xl text-gray-800 mb-3 tracking-tight">Workshop</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-light">Kegiatan belajar interaktif yang mengajak peserta mengeksplorasi berbagai topik psikologi dan kesehatan mental melalui diskusi serta aktivitas praktis.</p>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 6. CLOSING CTA (Warm & Direct) */}
      {/* ================================================================= */}
      <CtaSection />

    </div>
  )
}
