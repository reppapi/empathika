"use client"

import React from "react"

export function formatToIndonesianPhone(val: string): string {
  if (!val) return ""
  let digits = val.replace(/\D/g, "")
  if (!digits) return ""

  // Jika diawali 62, buang
  if (digits.startsWith("62")) {
    digits = digits.slice(2)
  }
  // Jika diawali 0, buang
  if (digits.startsWith("0")) {
    digits = digits.slice(1)
  }

  if (!digits) return "+62 "

  if (digits.length <= 3) {
    return `+62 ${digits}`
  } else if (digits.length <= 7) {
    return `+62 ${digits.slice(0, 3)}-${digits.slice(3)}`
  } else if (digits.length <= 11) {
    return `+62 ${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  } else {
    return `+62 ${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 12)}`
  }
}

export interface FormDataPesertaProps {
  nama: string
  setNama: (val: string) => void
  whatsapp: string
  setWhatsapp: (val: string) => void
  deskripsi?: string
  setDeskripsi?: (val: string) => void
  withDeskripsi?: boolean
  errors?: {
    nama?: string
    whatsapp?: string
    deskripsi?: string
  }
  setErrors?: React.Dispatch<React.SetStateAction<any>>
  attemptedSubmit?: boolean
  stepNumber?: number
}

export default function FormDataPeserta({
  nama,
  setNama,
  whatsapp,
  setWhatsapp,
  deskripsi = "",
  setDeskripsi,
  withDeskripsi = false,
  errors = {},
  setErrors,
  attemptedSubmit = false,
  stepNumber = 1,
}: FormDataPesertaProps) {

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value

    // Jika user menghapus seluruh isi atau hanya tersisa awalan prefix
    if (!raw.trim() || raw.trim() === "+" || raw.trim() === "+6" || raw.trim() === "+62" || raw.trim() === "+62 ") {
      setWhatsapp("")
      if (attemptedSubmit && setErrors) {
        setErrors((prev: any) => ({ ...prev, whatsapp: "Nomor WhatsApp aktif wajib diisi." }))
      }
      return
    }

    const formatted = formatToIndonesianPhone(raw)
    setWhatsapp(formatted)

    if (setErrors) {
      const cleanDigits = formatted.replace(/\D/g, "")
      const local = cleanDigits.startsWith("62") ? cleanDigits.slice(2) : cleanDigits

      if (local.length > 0 && !local.startsWith("8")) {
        setErrors((prev: any) => ({
          ...prev,
          whatsapp: "Nomor tidak valid. Nomor WhatsApp harus diawali angka 8 (contoh: +62 812-xxxx-xxxx).",
        }))
      } else if (local.length > 13) {
        setErrors((prev: any) => ({
          ...prev,
          whatsapp: "Nomor WhatsApp terlalu panjang (maksimal 14 digit angka).",
        }))
      } else if (attemptedSubmit && local.length < 9) {
        setErrors((prev: any) => ({
          ...prev,
          whatsapp: "Nomor WhatsApp terlalu pendek (minimal 10 digit, contoh: +62 812-3456-7890).",
        }))
      } else {
        setErrors((prev: any) => ({ ...prev, whatsapp: undefined }))
      }
    }
  }

  const handleWhatsappBlur = () => {
    if (!whatsapp.trim()) {
      if (attemptedSubmit && setErrors) {
        setErrors((prev: any) => ({ ...prev, whatsapp: "Nomor WhatsApp aktif wajib diisi." }))
      }
      return
    }

    const cleanDigits = whatsapp.replace(/\D/g, "")
    const local = cleanDigits.startsWith("62") ? cleanDigits.slice(2) : cleanDigits

    if (setErrors) {
      if (!local.startsWith("8")) {
        setErrors((prev: any) => ({
          ...prev,
          whatsapp: "Nomor tidak valid. Nomor WhatsApp harus diawali angka 8 (contoh: +62 812-xxxx-xxxx).",
        }))
      } else if (local.length < 9) {
        setErrors((prev: any) => ({
          ...prev,
          whatsapp: "Nomor WhatsApp terlalu pendek (minimal 10 digit, contoh: +62 812-3456-7890).",
        }))
      } else if (local.length > 13) {
        setErrors((prev: any) => ({
          ...prev,
          whatsapp: "Nomor WhatsApp terlalu panjang (maksimal 14 digit angka).",
        }))
      } else {
        setErrors((prev: any) => ({ ...prev, whatsapp: undefined }))
      }
    }
  }

  return (
    <div id="box-data-peserta" className="bg-white rounded-[1.5rem] border border-[#DCD0E1] p-5 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] scroll-mt-28">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">
          {stepNumber}
        </div>
        <h3 className="text-sm font-bold text-gray-800">Data Peserta</h3>
      </div>

      {attemptedSubmit && (errors.nama || errors.whatsapp || (withDeskripsi && errors.deskripsi)) && (
        <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-3 text-red-700 animate-in fade-in duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-600 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="text-xs">
            <p className="font-bold">Data peserta belum lengkap</p>
            <p className="text-red-600/90 mt-0.5">Mohon lengkapi seluruh kolom bertanda bintang (<span className="text-red-500 font-bold">*</span>) di bawah ini.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-2">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Masukkan nama lengkap"
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all placeholder-gray-400 ${
                errors.nama
                  ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-400 focus:border-red-500"
                  : "border-gray-300 bg-white focus:ring-1 focus:ring-[#561269] focus:border-[#561269]"
              }`}
              value={nama}
              onChange={(e) => {
                const val = e.target.value
                setNama(val)
                if (attemptedSubmit && setErrors) {
                  setErrors((prev: any) => ({ ...prev, nama: val.trim() ? undefined : "Nama lengkap wajib diisi." }))
                }
              }}
            />
            {errors.nama && (
              <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1.5 animate-in fade-in duration-150">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.nama}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800 mb-2">
              No WhatsApp <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                placeholder="+62 812-3456-7890"
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all placeholder-gray-400 ${
                  errors.whatsapp
                    ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-400 focus:border-red-500"
                    : "border-gray-300 bg-white focus:ring-1 focus:ring-[#561269] focus:border-[#561269]"
                }`}
                value={whatsapp}
                onChange={handleWhatsappChange}
                onBlur={handleWhatsappBlur}
              />
            </div>
            {errors.whatsapp ? (
              <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1.5 animate-in fade-in duration-150">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.whatsapp}
              </p>
            ) : (
              <p className="text-[11px] text-gray-400 mt-1">
                Otomatis diawali +62 (Indonesia). Masukkan nomor WhatsApp aktif untuk tiket &amp; jadwal sesi.
              </p>
            )}
          </div>
        </div>

        {withDeskripsi && setDeskripsi && (
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-2">
              Deskripsi Ringkasan Hidup / Trauma <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Ceritakan secara singkat keluhan, kondisi emosional, atau hal yang ingin Anda konsultasikan..."
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all placeholder-gray-400 resize-none ${
                errors.deskripsi
                  ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-400 focus:border-red-500"
                  : "border-gray-300 bg-white focus:ring-1 focus:ring-[#561269] focus:border-[#561269]"
              }`}
              value={deskripsi}
              onChange={(e) => {
                const val = e.target.value
                setDeskripsi(val)
                if (attemptedSubmit && setErrors) {
                  setErrors((prev: any) => ({ ...prev, deskripsi: val.trim() ? undefined : "Deskripsi ringkasan hidup atau keluhan wajib diisi." }))
                }
              }}
            />
            {errors.deskripsi ? (
              <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1.5 animate-in fade-in duration-150">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.deskripsi}
              </p>
            ) : (
              <p className="text-[11px] text-gray-500 mt-1">
                Informasi ini akan membantu psikolog mempersiapkan sesi konseling Anda dengan lebih baik.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
