"use client"

import React from "react"
import { AlertTriangle, Loader2 } from "lucide-react"

export interface ClientErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  retryText?: string
  isRetrying?: boolean
  className?: string
}

export function ClientErrorState({
  title,
  message = "Gagal memuat daftar layanan. Silakan periksa koneksi Anda dan coba lagi.",
  onRetry,
  retryText = "Muat Ulang",
  isRetrying = false,
  className = "",
}: ClientErrorStateProps) {
  return (
    <div
      className={`p-8 sm:p-10 text-center bg-amber-50/70 border border-amber-200 rounded-2xl my-4 shadow-xs transition-all ${className}`}
    >
      <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
        <AlertTriangle className="w-5 h-5 text-amber-600" />
      </div>
      {title && (
        <h4 className="text-base sm:text-lg font-bold text-amber-950 mb-1">
          {title}
        </h4>
      )}
      <p className="text-sm sm:text-base font-bold text-amber-950 mb-3 max-w-md mx-auto leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="mt-1 px-6 py-2.5 bg-[#561269] hover:bg-[#430e52] text-white text-xs sm:text-sm font-bold rounded-full transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-60 inline-flex items-center justify-center gap-2"
        >
          {isRetrying && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {retryText}
        </button>
      )}
    </div>
  )
}

export default ClientErrorState
