"use client"

import React from "react"
import Link from "next/link"

export function KonselingEmptyState() {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 text-2xl">
        ⚠️
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        Layanan Konsultasi Sedang Dinonaktifkan
      </h3>
      <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-6 leading-relaxed">
        Seluruh layanan konsultasi saat ini sedang tidak aktif oleh administrator dan belum menerima
        pendaftaran sesi baru.
      </p>
      <Link
        href="/layanan"
        className="inline-flex px-6 py-2.5 bg-[#561269] text-white text-xs font-bold rounded-full hover:bg-[#430e52] transition shadow-xs"
      >
        Lihat Layanan Lainnya
      </Link>
    </div>
  )
}
