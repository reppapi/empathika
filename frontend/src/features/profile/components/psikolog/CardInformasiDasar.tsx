"use client"

import React, { ChangeEvent, RefObject } from "react"
import Image from "next/image"
import { AdminProfileData } from "../../types"

interface CardInformasiDasarProps {
  form: AdminProfileData
  initials: string
  fileInputRef: RefObject<HTMLInputElement | null>
  onPhotoUpload: (e: ChangeEvent<HTMLInputElement>) => void
  onRemovePhoto: () => void
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onOpenPreview: () => void
  stripOuterQuotes: (text?: string) => string
}

export function CardInformasiDasar({
  form,
  initials,
  fileInputRef,
  onPhotoUpload,
  onRemovePhoto,
  onChange,
  onOpenPreview,
  stripOuterQuotes,
}: CardInformasiDasarProps) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
      <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-[#561269]">
            Profil Tenaga Ahli
          </h3>
          <p className="text-xs text-gray-500">
            Foto profil, biodata diri, riwayat pendidikan, dan kontak yang tampil pada sistem layanan.
          </p>
        </div>
        {/* Tombol Pratinjau Tampilan Klien (POV Klien) */}
        <button
          type="button"
          onClick={onOpenPreview}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full border border-purple-200 bg-purple-50/70 hover:bg-purple-100 px-3.5 py-1.5 text-xs font-bold text-[#561269] transition shadow-2xs cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 text-[#561269]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Lihat Pratinjau (POV Klien)
        </button>
      </div>

      {/* Area Foto Profil */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Foto Profil Tenaga Ahli
        </label>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-2xl bg-purple-50/40 border border-purple-100">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden bg-white shrink-0 border-2 border-purple-200 shadow-sm flex items-center justify-center">
            {form.foto ? (
              <Image src={form.foto} alt="Preview Foto" fill className="object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 gap-1">
                <span className="text-3xl font-extrabold text-[#561269] select-none">
                  {initials}
                </span>
                <span className="text-[11px] font-semibold text-[#561269]">Pratinjau Foto</span>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2 text-center sm:text-left">
            <p className="text-xs font-medium text-gray-700">
              Ubah pas foto formal atau foto profil profesional tenaga ahli.
            </p>
            <p className="text-xs text-gray-600 font-medium">
              Rekomendasi ukuran: <span className="font-bold text-[#561269]">600 × 600 piksel (Persegi / Rasio 1:1, wajah di tengah)</span>
            </p>
            <p className="text-[11px] text-gray-400">
              Format JPG, PNG, atau WebP • Otomatis disesuaikan untuk kartu dan profil klien
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
              <input
                ref={fileInputRef as any}
                type="file"
                accept="image/*"
                onChange={onPhotoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-5 py-2 text-xs font-bold text-gray-950 shadow-sm transition active:scale-95 cursor-pointer"
              >
                {form.foto ? "Ganti Foto" : "Pilih & Unggah Foto"}
              </button>
              {form.foto && (
                <button
                  type="button"
                  onClick={onRemovePhoto}
                  className="rounded-full border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-600 hover:text-red-600 transition cursor-pointer"
                >
                  Hapus
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Input Data Pokok */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Nama Lengkap & Gelar <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nama"
            value={form.nama}
            onChange={onChange}
            required
            className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Nomor Telepon / WhatsApp <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="noTelepon"
            value={form.noTelepon}
            onChange={onChange}
            required
            className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 transition focus:border-[#561269] focus:outline-none"
          />
          <p className="text-[11px] text-gray-400 mt-1">
            Wajib diawali dengan 08 (10-14 digit angka).
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Spesialisasi Bidang
          </label>
          <input
            type="text"
            name="spesialisasi"
            value={form.spesialisasi || ""}
            onChange={onChange}
            className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none transition"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Riwayat Pendidikan
          </label>
          <textarea
            rows={3}
            name="pendidikanText"
            value={form.pendidikanText || ""}
            onChange={onChange}
            className="w-full rounded-2xl border border-gray-200 p-3.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none resize-y min-h-[80px] whitespace-pre-wrap leading-relaxed transition"
          />
          <p className="text-[11px] text-gray-400 mt-1">
            Tekan <strong>Enter</strong> untuk membuat baris baru jika memiliki lebih dari satu riwayat pendidikan.
          </p>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Perkenalan Profil
          </label>
          <textarea
            rows={5}
            name="bio"
            value={form.bio || ""}
            onChange={onChange}
            placeholder="Tuliskan perkenalan dan pendekatan konseling psikolog... Tekan Enter untuk membuat paragraf baru."
            className="w-full rounded-2xl border border-gray-200 p-4 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none resize-y min-h-[120px] whitespace-pre-wrap leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Quote Diri
          </label>
          <input
            type="text"
            name="quote"
            value={form.quote || ""}
            onChange={onChange}
            placeholder="Prinsip konseling..."
            className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm italic text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none transition"
          />
          {form.quote ? (
            <div className="mt-2 bg-[#FAF5FD] border-l-4 border-[#561269] p-3 rounded-r-xl">
              <p className="text-[11px] font-semibold text-[#561269] mb-0.5">
                Tampilan Quote di Profil Klien:
              </p>
              <p className="text-xs italic text-gray-800 leading-relaxed">
                &ldquo;{stripOuterQuotes(form.quote)}&rdquo;
              </p>
            </div>
          ) : (
            <p className="text-[11px] text-gray-400 mt-1">
              Quote singkat atau prinsip konseling yang akan tampil di halaman profil klien.
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Instagram
          </label>
          <input
            type="text"
            name="instagram"
            value={form.instagram || ""}
            onChange={onChange}
            placeholder="@username"
            className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-[#561269] focus:outline-none transition"
          />
        </div>
      </div>
    </div>
  )
}

