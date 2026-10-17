import { Suspense } from "react"
import AsesmenBookingClient from "@/features/booking/components/client/AsesmenBookingClient"

export default function AsesmenPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-poppins text-gray-500">Memuat...</div>}>
      <AsesmenBookingClient />
    </Suspense>
  )
}
