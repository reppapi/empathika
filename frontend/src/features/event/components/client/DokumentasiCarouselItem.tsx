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

      {/* ── 2. CAROUSEL SLIDER DENGAN PERSPEKTIF 3D (REFERENSI GAMBAR USER) ── */}
      {total > 1 ? (
        <div className="relative w-full py-2 select-none">
          {/* Viewport Carousel dengan Swipe (Tinggi compact proporsional max-w-3xl seperti Kerja Sama) */}
          <div
            className="relative w-full h-[220px] sm:h-[300px] md:h-[350px] flex items-center justify-center overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {photos.map((photo, idx) => {
              // Hitung jarak relatif terhadap activeIndex dengan perulangan sirkular
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
                transformStyle = "translateX(0) scale(1)"
                opacity = 1
                zIndex = 30
              } else if (isPrev) {
                transformStyle = "translateX(-48%) scale(0.85)"
                opacity = 0.85
                zIndex = 20
              } else if (isNext) {
                transformStyle = "translateX(48%) scale(0.85)"
                opacity = 0.85
                zIndex = 20
              } else if (isFarLeft) {
                transformStyle = "translateX(-85%) scale(0.7)"
                opacity = 0.5
                zIndex = 10
              } else if (isFarRight) {
                transformStyle = "translateX(85%) scale(0.7)"
                opacity = 0.5
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
                  className={`absolute w-[75%] sm:w-[68%] md:w-[62%] aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ease-out cursor-pointer bg-black/5 ${
                    isCenter ? "ring-2 ring-black/5" : "hover:opacity-95"
                  }`}
                >
                  <div className="relative w-full h-full bg-gray-900">
                    <Image
                      src={photo.foto_url}
                      alt={`${item.judul} foto ${idx + 1}`}
                      fill
                      unoptimized
                      className="object-contain"
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Tombol Navigasi Bulat Minimalis di Bawah Slider (Sesuai Referensi Gambar) */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Foto sebelumnya"
              className="w-10 h-10 rounded-full border border-gray-900/80 bg-white hover:bg-gray-100 text-gray-900 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Foto berikutnya"
              className="w-10 h-10 rounded-full border border-gray-900/80 bg-white hover:bg-gray-100 text-gray-900 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        /* Jika Hanya 1 Foto / Thumbnail: Tampil Frame 16:9 Utuh (Object Contain) */
        <div className="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-gray-900 shadow-lg">
          {photos[0] ? (
            <Image
              src={photos[0].foto_url}
              alt={item.judul}
              fill
              unoptimized
              className="object-contain"
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
