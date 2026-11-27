"use client"

import React from "react"
import { Trash2 } from "lucide-react"
import { InternshipPosition } from "@/services/internship.service"

interface ModalDeletePositionProps {
  itemToDelete: InternshipPosition | null
  onClose: () => void
  onConfirm: () => void
  submitting: boolean
}

export function ModalDeletePosition({
  itemToDelete,
  onClose,
  onConfirm,
  submitting,
}: ModalDeletePositionProps) {
  if (!itemToDelete) return null

  return (
    <div className="fixed inset-0 z-50 !m-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-gray-100">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Trash2 className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900">Hapus Posisi Internship?</h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
            Apakah Anda yakin ingin menghapus posisi{" "}
            <strong className="text-gray-900">&ldquo;{itemToDelete.judul}&rdquo;</strong>? Tindakan ini
            tidak dapat dibatalkan.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-xs transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            onClick={onConfirm}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "Menghapus..." : "Ya, Hapus Posisi"}
          </button>
        </div>
      </div>
    </div>
  )
}
