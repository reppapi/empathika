import { Suspense } from "react"
import PsikotesHasilClient from "@/features/psikotes/components/client/PsikotesHasilClient"

export default function PsikotesHasilPage({ params }: { params: { testId: string } }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans text-gray-500">Memuat hasil psikotes...</div>}>
      <PsikotesHasilClient params={params} />
    </Suspense>
  )
}
