import { Suspense } from "react"
import BayarClient from "@/features/konseling/components/client/BayarClient"

export default function BookingBayarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-poppins text-gray-400 text-sm">Memuat...</div>}>
      <BayarClient />
    </Suspense>
  )
}
