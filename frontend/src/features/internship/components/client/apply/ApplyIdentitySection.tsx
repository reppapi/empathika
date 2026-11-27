"use client"

import React from "react"
import { User, Mail, GraduationCap } from "lucide-react"
import PhoneInputField from "@/components/shared/PhoneInputField"

interface ApplyIdentitySectionProps {
  formData: {
    nama: string
    email: string
    telepon: string
    universitas: string
    jurusan: string
    semester: string
  }
  setFormData: React.Dispatch<
    React.SetStateAction<{
      nama: string
      email: string
      telepon: string
      universitas: string
      jurusan: string
      semester: string
      cvUrl: string
      portfolioUrl: string
    }>
  >
}

export function ApplyIdentitySection({ formData, setFormData }: ApplyIdentitySectionProps) {
  return (
    <div>
      <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold">
          1
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Data Diri Pelamar</h2>
          <p className="text-xs text-gray-500">
            Pastikan informasi kontak Anda aktif dan dapat dihubungi.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Nama Lengkap */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            NAMA LENGKAP <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={formData.nama}
              onChange={(e) => setFormData((prev) => ({ ...prev, nama: e.target.value }))}
              placeholder="Contoh: Muhammad Kevin Pradana"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269]"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            EMAIL AKTIF <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="nama@email.com"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269]"
            />
          </div>
        </div>

        {/* Nomor Telepon / WA */}
        <div>
          <PhoneInputField
            label="No WhatsApp"
            required
            value={formData.telepon}
            onChange={(val) => setFormData((prev) => ({ ...prev, telepon: val }))}
            placeholder="81234567890"
            inputClassName="px-4 py-3 rounded-xl border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269]"
          />
        </div>

        {/* Asal Universitas / Institusi */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            ASAL UNIVERSITAS / INSTITUSI PENDIDIKAN <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <GraduationCap className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={formData.universitas}
              onChange={(e) => setFormData((prev) => ({ ...prev, universitas: e.target.value }))}
              placeholder="Contoh: Universitas Indonesia"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269]"
            />
          </div>
        </div>

        {/* Jurusan */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            PROGRAM STUDI / JURUSAN
          </label>
          <input
            type="text"
            value={formData.jurusan}
            onChange={(e) => setFormData((prev) => ({ ...prev, jurusan: e.target.value }))}
            placeholder="Contoh: Psikologi / Desain Komunikasi Visual"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269]"
          />
        </div>

        {/* Semester / Status */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            SEMESTER SAAT INI / STATUS
          </label>
          <input
            type="text"
            value={formData.semester}
            onChange={(e) => setFormData((prev) => ({ ...prev, semester: e.target.value }))}
            placeholder="Contoh: Semester 6 / Fresh Graduate"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269]"
          />
        </div>
      </div>
    </div>
  )
}
