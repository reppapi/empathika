import { Suspense } from "react"
import EventCheckoutClient from "@/features/event/components/client/EventCheckoutClient"

export default function EventCheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-poppins text-gray-400 text-sm">Memuat...</div>}>
      <EventCheckoutClient />
    </Suspense>
  )
}
