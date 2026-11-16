"use client"

import { BiroKomunitas } from "../../types"
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react"

interface BiroDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  biro: BiroKomunitas | null
  isLoading?: boolean
}

export default function BiroDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  biro,
  isLoading = false,
}: BiroDeleteModalProps) {
  if (!isOpen || !biro) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-all duration-300 animate-fadeIn font-poppins"
      onClick={() => !isLoading && onClose()}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-100 p-6 sm:p-7 space-y-6 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => !isLoading && onClose()}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer disabled:opacity-50"
          title="Tutup dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Ikon Warning Elegan */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 ring-8 ring-red-50/50">
            <AlertTriangle className="w-6 h-6" />
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
            disabled={isLoading}
            className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 transition-all cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
