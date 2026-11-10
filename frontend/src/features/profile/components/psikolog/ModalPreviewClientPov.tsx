"use client"

import Image from "next/image"
import { AdminProfileData } from "../../types"

interface ModalPreviewClientPovProps {
  isOpen: boolean
  onClose: () => void
  form: AdminProfileData
  initials: string
  isPlayingVideoPreview: boolean
  setIsPlayingVideoPreview: (playing: boolean) => void
  stripOuterQuotes: (text?: string) => string
}

export function ModalPreviewClientPov({
  isOpen,
  onClose,
  form,
  initials,
  isPlayingVideoPreview,
  setIsPlayingVideoPreview,
  stripOuterQuotes,
}: ModalPreviewClientPovProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
        {/* Header Modal */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white/95 backdrop-blur-md px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <h4 className="text-sm font-bold text-[#561269]">
                Pratinjau Tampilan Profil (POV Klien Empathika)
              </h4>
              <p className="text-[11px] text-gray-500">
                Tampilan langsung sama persis seperti yang dilihat oleh klien di halaman publik Empathika
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose()
              setIsPlayingVideoPreview(false)
            }}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Isi Konten Pratinjau POV Klien */}
        <div className="bg-white">
          <div className="w-full px-6 sm:px-10 pt-6 pb-8 space-y-8">
            {/* Header Profil & Video Intro di Bagian Atas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Kolom Kiri: Foto Profil & Info Pokok */}
              <div className="lg:col-span-7 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                <div className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full overflow-hidden shrink-0 bg-[#D4B2E8] flex items-center justify-center shadow-inner border-2 border-purple-100">
                  {form.foto ? (
                    <Image
                      src={form.foto}
                      alt={form.nama}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-[#561269] font-bold text-4xl select-none">
                      {initials}
                    </span>
                  )}
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-[#561269] bg-purple-100 rounded-full">
                      {form.spesialisasi || "Psikolog"}
                    </span>
                    {form.instagram && (
                      <span className="inline-block px-3 py-1 text-xs font-medium text-purple-700 bg-purple-50 rounded-full border border-purple-200">
                        {form.instagram}
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#561269] tracking-tight leading-snug">
                    {form.nama || "Nama Tenaga Ahli"}
                  </h2>
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600">
                    <p>
                      Jumlah sesi: <span className="font-semibold text-gray-900">0 Sesi</span>
                    </p>
                    {form.kategoriProfesi === "psikolog" && form.noStr && (
                      <>
                        <span className="hidden sm:inline text-gray-300">•</span>
                        <p>
                          No. STR: <span className="font-semibold text-[#561269] font-mono">{form.noStr}</span>
                        </p>
                      </>
                    )}
                    {form.kategoriProfesi === "psikolog" && form.noSipp && (
                      <>
                        <span className="hidden sm:inline text-gray-300">•</span>
                        <p>
                          No. SIPP: <span className="font-semibold text-[#561269] font-mono">{form.noSipp}</span>
                        </p>
                      </>
                    )}
                    {form.kategoriProfesi === "psikolog" && form.noSilp && (
                      <>
                        <span className="hidden sm:inline text-gray-300">•</span>
                        <p>
                          No. SILP: <span className="font-semibold text-[#561269] font-mono">{form.noSilp}</span>
                        </p>
                      </>
                    )}
                  </div>

                  {/* Quote / Prinsip Diri */}
                  {form.quote && form.quote.trim() ? (
                    <div className="mt-3 bg-[#FAF5FD] border-l-4 border-[#561269] p-3.5 sm:p-4 rounded-r-2xl text-left shadow-2xs">
                      <p className="text-gray-800 text-xs sm:text-sm italic leading-relaxed">
                        &ldquo;{stripOuterQuotes(form.quote)}&rdquo;
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Kolom Kanan: Video Perkenalan Diri (Video Greeting) */}
              <div className="lg:col-span-5 w-full">
                <div className="relative rounded-3xl overflow-hidden shadow-lg border border-purple-100 bg-[#3B074B] aspect-video flex items-center justify-center group">
                  {isPlayingVideoPreview && form.videoIntroUrl ? (
                    <video
                      src={form.videoIntroUrl}
                      poster={form.videoThumbnail || undefined}
                      controls
                      autoPlay
                      className="w-full h-full object-cover"
                    >
                      Browser Anda tidak mendukung tag video.
                    </video>
                  ) : (
                    <>
                      {form.videoThumbnail || form.foto ? (
                        <Image
                          src={form.videoThumbnail || form.foto!}
                          alt="Thumbnail Video Perkenalan"
                          fill
                          className="object-cover opacity-60 group-hover:opacity-75 group-hover:scale-105 transition-all duration-300"
                        />
                      ) : null}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span>Video Perkenalan</span>
                      </div>

                      {form.videoDuration && (
                        <div className="absolute bottom-4 right-4 z-10 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-white text-[11px] font-mono">
                          {form.videoDuration}
                        </div>
                      )}

                      {form.videoIntroUrl ? (
                        <button
                          type="button"
                          onClick={() => setIsPlayingVideoPreview(true)}
                          className="relative z-10 flex items-center gap-3 bg-white/90 hover:bg-white text-[#561269] px-6 py-3 rounded-full font-bold text-sm shadow-2xl hover:scale-105 transition-all duration-200 cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#561269] text-white flex items-center justify-center pl-0.5">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                          <span>Tonton Video Perkenalan</span>
                        </button>
                      ) : (
                        <div className="relative z-10 text-center p-4 text-white">
                          <p className="text-xs font-semibold">Belum Ada Video Perkenalan</p>
                          <p className="text-[10px] text-gray-300 mt-0.5">Unggah file MP4 di form edit profil</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Perkenalan Profil & Bio */}
            <section className="space-y-3">
              <h3 className="text-base sm:text-lg font-bold text-[#561269] uppercase tracking-wider">
                PERKENALAN PROFIL
              </h3>
              <div className="space-y-4 text-gray-800 text-sm sm:text-base leading-relaxed">
                {form.bio && form.bio.trim() ? (
                  form.bio
                    .split(/\r?\n+/)
                    .filter(Boolean)
                    .map((paragraf, idx) => (
                      <p key={idx} className="whitespace-pre-wrap">
                        {paragraf}
                      </p>
                    ))
                ) : (
                  <p className="whitespace-pre-line text-gray-400 italic">
                    Perkenalan profil belum dicantumkan.
                  </p>
                )}
              </div>

              <div className="pt-2 space-y-2">
                {form.pendidikanText && (
                  <div className="text-sm sm:text-base text-gray-600 font-semibold">
                    <span>Pendidikan / Institusi:</span>
                    <div className="font-normal text-gray-800 whitespace-pre-wrap leading-relaxed mt-1">
                      {form.pendidikanText}
                    </div>
                  </div>
                )}
                {form.kategoriProfesi === "psikolog" && (form.noStr || form.noSipp) && (
                  <p className="text-sm sm:text-base text-gray-600 font-semibold">
                    Nomor Izin Praktik:{" "}
                    <span className="font-normal text-gray-800">
                      {form.noStr && `STR: ${form.noStr}`}
                      {form.noStr && form.noSipp && " | "}
                      {form.noSipp && `SIPP: ${form.noSipp}`}
                    </span>
                  </p>
                )}
              </div>
            </section>

            {/* Keahlian Konseling */}
            <section className="space-y-3 pt-2">
              <h3 className="text-base sm:text-lg font-bold text-[#561269] uppercase tracking-wider">
                KEAHLIAN
              </h3>
              <div className="flex flex-wrap gap-2.5 pt-1">
                {form.keahlian && form.keahlian.length > 0 ? (
                  form.keahlian.map((item: string, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-4 py-2 rounded-xl bg-gray-50 text-gray-800 text-sm font-medium border border-gray-200/80 shadow-2xs hover:bg-purple-50/60 hover:border-purple-200 transition-colors"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Informasi keahlian belum tersedia.</p>
                )}
              </div>
            </section>

            {/* Jadwal Praktik Info */}
            <section className="space-y-3 pt-2 pb-2">
              <h3 className="text-base sm:text-lg font-bold text-[#561269] uppercase tracking-wider">
                JADWAL PRAKTEK
              </h3>
              <div className="flex flex-wrap gap-3.5">
                <div className="bg-[#FAF5FD] border border-purple-200/80 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-medium text-gray-800">
                  <span className="font-semibold text-[#561269]">Online & Offline:</span> Jadwal dibuka fleksibel sesuai ketersediaan slot
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="sticky bottom-0 z-30 border-t border-gray-100 bg-gray-50 px-6 py-3.5 text-right flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Mode Pratinjau POV Klien &bull; Perubahan belum otomatis tersimpan
          </span>
          <button
            type="button"
            onClick={() => {
              onClose()
              setIsPlayingVideoPreview(false)
            }}
            className="rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-6 py-2 text-xs font-bold text-gray-950 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>
  )
}

