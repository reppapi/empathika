"use client"

import { Video, Building2, Layers } from "lucide-react"

interface JadwalMetodeSelectorProps {
  metode: "Online" | "Offline" | "Keduanya"
  setMetode: (m: "Online" | "Offline" | "Keduanya") => void
  allowedMetode?: {
    online: boolean
    offline: boolean
    both: boolean
  }
}

export default function JadwalMetodeSelector({
  metode,
  setMetode,
  allowedMetode = { online: true, offline: true, both: true },
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
          disabled={!allowedMetode.online}
          onClick={() => allowedMetode.online && setMetode("Online")}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-bold transition-all ${
            !allowedMetode.online
              ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60 pointer-events-none"
              : metode === "Online"
              ? "border-[#561269] bg-white text-[#561269] shadow-xs ring-1 ring-[#561269] cursor-pointer"
              : "border-gray-200 bg-white/70 text-gray-600 hover:bg-white cursor-pointer"
          }`}
          title={!allowedMetode.online ? "Metode Online tidak tersedia untuk layanan ini" : "Pilih metode Online"}
        >
          <Video className={`w-3.5 h-3.5 ${!allowedMetode.online ? "text-gray-400" : "text-[#561269]"}`} />
          <span>Online</span>
        </button>
        <button
          type="button"
          disabled={!allowedMetode.offline}
          onClick={() => allowedMetode.offline && setMetode("Offline")}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-bold transition-all ${
            !allowedMetode.offline
              ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60 pointer-events-none"
              : metode === "Offline"
              ? "border-[#561269] bg-white text-[#561269] shadow-xs ring-1 ring-[#561269] cursor-pointer"
              : "border-gray-200 bg-white/70 text-gray-600 hover:bg-white cursor-pointer"
          }`}
          title={!allowedMetode.offline ? "Metode Offline tidak tersedia untuk layanan ini" : "Pilih metode Offline"}
        >
          <Building2 className={`w-3.5 h-3.5 ${!allowedMetode.offline ? "text-gray-400" : "text-[#561269]"}`} />
          <span>Offline</span>
        </button>
        <button
          type="button"
          disabled={!allowedMetode.both}
          onClick={() => allowedMetode.both && setMetode("Keduanya")}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-bold transition-all ${
            !allowedMetode.both
              ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60 pointer-events-none"
              : metode === "Keduanya"
              ? "border-[#561269] bg-white text-[#561269] shadow-xs ring-1 ring-[#561269] cursor-pointer"
              : "border-gray-200 bg-white/70 text-gray-600 hover:bg-white cursor-pointer"
          }`}
          title={!allowedMetode.both ? "Layanan ini tidak mendukung metode fleksibel Keduanya" : "Pilih metode Keduanya (Fleksibel)"}
        >
          <Layers className={`w-3.5 h-3.5 ${!allowedMetode.both ? "text-gray-400" : "text-[#561269]"}`} />
          <span>Keduanya</span>
        </button>
      </div>
    </div>
  )
}

