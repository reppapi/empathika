import { Suspense } from "react"
import AsesmenClient from "@/features/asesmen/components/client/AsesmenClient"

export default function AsesmenPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-poppins text-gray-500">Memuat...</div>}>
      <AsesmenClient />
    </Suspense>
  )
}
