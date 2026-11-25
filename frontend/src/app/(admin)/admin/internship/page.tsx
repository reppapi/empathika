import { Suspense } from "react"
import AdminInternshipClient from "@/features/internship/components/admin/AdminInternshipClient"

export const metadata = {
  title: "Kelola Program Internship - Admin Empathika",
  description: "Kelola lowongan internship, buka atau tutup pendaftaran di halaman website Empathika.",
}

export default function AdminInternshipPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-gray-400 font-poppins text-sm flex items-center gap-2">
          <span>Memuat halaman kelola Internship...</span>
        </div>
      }
    >
      <AdminInternshipClient />
    </Suspense>
  )
}
