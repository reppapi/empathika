import { Suspense } from "react"
import SeminarDetailClient from "@/features/layanan/components/client/seminar/SeminarDetailClient"

export const metadata = {
  title: "Seminar Empathika | Layanan Edukasi & Psikoedukasi",
  description:
    "Empathika menyelenggarakan program seminar sebagai ruang edukatif dan reflektif untuk meningkatkan pemahaman psikologis serta kesadaran diri.",
}

export default function SeminarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-32 text-center text-gray-500">Memuat...</div>}>
      <SeminarDetailClient />
    </Suspense>
  )
}
