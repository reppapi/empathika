import React from "react"
import { FormulirConfigItem } from "../../../types"

export interface FormulirTypeSelectorProps {
  formConfigs: FormulirConfigItem[]
  selectedFormIndex: number
  onSelectIndex: (idx: number) => void
}

export default function FormulirTypeSelector({
  formConfigs,
  selectedFormIndex,
  onSelectIndex,
}: FormulirTypeSelectorProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
      <h3 className="text-sm font-bold text-gray-900 mb-1">
        Pilih Jenis Formulir yang Ingin Diatur:
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Pilih salah satu formulir di bawah untuk mengubah judul, deskripsi, serta menambah atau
        menghapus butir pertanyaan. Perubahan otomatis tersinkronisasi ke website client.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {formConfigs.map((fc, idx) => (
          <button
            key={fc.id}
            type="button"
            onClick={() => onSelectIndex(idx)}
            className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
              selectedFormIndex === idx
                ? "border-[#561269] bg-purple-50/70 ring-2 ring-[#561269]/20"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <span className="text-xs font-bold text-gray-900 line-clamp-1">{fc.title}</span>
            <span className="text-[10px] text-gray-500 mt-1">
              {fc.pertanyaanKhusus.length} Pertanyaan Khusus
            </span>
          </button>
        ))}
      </div>

      {/* Banner Info Khusus Affiliate */}
      <div className="mt-4 p-3.5 rounded-xl bg-purple-50/70 border border-purple-100 flex items-start sm:items-center gap-3">
        <span className="text-base sm:text-lg shrink-0">💬</span>
        <div className="text-xs text-gray-700">
          <span className="font-bold text-[#561269]">Program Affiliate: </span>
          Calon mitra Affiliate tidak perlu mengisi formulir di web dan langsung diarahkan untuk menghubungi WhatsApp Official Empathika. Nomor kontak dapat disesuaikan di tab <strong>Pengaturan Teks & Kontak Web</strong>.
        </div>
      </div>
    </div>
  )
}
