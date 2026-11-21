import { Suspense } from "react"
import JadwalAdmin from "@/features/konseling/components/admin/JadwalAdmin"
import BiroLoadingState from "@/components/shared/BiroLoadingState"

export const metadata = {
  title: "Jadwal dan Sesi - Admin Biro Empathika",
  description: "Pantau jadwal konsultasi dan sesi klien biro mitra Empathika",
}

export default function BiroJadwalPage() {
  return (
    <Suspense
      fallback={<BiroLoadingState message="Memuat jadwal dan sesi biro..." minHeight="min-h-[50vh]" />}
    >
      <JadwalAdmin isBiroContext={true} />
    </Suspense>
  )
}

