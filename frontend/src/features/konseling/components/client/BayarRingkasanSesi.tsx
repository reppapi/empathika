"use client"

import React from "react"

export interface BayarRingkasanSesiProps {
  psikologName?: string
  bottomDate: string
  bottomTime: string
  layanan: string
}

export default function BayarRingkasanSesi({
  psikologName,
  bottomDate,
  bottomTime,
  layanan,
}: BayarRingkasanSesiProps) {
  return (
    <div className="bg-white rounded-[1.5rem] border border-[#DCD0E1] p-5 sm:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-6 h-6 rounded-full bg-[#EAB308] text-black text-xs font-bold flex items-center justify-center shrink-0">2</div>
        <h3 className="text-sm font-bold text-gray-800">Data Psikolog &amp; Jadwal yang Dipilih</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-2xl p-4 flex flex-col justify-center items-center sm:items-start sm:flex-row gap-4 h-full">
          <div className="w-[70px] h-[70px] rounded-full bg-[#E6D9E9] flex items-center justify-center shrink-0 text-[#561269] font-bold text-xl">
            {(psikologName ? psikologName.replace(/^(dr\.|drg\.|prof\.)\s*/i, "").slice(0, 2) : "EM").toUpperCase()}
          </div>
          <div className="text-center sm:text-left flex flex-col justify-center h-full pt-1">
            <div className="text-[10px] text-gray-500 mb-1">Psikolog Anda</div>
            <div className="text-sm font-extrabold text-[#561269]">
              {psikologName ? (psikologName.includes(",") ? psikologName : `${psikologName}, M.Psi., Psikolog`) : "Psikolog Profesional Empathika"}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="border border-gray-200 rounded-2xl p-4 flex items-center gap-4">
            <div className="shrink-0 text-[#561269]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-[10px] text-gray-500 mb-0.5">Jadwal Sesi</div>
              <div className="text-xs font-bold text-[#561269]">{bottomDate}</div>
              <div className="text-[10px] text-gray-500">{bottomTime}</div>
            </div>
          </div>
          <div className="border border-gray-200 rounded-2xl p-4 flex items-center gap-4">
            <div className="shrink-0 text-[#561269]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-[10px] text-gray-500 mb-0.5">Layanan Konsultasi</div>
              <div className="text-sm font-bold text-[#561269]">{layanan}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

