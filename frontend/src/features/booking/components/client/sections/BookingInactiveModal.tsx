"use client"

import Link from "next/link"

interface BookingInactiveModalProps {
  isOpen: boolean
  onClose: () => void
  namaLayanan: string
  layananHref: string
}

export function BookingInactiveModal({
  isOpen,
  onClose,
  namaLayanan,
  layananHref,
}: BookingInactiveModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] max-w-md w-full p-6 sm:p-8 text-center shadow-2xl border border-gray-100 transform animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 text-3xl">
          ⚠️
        </div>
        <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-2">
          Pendaftaran Sesi Tidak Tersedia
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
          Mohon maaf, layanan konsultasi{" "}
          <span className="font-bold text-[#561269]">&ldquo;{namaLayanan}&rdquo;</span> sudah
          dinonaktifkan oleh admin. Anda saat ini tidak dapat melakukan pendaftaran sesi untuk layanan ini.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-gray-300 text-gray-700 font-bold text-xs sm:text-sm hover:bg-gray-100 transition cursor-pointer"
          >
            Tutup
          </button>
          <Link
            href={layananHref as any}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#561269] text-white font-bold text-xs sm:text-sm hover:bg-[#430e52] transition shadow-xs"
          >
            Lihat Layanan Lain
          </Link>
        </div>
      </div>
    </div>
  )
}
