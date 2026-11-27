"use client"

import React from "react"
import Link from "next/link"
import { CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react"

interface ApplySuccessViewProps {
  formData: {
    nama: string
    email: string
    telepon: string
    universitas: string
  }
  positionTitle: string
  waNumber: string
  internshipListHref: string
}

export function ApplySuccessView({
  formData,
  positionTitle,
  waNumber,
  internshipListHref,
}: ApplySuccessViewProps) {
  return (
    <div className="min-h-screen bg-[#FAF7FB] py-16 sm:py-24 px-4 font-poppins flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-12 border border-purple-100 shadow-xl text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="inline-block px-4 py-1 rounded-full bg-purple-50 text-[#561269] text-xs font-bold uppercase tracking-wider mb-3">
          Pendaftaran Diterima
        </span>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
          Lamaran Anda Berhasil Terkirim!
        </h2>

        <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
          Terima kasih telah melamar untuk posisi{" "}
          <span className="font-bold text-[#561269]">{positionTitle}</span> di Empathika. Tim
          People & Culture kami akan meninjau profil dan jawaban Anda. Kami akan menghubungi Anda
          melalui WhatsApp atau Email terkait proses seleksi berikutnya.
        </p>

        <div className="bg-[#FAF7FB] border border-purple-100 rounded-2xl p-5 text-left mb-8 space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Nama Pelamar:</span>
            <span className="font-bold text-gray-900">{formData.nama}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Posisi Dilamar:</span>
            <span className="font-bold text-gray-900">{positionTitle}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Email:</span>
            <span className="font-bold text-gray-900">{formData.email}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>WhatsApp:</span>
            <span className="font-bold text-gray-900">{formData.telepon}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center items-center">
          <a
            href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
              `Halo Tim People & Culture Empathika, saya ${formData.nama} (${formData.universitas}). Saya baru saja mengirimkan formulir lamaran magang untuk posisi ${positionTitle} dan ingin melakukan konfirmasi.`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all whitespace-nowrap shrink-0"
          >
            <span>Konfirmasi via WhatsApp</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>

          <Link
            href={internshipListHref as any}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] text-[#0f172a] font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Halaman Magang</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
