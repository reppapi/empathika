import { Suspense } from "react"
import JadwalAdmin from "@/features/konseling/components/admin/JadwalAdmin"

export default function JadwalDanSesiPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-400 font-poppins">Memuat data jadwal & sesi...</div>}>
      <JadwalAdmin />
    </Suspense>
  )
}
