"use client"

import React from "react"
import { KerjaSamaItem } from "../../types"

interface FormProgramMitraSectionProps {
  formData: Partial<KerjaSamaItem>
  setFormData: React.Dispatch<React.SetStateAction<Partial<KerjaSamaItem>>>
  onImageUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (url: string) => void
  ) => Promise<void>
}

export function FormProgramMitraSection({
  formData,
  setFormData,
  onImageUpload,
}: FormProgramMitraSectionProps) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 space-y-4">
      <h4 className="font-bold text-blue-900 text-sm flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-600" />
        Kemitraan Kami Sebelumnya
      </h4>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Nama Mitra / Judul Sinergi
        </label>
        <input
          type="text"
          value={formData.mitraTitle || ""}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, mitraTitle: e.target.value }))
          }
          placeholder="Contoh: Empathika x BEM Universitas Padjadjaran"
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-white focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269]"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Deskripsi Dampak Kemitraan
        </label>
        <textarea
          rows={2}
          value={formData.mitraDeskripsi || ""}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, mitraDeskripsi: e.target.value }))
          }
          placeholder="Jelaskan dampak dan hasil kemitraan..."
          className="w-full rounded-xl border border-gray-200 p-3 text-sm bg-white focus:border-[#561269] focus:outline-none focus:ring-1 focus:ring-[#561269]"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Foto Dokumentasi Mitra
        </label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {formData.mitraImage && (
            <div className="relative w-28 h-20 rounded-xl overflow-hidden border border-gray-200 shrink-0 bg-gray-100 shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={formData.mitraImage}
                alt="Preview Mitra"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-semibold text-xs cursor-pointer transition active:scale-95">
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
                    setFormData((prev) => ({ ...prev, mitraImage: dataUrl }))
                  )
                }
              />
            </label>
            <p className="text-[11px] text-gray-400 mt-1">
              Format PNG, JPG, WebP (otomatis dikompresi & dioptimalkan untuk web).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FormProgramMitraSection

