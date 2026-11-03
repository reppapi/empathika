"use client"

import { useState } from "react"
import Image from "next/image"
import { EventDokumentasiApi } from "@/services/event.service"
import { X, Calendar, ImageIcon, ChevronLeft, ChevronRight } from "lucide-react"

interface AdminDokumentasiDetailModalProps {
  isOpen: boolean
  onClose: () => void
  item: EventDokumentasiApi | null
  onEdit: (id: string) => void
}

export default function AdminDokumentasiDetailModal({
  isOpen,
  onClose,
  item,
  onEdit,
}: AdminDokumentasiDetailModalProps) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0)

  if (!isOpen || !item) return null

  const photos = item.foto || []
  const hasPhotos = photos.length > 0
  const activePhoto = hasPhotos ? photos[activePhotoIdx] : null

  const tglTeks = item.tanggal
    ? new Date(item.tanggal).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-"

  const handlePrev = () => {
    setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1))
  }

  const handleNext = () => {
    setActivePhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden font-poppins border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#FCFAFD]">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#561269] bg-purple-50 px-2.5 py-0.5 rounded-full">
              Detail Dokumentasi Event
            </span>
            <h2 className="text-lg font-black text-gray-900 mt-1 line-clamp-1">{item.judul}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Modal (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Gallery Viewer (Carousel / Lightbox) */}
          {hasPhotos ? (
            <div className="space-y-3">
              {/* Foto Utama */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-gray-950 flex items-center justify-center group shadow-sm">
                {activePhoto && (
                  <Image
                    src={activePhoto.foto_url}
                    alt={`${item.judul} foto ${activePhotoIdx + 1}`}
                    fill
                    unoptimized
                    className="object-contain"
                  />
                )}

                {/* Counter Tag */}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full">
                  {activePhotoIdx + 1} / {photos.length}
                </div>

                {/* Navigasi Prev/Next */}
                {photos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all opacity-80 hover:opacity-100 cursor-pointer shadow-md"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all opacity-80 hover:opacity-100 cursor-pointer shadow-md"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Strip */}
              {photos.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {photos.map((p, idx) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        activePhotoIdx === idx
                          ? "border-[#561269] ring-2 ring-[#561269]/30 scale-105"
                          : "border-transparent opacity-60 hover:opacity-100"
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
          ) : (
            <div className="w-full aspect-video rounded-2xl bg-gray-50 border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
              <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-xs font-semibold">Tidak ada foto dokumentasi yang diunggah</p>
            </div>
          )}

          {/* Info Details */}
          <div className="bg-[#FCFAFD] rounded-2xl p-5 border border-purple-100/60 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#561269]">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>Tanggal Pelaksanaan: {tglTeks}</span>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Rangkuman / Deskripsi Kegiatan
              </p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line font-medium">
                {item.deskripsi}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full border border-gray-200 text-gray-700 text-xs sm:text-sm font-bold hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={() => {
              onClose()
              onEdit(item.id)
            }}
            className="px-6 py-2.5 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 text-xs sm:text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Edit Dokumentasi
          </button>
        </div>
      </div>
    </div>
  )
}

