import React from "react"
import Link from "next/link"
import { CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react"

export interface FormulirSuccessViewProps {
  brandName: string
  formTitle: string
  namaInstitusi: string
  tipeInstitusi: string
  namaLengkap: string
  nomorWhatsapp: string
  emailPIC: string
  waAdminUrl: string
}

export default function FormulirSuccessView({
  brandName,
  formTitle,
  namaInstitusi,
  tipeInstitusi,
  namaLengkap,
  nomorWhatsapp,
  emailPIC,
  waAdminUrl,
}: FormulirSuccessViewProps) {
  return (
    <div className="min-h-screen bg-[#FAF7FB] pt-36 pb-20 sm:py-28 px-4 font-poppins flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-12 border border-purple-100 shadow-xl text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="inline-block px-4 py-1 rounded-full bg-purple-50 text-[#561269] text-xs font-bold uppercase tracking-wider mb-3">
          Pengajuan Diterima
        </span>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
          Pengajuan Kerja Sama Berhasil Terkirim!
        </h2>

        <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
          Terima kasih atas inisiatif kolaborasi bersama{" "}
          <span className="font-bold text-[#561269]">{brandName}</span> untuk program{" "}
          <span className="font-bold text-gray-900">{formTitle}</span>. Tim Kemitraan kami
          akan segera meninjau kebutuhan institusi Anda dan menghubungi melalui WhatsApp atau Email dalam 1–2 hari kerja.
        </p>

        <div className="bg-[#FAF7FB] border border-purple-100 rounded-2xl p-5 text-left mb-8 space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Program Dipilih:</span>
            <span className="font-bold text-gray-900">{formTitle}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Institusi / Organisasi:</span>
            <span className="font-bold text-gray-900">{namaInstitusi} ({tipeInstitusi})</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Nama PIC:</span>
            <span className="font-bold text-gray-900">{namaLengkap}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>WhatsApp:</span>
            <span className="font-bold text-gray-900">{nomorWhatsapp}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Email:</span>
            <span className="font-bold text-gray-900">{emailPIC}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center items-center">
          <a
            href={waAdminUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all whitespace-nowrap shrink-0"
          >
            <span>Konfirmasi via WhatsApp</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>

          <Link
            href="/kerja-sama"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs sm:text-sm transition-all whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Kerja Sama</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
