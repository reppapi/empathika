"use client"

import React from "react"

interface FormPositionRequirementsSectionProps {
  responsibilitiesText: string
  qualificationsText: string
  onChangeResponsibilities: (val: string) => void
  onChangeQualifications: (val: string) => void
}

export function FormPositionRequirementsSection({
  responsibilitiesText,
  qualificationsText,
  onChangeResponsibilities,
  onChangeQualifications,
}: FormPositionRequirementsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
      {/* Responsibilities */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#561269]" />
          <span>Tanggung Jawab (Responsibilities)</span>
        </label>
        <p className="text-[11px] text-gray-400 mb-2">
          Tuliskan setiap butir tanggung jawab per baris (tekan Enter untuk butir baru).
        </p>
        <textarea
          rows={7}
          placeholder="Mengelola konten harian media sosial&#10;Melakukan riset tren kesehatan mental&#10;Membuat laporan analitik performa..."
          value={responsibilitiesText}
          onChange={(e) => onChangeResponsibilities(e.target.value)}
          className="w-full px-4 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#561269] transition-colors leading-relaxed"
        />
      </div>

      {/* Qualifications */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#EAB308]" />
          <span>Kualifikasi (Qualifications)</span>
        </label>
        <p className="text-[11px] text-gray-400 mb-2">
          Tuliskan setiap butir kualifikasi per baris (tekan Enter untuk butir baru).
        </p>
        <textarea
          rows={7}
          placeholder="Mahasiswa aktif atau fresh graduate Psikologi/DKV/Komunikasi&#10;Mampu berkomunikasi dengan baik&#10;Memiliki portofolio desain grafis/tulisan..."
          value={qualificationsText}
          onChange={(e) => onChangeQualifications(e.target.value)}
          className="w-full px-4 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#561269] transition-colors leading-relaxed"
        />
      </div>
    </div>
  )
}
