/** Halaman detail informasi paket tes psikotes dan verifikasi tiket akses. */
import { Suspense } from "react"
import PsikotesDetailClient from "@/features/psikotes/components/client/catalog/PsikotesDetailClient"

export default function PsikotesTestPage({ params }: { params: { testId: string } }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAFC] flex items-center justify-center font-sans text-gray-500">Memuat detail psikotes...</div>}>
      <PsikotesDetailClient params={params} />
    </Suspense>
  )
}
