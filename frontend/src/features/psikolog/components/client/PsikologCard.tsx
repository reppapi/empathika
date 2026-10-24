"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Psikolog, PsikologUI } from "@/types/psikolog"

interface PsikologCardProps {
  psikolog: Psikolog | PsikologUI
  mode?: "psikolog" | "konseling"
  showJadwal?: boolean
}

export function PsikologCard({ psikolog, mode = "psikolog", showJadwal = true }: PsikologCardProps) {
  const [imgError, setImgError] = useState(false)
  const peran =
    psikolog.spesialisasi?.nama ||
    ("category" in psikolog && psikolog.category === "peer-konselor"
      ? "Peer Konselor"
      : "category" in psikolog && psikolog.category === "konselor"
      ? "Konselor"
      : "Psikolog")

  const jadwalList = ("jadwalTersedia" in psikolog && psikolog.jadwalTersedia) ? psikolog.jadwalTersedia : []
  const labelJadwal = ("labelJadwal" in psikolog && psikolog.labelJadwal) ? psikolog.labelJadwal : "Jadwal Terdekat"


  const keahlianList = ("keahlian" in psikolog && psikolog.keahlian) ? psikolog.keahlian : []
  const initial = psikolog.nama_gelar ? psikolog.nama_gelar.charAt(0) : "P"

  const buttonText = mode === "konseling" ? "Daftar" : "Lihat Detail"
  const buttonHref = mode === "konseling" 
    ? `/konseling/jadwal?psikologId=${psikolog.id}&psikologName=${encodeURIComponent(psikolog.nama_gelar || (psikolog as any).account?.nama || "")}` 
    : `/psikolog/${psikolog.id}`

  return (
    <div className="flex flex-col overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_rgba(86,18,105,0.12)] transition-all duration-300 group hover:-translate-y-1 h-full justify-between">
      
      {/* 1. Full-view Fixed Aspect Ratio Photo Container */}
      <div className="relative w-full aspect-[4/3] bg-[#FAF5FD] overflow-hidden shrink-0 flex items-center justify-center p-2">
        {psikolog.foto && !imgError ? (
          <Image
            src={psikolog.foto}
            alt={psikolog.nama_gelar || "Foto Psikolog"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-top rounded-2xl group-hover:scale-105 transition-transform duration-500"
            priority={false}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#8B3A9C] to-[#561269] text-white text-4xl font-bold">
            {initial}
          </div>
        )}

        {/* Floating Sesi Badge di Pojok Kanan Atas */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-gray-800 shadow-sm border border-purple-100 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>{psikolog.jumlah_sesi} Sesi</span>
        </div>
      </div>

      {/* 2. Middle Body: Nama, Gelar/Peran di Bawah Nama, dan Fokus Keahlian */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div>
          {/* Nama Psikolog */}
          <h3 className="text-base sm:text-[17px] font-bold text-gray-900 leading-snug group-hover:text-[#561269] transition-colors line-clamp-2">
            {psikolog.nama_gelar}
          </h3>

          {/* Gelar / Peran di Bawah Nama */}
          <p className="mt-1 text-xs sm:text-[13px] font-semibold text-[#561269]">
            {peran}
          </p>
        </div>

        {/* Fokus Keahlian */}
        {keahlianList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {keahlianList.slice(0, 3).map((item, idx) => (
              <span
                key={idx}
                className="inline-block text-[11px] font-medium text-gray-600 bg-gray-50 hover:bg-purple-50 px-2.5 py-0.5 rounded-md border border-gray-100"
              >
                {item}
              </span>
            ))}
            {keahlianList.length > 3 && (
              <span className="inline-block text-[11px] font-medium text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-md">
                +{keahlianList.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3. Bottom Section: Jadwal & Tombol Kuning */}
      <div className="px-5 pb-5 pt-3 border-t border-gray-100 bg-gray-50/40 mt-auto space-y-3.5">
        {/* Jadwal di bawah */}
        {showJadwal && (
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              {labelJadwal}
            </p>
            {jadwalList.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {jadwalList.slice(0, 3).map((jadwal, idx) => (
                  <span
                    key={idx}
                    className="bg-white border border-purple-100 px-2.5 py-1 rounded-full text-[11px] font-medium text-gray-700 shadow-2xs"
                  >
                    {jadwal.waktu}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[11px] text-gray-400 italic">Jadwal tersedia di profil</span>
            )}
          </div>
        )}

        {/* Tombol Kuning: Daftar / Lihat Detail */}
        <Link
          href={buttonHref as any}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all transform active:scale-98"
        >
          <span>{buttonText}</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>

    </div>
  )
}