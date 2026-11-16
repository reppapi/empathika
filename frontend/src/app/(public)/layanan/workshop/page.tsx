import { Suspense } from "react"
import WorkshopDetailClient from "@/features/layanan/components/client/workshop/WorkshopDetailClient"

export const metadata = {
  title: "Workshop Empathika | Layanan Pelatihan & Psikoedukasi",
  description:
    "Empathika menyelenggarakan program workshop interaktif untuk meningkatkan keterampilan praktis dan kesehatan mental.",
}

export default function WorkshopIndexPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-32 text-center text-gray-500">Memuat...</div>}>
      <WorkshopDetailClient slug="seft" />
    </Suspense>
  )
}

