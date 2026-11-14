import { Suspense } from "react"
import AdminPsikotesClient from "@/features/psikotes/components/admin/AdminPsikotesClient"

export const metadata = {
  title: "Data Klien Psikotes - Admin Biro Empathika",
  description: "Pantau data klien dan hasil pengerjaan asesmen psikotes biro mitra Empathika",
}

export default function BiroPsikotesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-gray-400 font-poppins">
          Memuat data peserta psikotes...
        </div>
      }
    >
      <AdminPsikotesClient isBiroContext={true} />
    </Suspense>
  )
}

