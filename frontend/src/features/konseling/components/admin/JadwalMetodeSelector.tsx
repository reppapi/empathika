"use client"

import { Video, Building2, Layers } from "lucide-react"

interface JadwalMetodeSelectorProps {
  metode: "Online" | "Offline" | "Keduanya"
  setMetode: (m: "Online" | "Offline" | "Keduanya") => void
}

export default function JadwalMetodeSelector({
  metode,
  setMetode,
}: JadwalMetodeSelectorProps) {
  return (
    <div className="mb-4 bg-purple-50/50 p-3 rounded-2xl border border-[#EDE0F2]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-gray-800">
          Pilih Metode Asesmen:
        </span>
        <span className="text-[11px] font-semibold text-[#561269]">
          {metode === "Online"
            ? "Sesi Online via Zoom"
            : metode === "Offline"
              ? "Sesi Tatap Muka di Klinik"
              : "Fleksibel (Online & Offline)"}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setMetode("Online")}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            metode === "Online"
              ? "border-[#561269] bg-white text-[#561269] shadow-xs ring-1 ring-[#561269]"
              : "border-gray-200 bg-white/70 text-gray-600 hover:bg-white"
          }`}
        >
          <Video className="w-3.5 h-3.5 text-[#561269]" />
          <span>Online</span>
        </button>
        <button
          type="button"
          onClick={() => setMetode("Offline")}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            metode === "Offline"
              ? "border-[#561269] bg-white text-[#561269] shadow-xs ring-1 ring-[#561269]"
              : "border-gray-200 bg-white/70 text-gray-600 hover:bg-white"
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-[#561269]" />
          <span>Offline</span>
        </button>
        <button
          type="button"
          onClick={() => setMetode("Keduanya")}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            metode === "Keduanya"
              ? "border-[#561269] bg-white text-[#561269] shadow-xs ring-1 ring-[#561269]"
              : "border-gray-200 bg-white/70 text-gray-600 hover:bg-white"
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-[#561269]" />
          <span>Keduanya</span>
        </button>
      </div>
    </div>
  )
}

