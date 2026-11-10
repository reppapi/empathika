"use client"

import React from "react"
import { X, AlertTriangle, Loader2, Trash2 } from "lucide-react"

export interface AdminDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title?: string
  itemName?: string
  itemType?: string // e.g. "layanan", "event", "dokumentasi", "artikel blog", "tenaga ahli", "paket psikotes", "program kerja sama", "pengajuan"
  description?: React.ReactNode
  isLoading?: boolean
  confirmText?: string
  cancelText?: string
}

export function AdminDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  itemType = "data",
  description,
  isLoading = false,
  confirmText = "Ya, Hapus",
  cancelText = "Batal",
}: AdminDeleteModalProps) {
  if (!isOpen) return null

  const resolvedTitle =
    title || `Hapus ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}?`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn font-poppins">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={() => !isLoading && onClose()}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer disabled:opacity-50"
          title="Tutup dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4 ring-8 ring-red-50/50">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{resolvedTitle}</h3>

          <p className="text-xs text-gray-600 leading-relaxed max-w-sm mb-6">
            {description ? (
              description
            ) : (
              <>
                Apakah Anda yakin ingin menghapus {itemType}{" "}
                {itemName ? (
                  <span className="font-extrabold text-gray-900">&ldquo;{itemName}&rdquo;</span>
                ) : (
                  "ini"
                )}
                ? Tindakan ini akan menghapus atau menonaktifkan data dari sistem.
              </>
            )}
          </p>

          <div className="flex items-center justify-center gap-3 w-full">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2.5 px-4 rounded-full border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 py-2.5 px-4 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menghapus...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>{confirmText}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDeleteModal
