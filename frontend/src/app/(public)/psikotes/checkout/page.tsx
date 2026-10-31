import { Suspense } from "react"
import PsikotesCheckoutClient from "@/features/psikotes/components/client/PsikotesCheckoutClient"

export default function PsikotesCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center font-poppins text-gray-400 text-sm">
          Memuat halaman checkout...
        </div>
      }
    >
      <PsikotesCheckoutClient />
    </Suspense>
  )
}
