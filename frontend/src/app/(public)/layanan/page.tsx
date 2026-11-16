import { Suspense } from "react"
import LayananClient from "@/features/layanan/components/client/LayananClient"

export default function LayananPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <LayananClient />
    </Suspense>
  )
}
