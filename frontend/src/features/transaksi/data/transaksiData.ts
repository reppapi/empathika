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

export const getTodayDateKey = (): string => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export const DUMMY_TRANSAKSI: TransaksiItem[] = [
  // ── TRANSAKSI HARI INI (Sesuai Klien Sesi Konseling Hari Ini) ──
  {
    id: "today-1",
    orderId: "KL-0120",
    orderDate: "Hari Ini, 08:30 WIB",
    clientName: "Budi Santoso",
    clientEmail: "budi.santoso@gmail.com",
    clientPhone: "0812-3456-7890",
    jenisLayanan: "konseling",
    namaLayanan: "Konseling Individu",
    psikologOrFasilitator: "Dr. Dimas",
    jadwal: "Hari Ini, 09:00 - 10:00 WIB",
    status: "Lunas",
    subtotal: 250000,
    biayaLayanan: 2500,
    totalBayar: 252500,
    metodePembayaran: "BCA Virtual Account",
    waktuPembayaran: "Hari Ini, 08:35 WIB",
    tanggalTransaksi: getTodayDateKey(),
  },
  {
    id: "today-2",
    orderId: "KL-0121",
    orderDate: "Hari Ini, 09:15 WIB",
    clientName: "Karenn Sya",
    clientEmail: "karennsya@gmail.com",
    clientPhone: "0813-8899-7711",
    jenisLayanan: "konseling",
    namaLayanan: "Konseling Pribadi",
    psikologOrFasilitator: "Dr. Dimas",
    jadwal: "Hari Ini, 13:00 - 14:00 WIB",
    status: "Lunas",
    subtotal: 250000,
    biayaLayanan: 2500,
    totalBayar: 252500,
    metodePembayaran: "BCA Virtual Account",
    waktuPembayaran: "Hari Ini, 09:20 WIB",
    tanggalTransaksi: getTodayDateKey(),
  },
  {
    id: "today-3",
    orderId: "KL-0122",
    orderDate: "Hari Ini, 10:00 WIB",
    clientName: "Sarah & David",
    clientEmail: "sarah.david@gmail.com",
    clientPhone: "0821-9988-7766",
    jenisLayanan: "konseling",
    namaLayanan: "Konseling Pasangan",
    psikologOrFasilitator: "Dr. Dimas",
    jadwal: "Hari Ini, 16:30 - 17:30 WIB",
    status: "Lunas",
    subtotal: 350000,
    biayaLayanan: 2500,
    totalBayar: 352500,
    metodePembayaran: "Mandiri Virtual Account",
    waktuPembayaran: "Hari Ini, 10:05 WIB",
    tanggalTransaksi: getTodayDateKey(),
  },
  {
    id: "today-4",
    orderId: "KL-0123",
    orderDate: "Hari Ini, 11:20 WIB",
    clientName: "Dimas Pratama",
    clientEmail: "dimas.pratama@gmail.com",
    clientPhone: "0857-1122-3344",
    jenisLayanan: "konseling",
    namaLayanan: "Home Visit",
    psikologOrFasilitator: "Dr. Dimas",
    jadwal: "Hari Ini, 15:00 - 16:00 WIB",
    status: "Menunggu Pembayaran",
    subtotal: 400000,
    biayaLayanan: 2500,
    totalBayar: 402500,
    metodePembayaran: "QRIS GoPay",
    waktuPembayaran: "-",
    tanggalTransaksi: getTodayDateKey(),
  },
  {
    id: "today-5",
    orderId: "AS-0050",
    orderDate: "Hari Ini, 12:10 WIB",
    clientName: "Amanda Putri",
    clientEmail: "amanda.putri@gmail.com",
    clientPhone: "0858-6677-8899",
    jenisLayanan: "asesment",
    namaLayanan: "Asesmen Klinis",
    psikologOrFasilitator: "Dr. Dimas",
    jadwal: "Hari Ini, 20:00 - 21:00 WIB",
    status: "Lunas",
    subtotal: 300000,
    biayaLayanan: 2500,
    totalBayar: 302500,
    metodePembayaran: "BNI Virtual Account",
    waktuPembayaran: "Hari Ini, 12:15 WIB",
    tanggalTransaksi: getTodayDateKey(),
  },

  // ── AGUSTUS 2026 (Urutan tanggal lama ke baru) ──
  {
    id: "aug-1",
    orderId: "EV-0071",
    orderDate: "15 Agu 2026, 10:00 WIB",
    clientName: "Rian Hidayat",
    clientEmail: "rian.h@gmail.com",
    clientPhone: "081288990011",
    jenisLayanan: "event",
    namaLayanan: "Seminar Resilience & Mindfulness",
    psikologOrFasilitator: "Dr. Dimas & Sarah Amalia",
    jadwal: "20 Agu 2026, 09:00 - 12:00 WIB",
    status: "Lunas",
    subtotal: 100000,
    biayaLayanan: 2500,
    totalBayar: 102500,
    metodePembayaran: "QRIS GoPay",
    waktuPembayaran: "15 Agu 2026, 10:05 WIB",
    tanggalTransaksi: "2026-08-15",
  },
  {
    id: "aug-2",
    orderId: "KL-0082",
    orderDate: "22 Agu 2026, 14:30 WIB",
    clientName: "Nadia Utami",
    clientEmail: "nadia.u@gmail.com",
    clientPhone: "085711223344",
    jenisLayanan: "konseling",
    namaLayanan: "Konseling Karir & Passion",
    psikologOrFasilitator: "Sarah Amalia, M.Psi",
    jadwal: "25 Agu 2026, 13:00 - 14:00 WIB",
    status: "Lunas",
    subtotal: 250000,
    biayaLayanan: 2500,
    totalBayar: 252500,
    metodePembayaran: "BCA Virtual Account",
    waktuPembayaran: "22 Agu 2026, 14:35 WIB",
    tanggalTransaksi: "2026-08-22",
  },

  // ── SEPTEMBER 2026 (Urutan tanggal lama ke baru) ──
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
  {
    id: "7",
    orderId: "EV-0092",
    orderDate: "12 Sep 2026, 09:10 WIB",
    clientName: "Clarissa Aurelia",
    clientEmail: "clarissa.a@gmail.com",
    clientPhone: "081233445566",
    jenisLayanan: "event",
    namaLayanan: "SEFT Empathika : A Moment to Remember",
    psikologOrFasilitator: "Sarah Amalia, M.Psi",
    jadwal: "15 Sep 2026, 10:00 - 12:30 WIB",
    status: "Lunas",
    subtotal: 150000,
    biayaLayanan: 2500,
    totalBayar: 152500,
    metodePembayaran: "BCA Virtual Account",
    waktuPembayaran: "12 Sep 2026, 09:15 WIB",
    tanggalTransaksi: "2026-09-12",
  },
  {
    id: "8",
    orderId: "EV-0095",
    orderDate: "18 Sep 2026, 13:45 WIB",
    clientName: "Dimas Anggara",
    clientEmail: "dimas.ang@gmail.com",
    clientPhone: "081377889922",
    jenisLayanan: "event",
    namaLayanan: "Workshop Manajemen Stress & Burnout",
    psikologOrFasilitator: "Dr. Dimas",
    jadwal: "22 Sep 2026, 13:00 - 15:00 WIB",
    status: "Menunggu Pembayaran",
    subtotal: 120000,
    biayaLayanan: 2500,
    totalBayar: 122500,
    metodePembayaran: "Mandiri Virtual Account",
    waktuPembayaran: "-",
    tanggalTransaksi: "2026-09-18",
  },

  // ── OKTOBER 2026 (Urutan tanggal lama ke baru) ──
  {
    id: "oct-1",
    orderId: "EV-0103",
    orderDate: "5 Okt 2026, 11:00 WIB",
    clientName: "Maya Indah",
    clientEmail: "maya.indah@gmail.com",
    clientPhone: "081900112233",
    jenisLayanan: "event",
    namaLayanan: "Empathika Goes To School - SMAN 1 Bandung",
    psikologOrFasilitator: "Dr. Andi Pratama, M.Psi.",
    jadwal: "15 Okt 2026, 09:00 - 11:30 WIB",
    status: "Lunas",
    subtotal: 0,
    biayaLayanan: 0,
    totalBayar: 0,
    metodePembayaran: "Gratis / Sponsorship",
    waktuPembayaran: "5 Okt 2026, 11:00 WIB",
    tanggalTransaksi: "2026-10-05",
  },
  {
    id: "oct-2",
    orderId: "PT-0115",
    orderDate: "10 Okt 2026, 09:30 WIB",
    clientName: "Bambang Pamungkas",
    clientEmail: "bambang.p@gmail.com",
    clientPhone: "081122334455",
    jenisLayanan: "psikotes",
    namaLayanan: "Psikotes Kepribadian & Potensi Akademik",
    psikologOrFasilitator: "Sarah Amalia, M.Psi",
    jadwal: "12 Okt 2026, 09:00 - 12:00 WIB",
    status: "Lunas",
    subtotal: 300000,
    biayaLayanan: 2500,
    totalBayar: 302500,
    metodePembayaran: "BCA Virtual Account",
    waktuPembayaran: "10 Okt 2026, 09:35 WIB",
    tanggalTransaksi: "2026-10-10",
  },
]

export const getLatestTransaksi = (limit = 4): TransaksiItem[] => {
  return [...DUMMY_TRANSAKSI]
    .sort((a, b) => b.tanggalTransaksi.localeCompare(a.tanggalTransaksi))
    .slice(0, limit)
}

export const getDefaultTransaksi = (limit = 4): TransaksiItem[] => {
  const sept = DUMMY_TRANSAKSI.filter((item) => item.tanggalTransaksi.startsWith("2026-09"))
  return (sept.length > 0 ? sept : DUMMY_TRANSAKSI)
    .sort((a, b) => a.tanggalTransaksi.localeCompare(b.tanggalTransaksi))
    .slice(0, limit)
}

export const getTodayTransactions = (dateKey?: string): TransaksiItem[] => {
  const targetDate = dateKey || getTodayDateKey()
  const list = DUMMY_TRANSAKSI.filter((item) => item.tanggalTransaksi === targetDate)
  return list
}
