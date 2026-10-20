import { Suspense } from "react"
import PsikologJadwalClient from "@/features/psikolog/components/psikolog/PsikologJadwalClient"

export default function PsikologWebJadwalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center font-sans text-gray-400 text-sm">
          Memuat data jadwal psikolog...
        </div>
      }
    >
      <PsikologJadwalClient />
    </Suspense>
  )
}

