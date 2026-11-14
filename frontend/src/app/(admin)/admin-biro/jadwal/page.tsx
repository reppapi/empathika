import { Suspense } from "react"
import JadwalAdmin from "@/features/konseling/components/admin/JadwalAdmin"

export const metadata = {
  title: "Jadwal dan Sesi - Admin Biro Empathika",
  description: "Pantau jadwal konsultasi dan sesi klien biro mitra Empathika",
}

export default function BiroJadwalPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-gray-400 font-poppins">
          Memuat jadwal dan sesi biro...
        </div>
      }
    >
      <JadwalAdmin isBiroContext={true} />
    </Suspense>
  )
}

