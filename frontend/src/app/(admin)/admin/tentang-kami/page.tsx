import { Suspense } from "react"
import AdminTentangKamiClient from "@/features/tentang-kami/components/admin/AdminTentangKamiClient"

export const metadata = {
  title: "Kelola Tentang Kami - Admin Empathika",
  description: "Kelola foto galeri, narasi filosofi, nilai utama, dan alasan kehadiran Empathika.",
}

export default function AdminTentangKamiPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-gray-400 font-poppins text-sm flex items-center gap-2">
          <span>Memuat halaman kelola Tentang Kami...</span>
        </div>
      }
    >
      <AdminTentangKamiClient />
    </Suspense>
  )
}

