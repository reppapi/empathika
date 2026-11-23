import { Suspense } from "react"
import AdminPembagianClient from "@/features/transaksi/components/admin/AdminPembagianClient"

export const metadata = {
  title: "Rekap Pembagian Pendapatan Psikolog - Admin Empathika",
  description: "Rekapitulasi pembagian honor dan pencairan manual pendapatan psikolog",
}

export default function AdminPembagianPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-[#561269] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminPembagianClient />
    </Suspense>
  )
}
