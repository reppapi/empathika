"use client"

import React, { ChangeEvent, RefObject } from "react"
import Image from "next/image"
import { AdminProfileData } from "../../types"

interface CardMediaPerkenalanProps {
  form: AdminProfileData
  videoUploadError: string | null
  videoFileInputRef: RefObject<HTMLInputElement | null>
  thumbnailFileInputRef: RefObject<HTMLInputElement | null>
  onVideoUpload: (e: ChangeEvent<HTMLInputElement>) => void
  onThumbnailUpload: (e: ChangeEvent<HTMLInputElement>) => void
  onRemoveVideo: () => void
  onRemoveThumbnail: () => void
}

export function CardMediaPerkenalan({
  form,
  videoUploadError,
  videoFileInputRef,
  thumbnailFileInputRef,
  onVideoUpload,
  onThumbnailUpload,
  onRemoveVideo,
  onRemoveThumbnail,
}: CardMediaPerkenalanProps) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
      <div className="border-b border-gray-100 pb-3">
        <h3 className="text-base font-bold text-[#561269]">
          Video Perkenalan (Greeting Video)
        </h3>
        <p className="text-xs text-gray-500">
          Unggah file video MP4 perkenalan singkat untuk menyapa calon klien di halaman profil Anda (maksimal 10 menit).
        </p>
      </div>

      {videoUploadError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3.5 flex items-start gap-2.5 text-red-700 text-xs">
          <svg className="w-4 h-4 shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{videoUploadError}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 p-5 rounded-2xl bg-purple-50/40 border border-purple-100">
        {/* Pratinjau Video Box */}
        <div className="relative w-full md:w-72 aspect-video rounded-2xl overflow-hidden bg-black/90 shrink-0 border-2 border-purple-200 shadow-md flex items-center justify-center">
          {form.videoIntroUrl ? (
            <video
              src={form.videoIntroUrl}
              poster={form.videoThumbnail || undefined}
              controls
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 gap-1.5 p-4 text-center">
              <svg className="w-8 h-8 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-semibold text-purple-200">Belum ada video</span>
              <span className="text-[10px] text-gray-400">Pilih file MP4 untuk mengunggah</span>
            </div>
          )}
        </div>

        {/* Kontrol Upload File MP4 */}
        <div className="flex-1 space-y-3 text-center md:text-left">
          <div>
            <p className="text-xs font-bold text-gray-800">
              Unggah File Video Langsung (.mp4)
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Format yang didukung khusus <strong>.mp4</strong>. Durasi maksimal yang diizinkan adalah <strong>10 menit (600 detik)</strong>.
            </p>
            {form.videoDuration && (
              <p className="text-xs font-semibold text-[#561269] mt-1.5 inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-purple-200">
                <svg className="w-3.5 h-3.5 text-[#561269]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Durasi Video: {form.videoDuration}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
            <input
              ref={videoFileInputRef as any}
              type="file"
              accept="video/mp4,.mp4"
              onChange={onVideoUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => videoFileInputRef.current?.click()}
              className="rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-5 py-2 text-xs font-bold text-gray-950 shadow-sm transition active:scale-95 cursor-pointer"
            >
              {form.videoIntroUrl ? "Ganti File Video (.mp4)" : "Pilih File Video (.mp4)"}
            </button>
            {form.videoIntroUrl && (
              <button
                type="button"
                onClick={onRemoveVideo}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 hover:text-red-600 transition cursor-pointer"
              >
                Hapus Video
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sub-bagian Upload Thumbnail Video (JPG / PNG) */}
      <div className="pt-3 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-200/80">
          <div className="relative w-28 h-20 sm:w-36 sm:h-24 rounded-xl overflow-hidden bg-purple-100 shrink-0 border border-purple-200 flex items-center justify-center">
            {form.videoThumbnail ? (
              <Image
                src={form.videoThumbnail}
                alt="Thumbnail Video"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 gap-1 p-2 text-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-[10px] text-gray-500">Tanpa Cover</span>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div>
              <p className="text-xs font-bold text-gray-800">
                Foto Cover / Thumbnail Video (JPG / PNG)
              </p>
              <p className="text-[11px] text-gray-500">
                Foto pratinjau yang ditampilkan sebelum klien memutar video (opsional).
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
              <input
                ref={thumbnailFileInputRef as any}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={onThumbnailUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => thumbnailFileInputRef.current?.click()}
                className="rounded-full border border-gray-300 bg-white hover:bg-gray-100 px-4 py-1.5 text-xs font-bold text-gray-700 shadow-sm transition active:scale-95 cursor-pointer"
              >
                {form.videoThumbnail ? "Ganti Foto Cover" : "Unggah Foto Cover"}
              </button>
              {form.videoThumbnail && (
                <button
                  type="button"
                  onClick={onRemoveThumbnail}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-red-600 transition cursor-pointer"
                >
                  Hapus Cover
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

