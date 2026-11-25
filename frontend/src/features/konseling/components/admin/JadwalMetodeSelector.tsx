"use client"

import { Building2 } from "lucide-react"

interface JadwalMetodeSelectorProps {
  metode?: "Online" | "Offline" | "Keduanya"
  setMetode?: (m: "Online" | "Offline" | "Keduanya") => void
  allowedMetode?: {
    online: boolean
    offline: boolean
    both: boolean
  }
}

export default function JadwalMetodeSelector({
  metode = "Offline",
  setMetode,
}: JadwalMetodeSelectorProps) {
  return (
    <div className="mb-3 bg-purple-50/50 p-3 rounded-2xl border border-[#EDE0F2]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-[#561269]" />
          Pilih Metode Asesmen:
        </span>
        <span className="text-[11px] font-semibold text-[#561269]">
          Sesi Tatap Muka di Klinik
        </span>
      </div>
      <div>
        <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-[#561269] bg-white text-[#561269] shadow-xs ring-1 ring-[#561269] text-xs font-bold">
          <Building2 className="w-3.5 h-3.5 text-[#561269]" />
          <span>Offline (Tatap Muka di Klinik)</span>
        </div>
      </div>
    </div>
  )
}

