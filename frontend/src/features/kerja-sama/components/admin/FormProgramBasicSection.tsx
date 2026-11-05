"use client"

import React from "react"
import { KerjaSamaItem } from "../../types"
import { COLOR_THEMES, normalizeColorTheme, getColorTheme } from "../../utils/colorThemes"

interface FormProgramBasicSectionProps {
  formData: Partial<KerjaSamaItem>
  setFormData: React.Dispatch<React.SetStateAction<Partial<KerjaSamaItem>>>
  errors: Record<string, string>
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
  isEditMode: boolean
}

export function FormProgramBasicSection({
  formData,
  setFormData,
  errors,
  setErrors,
  isEditMode,
}: FormProgramBasicSectionProps) {
  return (
    <>
      {/* Baris 1: Judul Program & Slug URL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Judul Program <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.title || ""}
            onChange={(e) => {
              const t = e.target.value
              const slugGen = t
                .toLowerCase()
                .replace("empathika untuk ", "")
                .trim()
                .replace(/\s+/g, "-")
                .replace(/[^\w-]/g, "")
              setFormData((prev) => ({
                ...prev,
                title: t,
                slug: isEditMode ? prev.slug : slugGen,
                shortName: t.replace("Empathika untuk ", ""),
              }))
              if (errors.title) setErrors((prev) => ({ ...prev, title: "" }))
            }}
            placeholder="Contoh: Empathika untuk Mahasiswa"
            className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition shadow-xs ${
              errors.title
                ? "border-red-400 bg-red-50/30 focus:border-red-500"
                : "border-gray-200 bg-white focus:border-[#561269] focus:ring-1 focus:ring-[#561269]"
            }`}
          />
          {errors.title && <p className="text-xs text-red-500 mt-1 font-medium">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Slug URL (Path Client) <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center rounded-xl border border-gray-200 px-3.5 py-3 bg-gray-50 focus-within:border-[#561269] focus-within:ring-1 focus-within:ring-[#561269] transition shadow-xs">
            <span className="text-gray-400 text-sm font-mono shrink-0">/kerja-sama/</span>
            <input
              type="text"
              required
              value={formData.slug || ""}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, slug: e.target.value }))
                if (errors.slug) setErrors((prev) => ({ ...prev, slug: "" }))
              }}
              placeholder="mahasiswa"
              className="w-full bg-transparent text-sm font-mono text-gray-900 focus:outline-none pl-1"
            />
          </div>
          {errors.slug && <p className="text-xs text-red-500 mt-1 font-medium">{errors.slug}</p>}
        </div>
      </div>

      {/* Baris 2: Warna Gradasi Kartu */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
            Tema Warna Gradasi Kartu <span className="text-red-500">*</span>
          </label>
          <span className="text-[11px] text-gray-500 font-medium">
            Pilih palet warna yang mewakili program ini
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {COLOR_THEMES.map((c) => {
            const isSelected = normalizeColorTheme(formData.color) === c.value
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, color: c.value }))}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all active:scale-95 cursor-pointer ${
                  isSelected
                    ? "border-[#561269] bg-purple-50/70 shadow-sm ring-2 ring-[#561269]/20"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/60"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-5 h-5 rounded-full ${c.dotClass} shadow-xs shrink-0 ring-2 ring-white`} />
                  <span
                    className={`text-xs font-semibold truncate ${
                      isSelected ? "text-[#561269] font-bold" : "text-gray-700"
                    }`}
                  >
                    {c.label}
                  </span>
                </div>

                {isSelected && (
                  <span className="text-[#561269] shrink-0">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Preview Banner Aksen */}
        <div className="mt-3 p-3.5 rounded-2xl border border-gray-200/80 bg-gray-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-gray-500 font-medium">Preview Kartu Client:</span>
            <div className="flex items-center gap-2">
              <span className={`w-16 h-2.5 rounded-full ${getColorTheme(formData.color).dotClass} shadow-xs`} />
              <span className="text-xs font-bold text-gray-800">
                {getColorTheme(formData.color).label}
              </span>
            </div>
          </div>
          <span className="text-[11px] text-gray-400">
            Warna ini akan menjadi aksen garis atas dan efek hover di halaman utama.
          </span>
        </div>
      </div>

      {/* Baris 3: Deskripsi Singkat Program */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
          Deskripsi Singkat Program <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={3}
          required
          value={formData.description || ""}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, description: e.target.value }))
            if (errors.description) setErrors((prev) => ({ ...prev, description: "" }))
          }}
          placeholder="Ringkasan tentang program kolaborasi ini..."
          className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition shadow-xs leading-relaxed ${
            errors.description
              ? "border-red-400 bg-red-50/30 focus:border-red-500"
              : "border-gray-200 bg-white focus:border-[#561269] focus:ring-1 focus:ring-[#561269]"
          }`}
        />
        {errors.description && (
          <p className="text-xs text-red-500 mt-1 font-medium">{errors.description}</p>
        )}
      </div>
    </>
  )
}

export default FormProgramBasicSection

