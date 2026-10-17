import { Suspense } from "react"
import PsikotesMulaiClient from "@/features/psikotes/components/client/PsikotesMulaiClient"

export default function PsikotesMulaiPage({ params }: { params: { testId: string } }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fbfbfb] flex items-center justify-center font-sans text-gray-500">Memuat tes psikotes...</div>}>
      <PsikotesMulaiClient params={params} />
    </Suspense>
  )
}
