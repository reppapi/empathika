"use client"

import { useState } from "react"
import Image from "next/image"
import { EventDokumentasiApi } from "@/services/event.service"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface ClientDokumentasiDetailModalProps {
  isOpen: boolean
  onClose: () => void
  item: EventDokumentasiApi | null
}

export default function ClientDokumentasiDetailModal({
  isOpen,
  onClose,
  item,
}: ClientDokumentasiDetailModalProps) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0)

  if (!isOpen || !item) return null

  const photos = item.foto || []
  const hasPhotos = photos.length > 0
  const activePhoto = hasPhotos ? photos[activePhotoIdx] : null

  const tglTeks = item.tanggal
    ? new Date(item.tanggal).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1))
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setActivePhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0))
  }

  return (
    /* Background transparan buram (backdrop blur) */
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-poppins select-none"
    >
      {/* Tombol Tutup (Kanan Atas) */}
      <button
        type="button"
        onClick={onClose}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white/90 hover:text-white transition-all cursor-pointer backdrop-blur-sm shadow-lg hover:scale-105"
        title="Tutup"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Counter Foto (Kiri Atas) seperti 4/6 di screenshot */}
      {hasPhotos && (
        <div className="fixed top-4 left-4 sm:top-6 sm:left-6 z-50 px-3.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white/90 text-xs sm:text-sm font-semibold tracking-wide">
          {activePhotoIdx + 1} / {photos.length}
        </div>
      )}

      {/* Main Container Foto & Teks */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl flex flex-col items-center justify-center gap-4"
      >
        {/* Foto Frame Utama */}
        <div className="relative w-full max-h-[72vh] aspect-[16/10] sm:aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden bg-black/40 flex items-center justify-center shadow-2xl">
          {activePhoto ? (
            <Image
              src={activePhoto.foto_url}
              alt={`${item.judul} foto ${activePhotoIdx + 1}`}
              fill
              unoptimized
              className="object-cover sm:object-contain"
            />
          ) : (
            <div className="text-white/60 text-sm">Tidak ada foto dokumentasi</div>
          )}

          {/* Tombol Prev / Next (Panah Bulat) */}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer shadow-xl backdrop-blur-sm hover:scale-110 z-10"
                title="Foto Sebelumnya"
              >
                <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer shadow-xl backdrop-blur-sm hover:scale-110 z-10"
                title="Foto Selanjutnya"
              >
                <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
            </>
          )}
        </div>

        {/* Teks Judul, Deskripsi & Tanggal di bawah foto */}
        <div className="text-center max-w-3xl px-4">
          <h3 className="text-white text-sm sm:text-base md:text-lg font-bold drop-shadow-md">
            {item.judul}
          </h3>
          {item.deskripsi && (
            <p className="text-white/85 text-xs sm:text-sm mt-1 leading-relaxed line-clamp-2 drop-shadow-sm font-normal">
              {item.deskripsi}
            </p>
          )}
          {tglTeks && (
            <p className="text-white/60 text-[11px] sm:text-xs mt-1.5 font-medium tracking-wide drop-shadow-sm">
              {tglTeks}
            </p>
          )}
        </div>

        {/* Thumbnail Strip Horizontal (persis seperti deretan thumbnail di bawah pada referensi) */}
        {photos.length > 1 && (
          <div className="flex items-center justify-center gap-2 overflow-x-auto max-w-full px-2 py-1 scrollbar-none">
            {photos.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePhotoIdx(idx)}
                className={`relative w-14 h-10 sm:w-20 sm:h-14 rounded-lg sm:rounded-xl overflow-hidden shrink-0 transition-all cursor-pointer ${
                  activePhotoIdx === idx
                    ? "ring-2 ring-white scale-105 opacity-100 shadow-md"
                    : "opacity-40 hover:opacity-80"
                }`}
              >
                <Image
                  src={p.foto_url}
                  alt={`Thumb ${idx + 1}`}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
