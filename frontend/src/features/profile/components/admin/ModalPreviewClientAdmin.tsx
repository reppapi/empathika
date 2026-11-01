"use client"

import React from "react"
import Image from "next/image"
import { AdminProfileData } from "../../types"

interface ModalPreviewClientAdminProps {
  isOpen: boolean
  onClose: () => void
  form: AdminProfileData
  initials: string
  isPlayingVideoPreview: boolean
  setIsPlayingVideoPreview: (v: boolean) => void
}

export function ModalPreviewClientAdmin({
  isOpen,
  onClose,
  form,
  initials,
  isPlayingVideoPreview,
  setIsPlayingVideoPreview,
}: ModalPreviewClientAdminProps) {
  if (!isOpen) return null

  const handleClose = () => {
    setIsPlayingVideoPreview(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
        {/* Header Modal */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white/95 backdrop-blur-md px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <h4 className="text-sm font-bold text-[#561269]">
              Pratinjau Tampilan Profil (POV Klien Empathika)
            </h4>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Konten Replika Detail POV Klien */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Header Profil & Video */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Kolom Kiri: Foto Profil & Info */}
            <div className="md:col-span-7 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden shrink-0 bg-[#D4B2E8] flex items-center justify-center shadow-inner border-2 border-purple-100">
                {form.foto ? (
                  <Image
                    src={form.foto}
                    alt={form.nama || "Foto Profil"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-[#561269] font-bold text-3xl select-none">
                    {initials}
                  </span>
                )}
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="inline-block px-3 py-1 text-[11px] font-semibold text-[#561269] bg-purple-100 rounded-full">
                    {form.spesialisasi || "Psikolog"}
                  </span>
                  {form.instagram && (
                    <span className="inline-block px-3 py-1 text-[11px] font-medium text-purple-700 bg-purple-50 rounded-full border border-purple-200">
                      {form.instagram}
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-[#561269] tracking-tight">
                  {form.nama}
                </h2>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 text-xs text-gray-600">
                  {form.noStr && (
                    <p>
                      STR: <span className="font-semibold text-[#561269] font-mono">{form.noStr}</span>
                    </p>
                  )}
                  {form.noSipp && (
                    <p>
                      SIPP: <span className="font-semibold text-[#561269] font-mono">{form.noSipp}</span>
                    </p>
                  )}
                </div>

                {form.quote && (
                  <div className="mt-2 bg-[#FAF5FD] border-l-4 border-[#561269] p-3 rounded-r-2xl text-left">
                    <p className="text-gray-800 text-xs italic">
                      &ldquo;{form.quote}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Kolom Kanan: Video Perkenalan */}
            <div className="md:col-span-5 w-full">
              <div className="relative rounded-2xl overflow-hidden shadow-md border border-purple-100 bg-[#3B074B] aspect-video flex items-center justify-center">
                {isPlayingVideoPreview ? (
                  <video
                    src={form.videoIntroUrl || "https://www.w3schools.com/html/mov_bbb.mp4"}
                    controls
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    {form.videoThumbnail || form.foto ? (
                      <Image
                        src={form.videoThumbnail || form.foto!}
                        alt="Thumbnail Video"
                        fill
                        className="object-cover opacity-60"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[10px] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span>Video Perkenalan</span>
                    </div>
                    {form.videoDuration && (
                      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-white text-[10px] font-mono">
                        {form.videoDuration}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsPlayingVideoPreview(true)}
                      className="relative z-10 flex items-center gap-2 bg-white/95 text-[#561269] px-4 py-2 rounded-full font-bold text-xs shadow-lg hover:scale-105 transition"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Putar Video
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Bagian Profil */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#561269] uppercase tracking-wider">
              PROFIL PSIKOLOG
            </h4>
            <div className="space-y-2 text-xs sm:text-sm text-gray-700 leading-relaxed">
              {form.bio && form.bio.trim() ? (
                form.bio
                  .split(/\n\s*\n/)
                  .filter(Boolean)
                  .map((p, i) => (
                    <p key={i} className="whitespace-pre-line">
                      {p}
                    </p>
                  ))
              ) : (
                <p className="whitespace-pre-line text-gray-400 italic">
                  Perkenalan profil belum dicantumkan.
                </p>
              )}
            </div>
            {form.pendidikanText && (
              <p className="text-xs text-gray-500 pt-1">
                <span className="font-semibold text-gray-700">Pendidikan: </span>
                {form.pendidikanText}
              </p>
            )}
          </div>

          {/* Bagian Keahlian */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#561269] uppercase tracking-wider">
              KEAHLIAN PSIKOLOG
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {(form.keahlian || []).map((k, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF5FD] border border-purple-200/80 text-[11px] font-medium text-[#561269]"
                >
                  {k}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-3.5 text-right">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-5 py-2 text-xs font-bold text-gray-950 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>
  )
}

