import { Suspense } from "react"
import LayananClient from "@/features/layanan/components/LayananClient"

export default function LayananPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LayananClient />
    </Suspense>
  )
}
