"use client"

import { BiroKomunitas } from "../../types"

interface BiroDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  biro: BiroKomunitas | null
}

export default function BiroDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  biro,
}: BiroDeleteModalProps) {
  if (!isOpen || !biro) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md transition-all duration-300"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-[32px] bg-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-white/60 p-6 sm:p-7 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ikon Warning Elegan */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-100/80 text-red-600 flex items-center justify-center shrink-0 ring-4 ring-red-50">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">
              Hapus Biro / Komunitas?
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Tindakan ini permanen dan menghapus seluruh konfigurasi tenant.
            </p>
          </div>
        </div>

        {/* Info Biro yang Akan Dihapus */}
        <div className="rounded-2xl border border-red-100 bg-red-50/40 p-4 space-y-2">
          <p className="text-xs text-gray-600">
            Anda akan menghapus entitas biro mitra berikut:
          </p>
          <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-red-200/60 shadow-xs">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ backgroundColor: biro.warnaIdentitas || "#561269" }}
            >
              {biro.nama.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-gray-900 truncate">{biro.nama}</p>
              <p className="text-[11px] text-gray-500 font-mono truncate">{biro.emailAdmin}</p>
            </div>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 transition-all active:scale-95 cursor-pointer"
          >
            Batalkan
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            Ya, Hapus Sekarang
          </button>
        </div>
      </div>
    </div>
  )
}
