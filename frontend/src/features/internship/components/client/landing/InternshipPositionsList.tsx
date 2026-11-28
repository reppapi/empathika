"use client"

import React from "react"
import Link from "next/link"
import { AlertCircle, ArrowRight } from "lucide-react"
import { InternshipPosition } from "@/services/internship.service"
import { InternshipPositionCard } from "./InternshipPositionCard"

interface InternshipPositionsListProps {
  positions: InternshipPosition[]
  loading: boolean
  withBiro: (path: string) => string
}

export function InternshipPositionsList({
  positions,
  loading,
  withBiro,
}: InternshipPositionsListProps) {
  return (
    <section id="posisi-tersedia" className="py-16 sm:py-24 bg-[#FAF7FB]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Open Positions
          </h2>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Pilih posisi yang sesuai dengan keahlian dan minatmu. Bersama Empathika, wujudkan
            kontribusi nyata untuk ekosistem kesehatan mental Indonesia.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-10 h-10 border-4 border-[#561269] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500 font-medium">Memuat lowongan tersedia...</p>
          </div>
        ) : positions.length === 0 ? (
          <div className="bg-white border border-dashed border-purple-200 rounded-3xl p-10 sm:p-14 text-center max-w-2xl mx-auto shadow-sm">
            <div className="w-16 h-16 bg-purple-50 text-[#561269] rounded-2xl flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-8 h-8 text-[#561269]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Belum Ada Posisi yang Dibuka
            </h3>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
              Saat ini program internship sedang ditutup atau belum ada posisi baru yang dibuka.
              Ikuti terus informasi terbaru kami untuk mengetahui gelombang pendaftaran berikutnya.
            </p>
            <Link
              href={withBiro ? withBiro("/kerja-sama") : "/kerja-sama"}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] text-[#0f172a] font-bold text-sm shadow-sm hover:shadow transition-all"
            >
              <span>Eksplor Program Kerja Sama</span>
              <ArrowRight className="w-4 h-4 text-[#0f172a]" />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {positions.map((pos) => (
              <InternshipPositionCard key={pos.id} position={pos} withBiro={withBiro} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
