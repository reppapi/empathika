"use client"

import React from "react"
import Link from "next/link"
import { AlertCircle, ArrowLeft } from "lucide-react"

interface ApplyNotFoundViewProps {
  internshipListHref: string
}

export function ApplyNotFoundView({ internshipListHref }: ApplyNotFoundViewProps) {
  return (
    <div className="min-h-screen bg-[#FAF7FB] py-20 px-4 font-poppins flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-200 text-center shadow-lg">
        <AlertCircle className="w-14 h-14 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Posisi Tidak Ditemukan</h2>
        <p className="text-gray-600 text-sm mb-6">
          Lowongan magang yang Anda cari mungkin sudah ditutup atau tautan tidak valid.
        </p>
        <Link
          href={internshipListHref as any}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#561269] text-white font-bold text-sm hover:bg-[#6e1885] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Lowongan Tersedia</span>
        </Link>
      </div>
    </div>
  )
}
