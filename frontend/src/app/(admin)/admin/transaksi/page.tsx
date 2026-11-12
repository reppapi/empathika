import { Suspense } from "react"
import AdminTransaksiClient from "@/features/transaksi/components/admin/AdminTransaksiClient"

export const metadata = {
  title: "Riwayat Transaksi & Pembayaran - Admin Empathika",
  description: "Kelola riwayat transaksi dan pembayaran layanan Empathika",
}

export default function AdminTransaksiPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-[#561269] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminTransaksiClient />
    </Suspense>
  )
}
