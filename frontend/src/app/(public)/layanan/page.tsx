import { Suspense } from "react"
import LayananClient from "@/features/layanan/components/client/LayananClient"

export default function LayananPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LayananClient />
    </Suspense>
  )
}
