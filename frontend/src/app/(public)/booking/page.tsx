import { Suspense } from "react"
import BookingClient from "@/features/booking/components/client/BookingClient"

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-poppins text-gray-500">Memuat...</div>}>
      <BookingClient />
    </Suspense>
  )
}

