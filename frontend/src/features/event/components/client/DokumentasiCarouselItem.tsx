"use client"

import { useState, useRef, useEffect, TouchEvent } from "react"
import Image from "next/image"
import { EventDokumentasiApi } from "@/services/event.service"
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react"

interface DokumentasiCarouselItemProps {
  item: EventDokumentasiApi
}

export function DokumentasiCarouselItem({ item }: DokumentasiCarouselItemProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  const photos =
    item.foto && item.foto.length > 0
      ? item.foto
      : item.thumbnail
      ? [{ id: "thumb", foto_url: item.thumbnail, urutan: 0, createdAt: item.createdAt }]
      : []

  const total = photos.length

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : total - 1))
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev < total - 1 ? prev + 1 : 0))
  }

  // Swipe gesture support
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    const diff = touchStartX.current - touchEndX.current
    if (diff > 50) {
      handleNext()
    } else if (diff < -50) {
      handlePrev()
    }
    touchStartX.current = null
    touchEndX.current = null
  }

  const tanggalFormatted = item.tanggal
    ? new Date(item.tanggal).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null

  return (
    <div className="w-full flex flex-col gap-6 pt-4 border-t border-gray-200/60 first:border-t-0 first:pt-0">
      {/* ── 1. HEADER: Judul Acara di Tengah & Tanggal (Sesuai Referensi Gambar) ── */}
      <div className="flex flex-col items-center justify-center text-center gap-1.5 max-w-2xl mx-auto">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-[#561269] tracking-tight leading-snug">
          {item.judul}
        </h3>
        {tanggalFormatted && (
          <span className="text-xs sm:text-sm font-semibold text-gray-500">
            {tanggalFormatted}
          </span>
        )}
      </div>

      {/* ── 2. CAROUSEL SLIDER FOTO FULL KE PINGGIR (EDGE-TO-EDGE OVERFLOW SCREEN) ── */}
      {total > 1 ? (
        <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-4 select-none overflow-hidden">
          {/* Viewport Carousel dengan Swipe gesture: Full Width Screen */}
          <div
            className="relative w-full h-[340px] sm:h-[460px] md:h-[540px] lg:h-[600px] flex items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {photos.map((photo, idx) => {
              // Hitung jarak relatif terhadap activeIndex dengan perulangan sirkular (looping tak hingga)
              let offset = (idx - activeIndex) % total
              if (offset > Math.floor(total / 2)) offset -= total
              if (offset < -Math.floor(total / 2)) offset += total

              const isCenter = offset === 0
              const isPrev = offset === -1
              const isNext = offset === 1
              const isFarLeft = offset === -2
              const isFarRight = offset === 2
              const isVisible = Math.abs(offset) <= 2

              if (!isVisible) return null

              let transformStyle = ""
              let zIndex = 10 - Math.abs(offset)
              let opacity = 1

              if (isCenter) {
                // Foto aktif di tengah: besar penuh, di paling depan
                transformStyle = "translateX(0) scale(1)"
                opacity = 1
                zIndex = 30
              } else if (isPrev) {
                // Foto di kiri: terlihat jelas membentang ke pinggir kiri layar
                transformStyle = "translateX(-82%) scale(0.92)"
                opacity = 0.85
                zIndex = 20
              } else if (isNext) {
                // Foto di kanan: terlihat jelas membentang ke pinggir kanan layar
                transformStyle = "translateX(82%) scale(0.92)"
                opacity = 0.85
                zIndex = 20
              } else if (isFarLeft) {
                transformStyle = "translateX(-155%) scale(0.8)"
                opacity = 0.35
                zIndex = 10
              } else if (isFarRight) {
                transformStyle = "translateX(155%) scale(0.8)"
                opacity = 0.35
                zIndex = 10
              }

              return (
                <div
                  key={photo.id || idx}
                  onClick={() => setActiveIndex(idx)}
                  style={{
                    transform: transformStyle,
                    zIndex,
                    opacity,
                  }}
                  className={`absolute w-[72vw] max-w-[850px] aspect-video rounded-none overflow-hidden shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer bg-gray-900 border border-gray-800 ${
                    isCenter ? "ring-2 ring-black/25" : "hover:opacity-95"
                  }`}
                >
                  <Image
                    src={photo.foto_url}
                    alt={`${item.judul} foto ${idx + 1}`}
                    fill
                    unoptimized
                    priority={idx === 0}
                    className="object-cover sm:object-contain"
                  />
                </div>
              )
            })}
          </div>

          {/* Navigation Controls di Bawah Slider (Tombol Kiri-Kanan Bulat + Dots) Sesuai Referensi Gambar */}
          <div className="flex items-center justify-center gap-6 mt-5">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Foto sebelumnya"
              className="w-11 h-11 rounded-full border border-gray-300 bg-white flex items-center justify-center text-gray-700 hover:text-black hover:border-gray-500 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5 pr-0.5" />
            </button>

            {/* Pagination Dots */}
            <div className="flex items-center gap-2">
              {photos.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Ke foto ${idx + 1}`}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${
                    idx === activeIndex
                      ? "bg-[#561269] w-3 h-3"
                      : "bg-gray-300 hover:bg-gray-400 w-2 h-2"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Foto berikutnya"
              className="w-11 h-11 rounded-full border border-gray-300 bg-white flex items-center justify-center text-gray-700 hover:text-black hover:border-gray-500 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            >
              <ChevronRight className="w-5 h-5 pl-0.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Jika Hanya 1 Foto / Thumbnail: Kotak Tegas Persegi Panjang Tanpa Rounded */
        <div className="relative w-full aspect-video rounded-none overflow-hidden bg-gray-900 shadow-lg border border-gray-800">
          {photos[0] ? (
            <Image
              src={photos[0].foto_url}
              alt={item.judul}
              fill
              unoptimized
              className="object-cover sm:object-contain"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100">
              <ImageIcon className="w-12 h-12 mb-2 stroke-[1.5]" />
              <span className="text-xs font-medium">Belum ada foto dokumentasi</span>
            </div>
          )}
        </div>
      )}

      {/* ── 3. PARAGRAF DESKRIPSI DI BAWAH FOTO ── */}
      {item.deskripsi && (
        <p className="text-gray-700 text-sm sm:text-base leading-relaxed text-justify mt-1">
          {item.deskripsi}
        </p>
      )}
    </div>
  )
}
