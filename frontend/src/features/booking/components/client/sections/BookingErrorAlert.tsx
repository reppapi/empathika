"use client"

interface BookingErrorAlertProps {
  onRetry: () => void
}

export function BookingErrorAlert({ onRetry }: BookingErrorAlertProps) {
  return (
    <div className="p-8 sm:p-10 text-center bg-amber-50 border border-amber-200 rounded-[1.5rem] shadow-sm mb-12 animate-in fade-in duration-300">
      <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3 text-xl">
        ⚠️
      </div>
      <h3 className="text-base sm:text-lg font-bold text-amber-900 mb-1">
        Gagal memuat daftar layanan &amp; profesional
      </h3>
      <p className="text-xs sm:text-sm text-amber-700 mb-5">
        Silakan periksa koneksi Anda dan coba lagi.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="px-6 py-2.5 bg-[#561269] hover:bg-[#430e52] text-white text-xs sm:text-sm font-bold rounded-full transition shadow-xs active:scale-95 cursor-pointer"
      >
        Muat Ulang
      </button>
    </div>
  )
}
