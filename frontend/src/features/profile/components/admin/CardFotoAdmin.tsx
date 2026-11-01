"use client"

import React from "react"
import Image from "next/image"
import { RoleType } from "../../types"

interface CardFotoAdminProps {
  role?: RoleType
  foto: string | null
  nama: string
  initials: string
  spesialisasi?: string
  fileInputRef: React.RefObject<HTMLInputElement>
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemovePhoto: () => void
  onOpenPreview: () => void
}

export function CardFotoAdmin({
  role = "admin",
  foto,
  nama,
  initials,
  spesialisasi,
  fileInputRef,
  onPhotoUpload,
  onRemovePhoto,
  onOpenPreview,
}: CardFotoAdminProps) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          {/* Foto / Inisial Avatar */}
          <div className="relative group">
            <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-3xl overflow-hidden bg-gradient-to-tr from-purple-100 to-purple-50 border-2 border-purple-200/80 shadow-md flex items-center justify-center">
              {foto ? (
                <Image
                  src={foto}
                  alt={nama || "Foto Profil"}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <span className="text-3xl font-extrabold text-[#561269] select-none">
                  {initials}
                </span>
              )}
            </div>

            {/* Badge Status */}
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
              <span className="h-2 w-2 rounded-full bg-white" />
            </div>
          </div>

          {/* Teks & Keterangan Foto */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h3 className="text-lg sm:text-xl font-extrabold text-gray-900">
                Foto Profil
              </h3>
              <span className="inline-block rounded-full bg-purple-100 px-3 py-0.5 text-xs font-semibold text-[#561269]">
                {role === "admin" ? "Admin Utama" : spesialisasi || "Psikolog / Konselor"}
              </span>
            </div>
            <p className="text-xs text-gray-600 max-w-sm font-medium">
              Rekomendasi: <span className="font-bold text-[#561269]">600 × 600 px (rasio 1:1, wajah di tengah)</span>
            </p>
            <p className="text-[11px] text-gray-400">
              Format JPG, PNG, atau WebP • Bebas ukuran berapa pun, otomatis dikompresi
            </p>

            {/* Tombol Aksi Foto */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onPhotoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-4 py-2 text-xs font-bold text-gray-950 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                {foto ? "Ubah Foto" : "Unggah Foto"}
              </button>

              {foto && (
                <button
                  type="button"
                  onClick={onRemovePhoto}
                  className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition-all active:scale-95 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Hapus
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Preview Client POV Button (khusus Psikolog) */}
        {role === "psikolog" && (
          <div className="flex sm:flex-col items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
            <button
              type="button"
              onClick={onOpenPreview}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4 text-[#561269]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              Lihat Pratinjau (POV Klien)
            </button>
            <span className="text-[11px] text-gray-400 hidden sm:block text-center">
              Live preview tampilan profil Anda
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

