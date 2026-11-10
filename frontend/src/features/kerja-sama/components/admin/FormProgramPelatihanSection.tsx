"use client"

import React from "react"
import { KerjaSamaItem } from "../../types"

interface FormProgramPelatihanSectionProps {
  formData: Partial<KerjaSamaItem>
  setFormData: React.Dispatch<React.SetStateAction<Partial<KerjaSamaItem>>>
  onImageUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (url: string) => void
  ) => Promise<void>
}

export function FormProgramPelatihanSection({
  formData,
  setFormData,
  onImageUpload,
}: FormProgramPelatihanSectionProps) {
  return (
    <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-5 space-y-4">
      <h4 className="font-bold text-[#561269] text-sm flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#561269]" />
        Bentuk Pelatihan / Workshop
      </h4>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Judul Pelatihan
        </label>
        <input
          type="text"
          value={formData.pelatihanTitle || ""}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, pelatihanTitle: e.target.value }))
          }
          placeholder="Contoh: Pelatihan Peer Counselor & Manajemen Stres Kampus"
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-white focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269]"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Deskripsi Pelatihan
        </label>
        <textarea
          rows={2}
          value={formData.pelatihanDeskripsi || ""}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, pelatihanDeskripsi: e.target.value }))
          }
          placeholder="Jelaskan gambaran pelatihan..."
          className="w-full rounded-xl border border-gray-200 p-3 text-sm bg-white focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269]"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Foto Pelatihan
        </label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {formData.pelatihanImage && (
            <div className="relative w-28 h-20 rounded-xl overflow-hidden border border-gray-200 shrink-0 bg-gray-100 shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={formData.pelatihanImage}
                alt="Preview Pelatihan"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 text-[#561269] hover:bg-purple-100 border border-purple-200 font-semibold text-xs cursor-pointer transition active:scale-95">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>Pilih Foto dari Perangkat...</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  onImageUpload(e, (dataUrl) =>
                    setFormData((prev) => ({ ...prev, pelatihanImage: dataUrl }))
                  )
                }
              />
            </label>
            <p className="text-xs text-gray-600 font-medium mt-1.5">
              Rekomendasi ukuran: <span className="font-bold text-[#561269]">800 × 600 piksel (4:3) atau 1200 × 675 piksel (16:9)</span>
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Format PNG, JPG, WebP • Otomatis dikompresi &amp; disesuaikan untuk halaman kemitraan
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FormProgramPelatihanSection

