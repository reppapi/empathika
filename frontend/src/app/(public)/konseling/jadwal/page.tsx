import { Suspense } from "react"
import JadwalClient from "@/features/konseling/components/client/JadwalClient"

export default function BookingJadwalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-poppins text-gray-500">Memuat...</div>}>
      <JadwalClient />
    </Suspense>
  )
}

