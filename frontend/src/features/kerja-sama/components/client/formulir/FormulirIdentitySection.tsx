"use client"

import React from "react"
import { User, Building2, Mail, AlertCircle } from "lucide-react"
import PhoneInputField from "@/components/shared/PhoneInputField"

export const TIPE_INSTITUSI_OPTIONS = [
  "Sekolah / Universitas",
  "Perusahaan / Korporasi",
  "Komunitas / Organisasi",
  "Rumah Sakit / Faskes",
  "Instansi Pemerintah",
  "Lainnya",
]

export interface FormulirIdentitySectionProps {
  namaLengkap: string
  setNamaLengkap: (val: string) => void
  namaInstitusi: string
  setNamaInstitusi: (val: string) => void
  emailPIC: string
  setEmailPIC: (val: string) => void
  nomorWhatsapp: string
  setNomorWhatsapp: (val: string) => void
  tipeInstitusi: string
  setTipeInstitusi: (val: string) => void
  hasAttemptedSubmit: boolean
  formErrors: Record<string, string>
  setFormErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
}

export default function FormulirIdentitySection({
  namaLengkap,
  setNamaLengkap,
  namaInstitusi,
  setNamaInstitusi,
  emailPIC,
  setEmailPIC,
  nomorWhatsapp,
  setNomorWhatsapp,
  tipeInstitusi,
  setTipeInstitusi,
  hasAttemptedSubmit,
  formErrors,
  setFormErrors,
}: FormulirIdentitySectionProps) {
  return (
    <div>
      <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center font-bold">
          1
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Informasi Pemohon & Institusi</h2>
          <p className="text-xs text-gray-500">
            Lengkapi identitas penanggung jawab (PIC) dan profil instansi / organisasi Anda.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Nama Lengkap PIC */}
        <div id="field-namaLengkap">
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            NAMA LENGKAP / PIC <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={namaLengkap}
              onChange={(e) => {
                setNamaLengkap(e.target.value)
                if (formErrors.namaLengkap && e.target.value.trim()) {
                  setFormErrors((prev) => {
                    const next = { ...prev }
                    delete next.namaLengkap
                    return next
                  })
                }
              }}
              placeholder="Contoh: Muhammad Kevin Pradana"
              className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] ${
                hasAttemptedSubmit && formErrors.namaLengkap
                  ? "border-rose-400 bg-rose-50/20 ring-1 ring-rose-200"
                  : "border-gray-300"
              }`}
            />
          </div>
          {hasAttemptedSubmit && formErrors.namaLengkap && (
            <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
              <span>{formErrors.namaLengkap}</span>
            </p>
          )}
        </div>

        {/* Nama Institusi */}
        <div id="field-namaInstitusi">
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            NAMA INSTITUSI / ORGANISASI <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={namaInstitusi}
              onChange={(e) => {
                setNamaInstitusi(e.target.value)
                if (formErrors.namaInstitusi && e.target.value.trim()) {
                  setFormErrors((prev) => {
                    const next = { ...prev }
                    delete next.namaInstitusi
                    return next
                  })
                }
              }}
              placeholder="Contoh: PT Bangun Bangsa Sejahtera / Universitas X"
              className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] ${
                hasAttemptedSubmit && formErrors.namaInstitusi
                  ? "border-rose-400 bg-rose-50/20 ring-1 ring-rose-200"
                  : "border-gray-300"
              }`}
            />
          </div>
          {hasAttemptedSubmit && formErrors.namaInstitusi && (
            <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
              <span>{formErrors.namaInstitusi}</span>
            </p>
          )}
        </div>

        {/* Alamat Email */}
        <div id="field-emailPIC">
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            EMAIL AKTIF PIC <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={emailPIC}
              onChange={(e) => {
                setEmailPIC(e.target.value)
                if (formErrors.emailPIC && e.target.value.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value.trim())) {
                  setFormErrors((prev) => {
                    const next = { ...prev }
                    delete next.emailPIC
                    return next
                  })
                }
              }}
              placeholder="nama@institusi.com"
              className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] ${
                hasAttemptedSubmit && formErrors.emailPIC
                  ? "border-rose-400 bg-rose-50/20 ring-1 ring-rose-200"
                  : "border-gray-300"
              }`}
            />
          </div>
          {hasAttemptedSubmit && formErrors.emailPIC && (
            <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
              <span>{formErrors.emailPIC}</span>
            </p>
          )}
        </div>

        {/* No. WhatsApp PIC */}
        <div id="field-nomorWhatsapp">
          <PhoneInputField
            value={nomorWhatsapp}
            label="No WhatsApp"
            labelClassName="font-bold"
            required
            inputClassName={`px-4 py-3 text-sm rounded-xl focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] ${
              hasAttemptedSubmit && formErrors.nomorWhatsapp
                ? "border-rose-400 bg-rose-50/20 ring-1 ring-rose-200"
                : "border-gray-300"
            }`}
            onChange={(val) => {
              setNomorWhatsapp(val)
              if (formErrors.nomorWhatsapp && val.replace(/\D/g, "").length >= 9) {
                setFormErrors((prev) => {
                  const next = { ...prev }
                  delete next.nomorWhatsapp
                  return next
                })
              }
            }}
            placeholder="81234567890"
          />
          {hasAttemptedSubmit && formErrors.nomorWhatsapp && (
            <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
              <span>{formErrors.nomorWhatsapp}</span>
            </p>
          )}
        </div>

        {/* Tipe Institusi Selector */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-gray-700 mb-2">
            TIPE INSTITUSI / ORGANISASI <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {TIPE_INSTITUSI_OPTIONS.map((opt) => {
              const isSelected = tipeInstitusi === opt
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setTipeInstitusi(opt)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all text-left ${
                    isSelected
                      ? "border-[#561269] bg-purple-50 text-[#561269] shadow-xs ring-1 ring-[#561269]"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? "border-[#561269] bg-[#561269]" : "border-gray-300"
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="truncate">{opt}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
