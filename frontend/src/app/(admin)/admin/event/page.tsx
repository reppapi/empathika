import { Suspense } from "react"
import AdminEventClient from "@/features/event/components/admin/AdminEventClient"

export const metadata = {
  title: "Kelola Event - Admin Empathika",
  description: "Halaman pengelolaan event dan seminar Empathika",
}

export default function AdminEventPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-400 font-poppins text-sm">Memuat daftar event...</div>}>
      <AdminEventClient />
    </Suspense>
  )
}
