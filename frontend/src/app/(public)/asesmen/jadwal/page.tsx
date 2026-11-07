import { Suspense } from "react"
import AsesmenJadwalClient from "@/features/asesmen/components/client/AsesmenJadwalClient"

export default function AsesmenJadwalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center font-poppins text-gray-400 text-sm">
          Memuat jadwal asesmen...
        </div>
      }
    >
      <AsesmenJadwalClient />
    </Suspense>
  )
}

