"use client"

import Link from "next/link"
import { Building2, Laptop, CheckCircle2 } from "lucide-react"
import { type AsesmenPackage } from "../../data/asesmenData"

interface AsesmenMetodeSelectorProps {
  metode: "offline" | "online"
  setMetode: (m: "offline" | "online") => void
  selectedAsesmen: AsesmenPackage
  withBiro: (path: string) => string
}

export function AsesmenMetodeSelector({
  metode,
  setMetode,
  selectedAsesmen,
  withBiro,
}: AsesmenMetodeSelectorProps) {
  return (
    <div className="max-w-[950px] mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 relative z-20">
      <div className="bg-white rounded-3xl shadow-xl p-5 sm:p-7 border border-gray-100">
        {/* Header Bagian Metode */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 mb-5 gap-2">
          <div>
            <span className="text-[11px] font-extrabold text-[#561269] uppercase tracking-wider block">
              Pilih Format Pelaksanaan Sesi
            </span>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              Pilih Metode untuk {selectedAsesmen.title}
            </h3>
          </div>

          <Link
            href={withBiro("/layanan?category=05") as any}
            className="text-xs font-bold text-[#561269] hover:text-[#7B1FA2] transition self-start sm:self-auto hover:underline"
          >
            ← Ganti Layanan Lain
          </Link>
        </div>

        {/* Grid Dua Kartu: Offline vs Online */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Kartu Pilihan 1: Offline (Tatap Muka di Klinik) */}
          <div
            onClick={() => setMetode("offline")}
            className={`p-5 sm:p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
              metode === "offline"
                ? "border-[#561269] bg-gradient-to-br from-purple-50/70 via-white to-purple-50/30 shadow-md ring-2 ring-[#561269]/10"
                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                    metode === "offline"
                      ? "bg-[#561269] text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 group-hover:bg-purple-100 group-hover:text-[#561269]"
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                </div>

                {metode === "offline" ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#561269] bg-purple-100 px-3 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Dipilih
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-gray-400 group-hover:text-gray-600">
                    Klik untuk memilih
                  </span>
                )}
              </div>

              <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                Offline (Tatap Muka di Klinik)
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Pemeriksaan langsung dengan lembar tes fisik dan observasi tatap muka bersama asesor di klinik Empathika.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-400 font-medium">Biaya Mulai:</span>
              <span className="font-extrabold text-[#561269]">{selectedAsesmen.weekday}</span>
            </div>
          </div>

          {/* Kartu Pilihan 2: Online (Digital) */}
          <div
            onClick={() => setMetode("online")}
            className={`p-5 sm:p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
              metode === "online"
                ? "border-[#561269] bg-gradient-to-br from-purple-50/70 via-white to-purple-50/30 shadow-md ring-2 ring-[#561269]/10"
                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                    metode === "online"
                      ? "bg-[#561269] text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 group-hover:bg-purple-100 group-hover:text-[#561269]"
                  }`}
                >
                  <Laptop className="w-5 h-5" />
                </div>

                {metode === "online" ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#561269] bg-purple-100 px-3 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Dipilih
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-gray-400 group-hover:text-gray-600">
                    Klik untuk memilih
                  </span>
                )}
              </div>

              <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                Online (Pengerjaan Digital)
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Pengerjaan asesmen mandiri fleksibel dari mana saja via gadget/laptop dengan hasil psikogram digital.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-400 font-medium">Biaya Paket:</span>
              <span className="font-extrabold text-[#561269]">{selectedAsesmen.onlinePrice}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

