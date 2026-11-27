"use client"

import React, { useRef } from "react"
import { Clock, MapPin, Laptop, Coins, Calendar, Eye, EyeOff } from "lucide-react"
import { toDateInputValue, formatIsoToDisplayDate } from "@/features/internship/utils/internshipDateUtils"

interface FormPositionBasicSectionProps {
  formData: {
    judul: string
    durasi: string
    lokasi: string
    workMode: string
    kompensasi: string
    deadline: string
    deskripsi: string
    isOpen: boolean
  }
  setFormData: React.Dispatch<
    React.SetStateAction<{
      judul: string
      durasi: string
      lokasi: string
      workMode: string
      kompensasi: string
      deadline: string
      deskripsi: string
      responsibilitiesText: string
      qualificationsText: string
      isOpen: boolean
    }>
  >
  errors: Record<string, string>
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
}

export function FormPositionBasicSection({
  formData,
  setFormData,
  errors,
  setErrors,
}: FormPositionBasicSectionProps) {
  const dateInputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      {/* Judul Posisi */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
          Judul Posisi <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="Contoh: Social Media & Content Intern"
          value={formData.judul}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, judul: e.target.value }))
            if (errors.judul) setErrors((prev) => ({ ...prev, judul: "" }))
          }}
          className={`w-full px-4 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-none transition-colors ${
            errors.judul
              ? "border-rose-400 bg-rose-50/20 focus:border-rose-500"
              : "border-gray-200 focus:border-[#561269]"
          }`}
        />
        {errors.judul && <p className="text-xs text-rose-500 mt-1">{errors.judul}</p>}
      </div>

      {/* 4 Spesifikasi (Durasi, Lokasi, Work Mode, Kompensasi) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#561269]" />
            <span>Durasi</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: 6 Month"
            value={formData.durasi}
            onChange={(e) => setFormData((prev) => ({ ...prev, durasi: e.target.value }))}
            className="w-full px-4 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#561269] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#561269]" />
            <span>Lokasi</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: WFA"
            value={formData.lokasi}
            onChange={(e) => setFormData((prev) => ({ ...prev, lokasi: e.target.value }))}
            className="w-full px-4 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#561269] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Laptop className="w-3.5 h-3.5 text-[#561269]" />
            <span>Work Mode</span>
          </label>
          <select
            value={formData.workMode}
            onChange={(e) => setFormData((prev) => ({ ...prev, workMode: e.target.value }))}
            className="w-full px-4 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#561269] transition-colors bg-white cursor-pointer"
          >
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-[#561269]" />
            <span>Kompensasi</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Unpaid / Paid"
            value={formData.kompensasi}
            onChange={(e) => setFormData((prev) => ({ ...prev, kompensasi: e.target.value }))}
            className="w-full px-4 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#561269] transition-colors"
          />
        </div>
      </div>

      {/* Deadline & Status Publikasi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Deadline */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-rose-500" />
            <span>
              Deadline Pendaftaran <span className="text-rose-500">*</span>
            </span>
          </label>
          <div className="relative">
            <input
              type="date"
              ref={dateInputRef}
              value={toDateInputValue(formData.deadline)}
              onChange={(e) => {
                const formatted = formatIsoToDisplayDate(e.target.value)
                setFormData((prev) => ({ ...prev, deadline: formatted }))
                if (errors.deadline) setErrors((prev) => ({ ...prev, deadline: "" }))
              }}
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
            />
            <div
              onClick={() => {
                try {
                  dateInputRef.current?.showPicker?.()
                  dateInputRef.current?.focus()
                } catch {
                  dateInputRef.current?.focus()
                }
              }}
              className={`w-full px-4 py-2.5 text-xs sm:text-sm border rounded-xl flex items-center justify-between cursor-pointer transition-colors bg-white ${
                errors.deadline
                  ? "border-rose-400 bg-rose-50/20"
                  : "border-gray-200 hover:border-[#561269]"
              }`}
            >
              <span className={formData.deadline ? "text-gray-900 font-medium" : "text-gray-400"}>
                {formData.deadline || "Pilih batas akhir pendaftaran..."}
              </span>
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
            </div>
          </div>
          {errors.deadline && <p className="text-xs text-rose-500 mt-1">{errors.deadline}</p>}
        </div>

        {/* Status Publikasi Lowongan */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            {formData.isOpen ? (
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-gray-400" />
            )}
            <span>Status Lowongan</span>
          </label>
          <div className="flex items-center gap-3 h-[42px]">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, isOpen: true }))}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                formData.isOpen
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Buka (Tampil di Klien)</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, isOpen: false }))}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                !formData.isOpen
                  ? "border-gray-300 bg-gray-100 text-gray-800"
                  : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-gray-400" />
              <span>Tutup (Sembunyikan)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Deskripsi Singkat */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
          Deskripsi Singkat Posisi (Opsional)
        </label>
        <textarea
          rows={3}
          placeholder="Jelaskan secara ringkas tentang fokus dan tujuan dari peran magang ini..."
          value={formData.deskripsi}
          onChange={(e) => setFormData((prev) => ({ ...prev, deskripsi: e.target.value }))}
          className="w-full px-4 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#561269] transition-colors resize-none"
        />
      </div>
    </>
  )
}
