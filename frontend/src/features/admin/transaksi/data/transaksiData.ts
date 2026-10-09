export type JenisLayanan =
  | "semua"
  | "konseling"
  | "psikotes"
  | "pelatihan peer helper"
  | "event"
  | "asesment"

export interface TransaksiItem {
  id: string
  orderId: string
  orderDate: string
  clientName: string
  clientEmail: string
  clientPhone: string
  jenisLayanan: "konseling" | "psikotes" | "pelatihan peer helper" | "event" | "asesment"
  namaLayanan: string
  psikologOrFasilitator?: string
  jadwal: string
  status: "Lunas" | "Menunggu Pembayaran" | "Gagal"
  subtotal: number
  biayaLayanan: number
  totalBayar: number
  metodePembayaran: string
  waktuPembayaran?: string
  tanggalTransaksi: string // YYYY-MM-DD
}

export const DUMMY_TRANSAKSI: TransaksiItem[] = [
  {
    id: "1",
    orderId: "KL-0098",
    orderDate: "1 Sep 2026, 09:43 WIB",
    clientName: "Karenn Sya",
    clientEmail: "karennsya@gmail.com",
    clientPhone: "08120083773",
    jenisLayanan: "konseling",
    namaLayanan: "Konseling Individu",
    psikologOrFasilitator: "Dr. Dimas",
    jadwal: "1 Sep 2026, 13:00 - 14:00 WIB",
    status: "Lunas",
    subtotal: 250000,
    biayaLayanan: 2500,
    totalBayar: 252500,
    metodePembayaran: "BCA Virtual Account",
    waktuPembayaran: "1 Sep 2026, 09:35 WIB",
    tanggalTransaksi: "2026-09-01",
  },
  {
    id: "2",
    orderId: "PT-0102",
    orderDate: "2 Sep 2026, 10:15 WIB",
    clientName: "Ahmad Rizky",
    clientEmail: "ahmad.rizky@gmail.com",
    clientPhone: "081399882211",
    jenisLayanan: "psikotes",
    namaLayanan: "Psikotes Minat & Bakat Karir",
    psikologOrFasilitator: "Sarah Amalia, M.Psi",
    jadwal: "3 Sep 2026, 09:00 - 12:00 WIB",
    status: "Lunas",
    subtotal: 350000,
    biayaLayanan: 2500,
    totalBayar: 352500,
    metodePembayaran: "Mandiri Virtual Account",
    waktuPembayaran: "2 Sep 2026, 10:20 WIB",
    tanggalTransaksi: "2026-09-02",
  },
  {
    id: "3",
    orderId: "PH-0045",
    orderDate: "3 Sep 2026, 14:00 WIB",
    clientName: "Siti Rahma",
    clientEmail: "siti.rahma@gmail.com",
    clientPhone: "087811223344",
    jenisLayanan: "pelatihan peer helper",
    namaLayanan: "Pelatihan Peer Helper Tingkat Dasar",
    psikologOrFasilitator: "Tim Empathika Training",
    jadwal: "5 Sep 2026, 08:30 - 16:00 WIB",
    status: "Menunggu Pembayaran",
    subtotal: 500000,
    biayaLayanan: 2500,
    totalBayar: 502500,
    metodePembayaran: "BNI Virtual Account",
    waktuPembayaran: "-",
    tanggalTransaksi: "2026-09-03",
  },
  {
    id: "4",
    orderId: "EV-0089",
    orderDate: "4 Sep 2026, 11:20 WIB",
    clientName: "Budi Santoso",
    clientEmail: "budi.santoso@gmail.com",
    clientPhone: "085677889900",
    jenisLayanan: "event",
    namaLayanan: "Workshop Mengenal Inner Child & Self Healing",
    psikologOrFasilitator: "Dr. Sarah Amalia & Rian Pratama",
    jadwal: "10 Sep 2026, 10:30 - 12:30 WIB",
    status: "Lunas",
    subtotal: 150000,
    biayaLayanan: 2500,
    totalBayar: 152500,
    metodePembayaran: "QRIS GoPay",
    waktuPembayaran: "4 Sep 2026, 11:25 WIB",
    tanggalTransaksi: "2026-09-04",
  },
  {
    id: "5",
    orderId: "AS-0033",
    orderDate: "5 Sep 2026, 15:30 WIB",
    clientName: "Dewi Lestari",
    clientEmail: "dewi.lestari@gmail.com",
    clientPhone: "081234567890",
    jenisLayanan: "asesment",
    namaLayanan: "Asesment Kesiapan Mental Kerja",
    psikologOrFasilitator: "Nadira Larasati, M.Psi",
    jadwal: "7 Sep 2026, 14:00 - 15:30 WIB",
    status: "Lunas",
    subtotal: 400000,
    biayaLayanan: 2500,
    totalBayar: 402500,
    metodePembayaran: "BCA Virtual Account",
    waktuPembayaran: "5 Sep 2026, 15:32 WIB",
    tanggalTransaksi: "2026-09-05",
  },
  {
    id: "6",
    orderId: "KL-0105",
    orderDate: "6 Sep 2026, 16:00 WIB",
    clientName: "Fajar Pratama",
    clientEmail: "fajar.p@gmail.com",
    clientPhone: "081299001122",
    jenisLayanan: "konseling",
    namaLayanan: "Konseling Pasangan / Pranikah",
    psikologOrFasilitator: "Dr. Dimas",
    jadwal: "8 Sep 2026, 15:00 - 16:30 WIB",
    status: "Menunggu Pembayaran",
    subtotal: 350000,
    biayaLayanan: 2500,
    totalBayar: 352500,
    metodePembayaran: "BRI Virtual Account",
    waktuPembayaran: "-",
    tanggalTransaksi: "2026-09-06",
  },
]
