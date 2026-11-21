import { Suspense } from "react"
import AdminPsikotesClient from "@/features/psikotes/components/admin/AdminPsikotesClient"
import BiroLoadingState from "@/components/shared/BiroLoadingState"

export const metadata = {
  title: "Data Klien Psikotes - Admin Biro Empathika",
  description: "Pantau data klien dan hasil pengerjaan asesmen psikotes biro mitra Empathika",
}

export default function BiroPsikotesPage() {
  return (
    <Suspense
      fallback={<BiroLoadingState message="Memuat data peserta psikotes biro..." minHeight="min-h-[50vh]" />}
    >
      <AdminPsikotesClient isBiroContext={true} />
    </Suspense>
  )
}

