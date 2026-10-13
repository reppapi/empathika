import AdminTransaksiBiroClient from "@/features/transaksi/components/admin-biro/AdminTransaksiBiroClient"

export const metadata = {
  title: "Riwayat Transaksi - Admin Biro Empathika",
  description: "Pantau riwayat transaksi dan pembayaran layanan biro mitra Empathika",
}

export default function AdminBiroTransaksiPage() {
  return <AdminTransaksiBiroClient />
}
