"use client"

import { PsikologUI } from "@/types/psikolog"
import { PsikologCard } from "@/features/psikolog/components/client/PsikologCard"

interface BookingProfessionalsGridProps {
  isLoading: boolean
  professionals: PsikologUI[]
  currentFilter: string
  isLayananNonaktif: boolean
  onAttemptBooking: () => void
}

export function BookingProfessionalsGrid({
  isLoading,
  professionals,
  currentFilter,
  isLayananNonaktif,
  onAttemptBooking,
}: BookingProfessionalsGridProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
        <div className="w-8 h-8 border-3 border-[#561269] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-500">Memuat data tenaga ahli...</p>
      </div>
    )
  }

  if (professionals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <p className="text-sm font-semibold text-gray-600">
          Belum ada tenaga profesional yang terdaftar untuk kategori {currentFilter}.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Silakan pilih kategori lain atau periksa kembali nanti.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 min-h-[400px]">
      {professionals.map((doc, i) => (
        <PsikologCard
          key={doc.id || i}
          psikolog={doc}
          mode="konseling"
          isLayananNonaktif={isLayananNonaktif}
          onAttemptBooking={onAttemptBooking}
        />
      ))}
    </div>
  )
}
