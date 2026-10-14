import { Wallet, Users, CheckCircle2, Clock, Sparkles } from "lucide-react"
import {
  MetricItem,
  AgendaItem,
  RecentTransactionItem,
  TodaySessionItem,
  ChartBarItem,
  ChartPeriod,
} from "../types"

export const INITIAL_DASHBOARD_METRICS: MetricItem[] = [
  {
    title: "Total Pendapatan Bulan Ini",
    value: "Rp 18.750.000",
    change: "+12.5% dari bulan lalu",
    icon: Wallet,
    color: "#5D205E",
  },
  {
    title: "Total Klien Aktif",
    value: "34 Klien",
    change: "+8% dari kemarin",
    icon: Users,
    color: "#5D205E",
  },
  {
    title: "Sesi Konseling Selesai",
    value: "42 Sesi",
    change: "Bulan berjalan",
    icon: CheckCircle2,
    color: "#5D205E",
  },
  {
    title: "Pendaftar Baru Workshop",
    value: "18 Peserta",
    change: "Dari 2 event aktif",
    icon: Sparkles,
    color: "#5D205E",
  },
  {
    title: "Menunggu Pembayaran",
    value: "3 Transaksi",
    change: "Perlu konfirmasi",
    icon: Clock,
    color: "#D97706",
  },
]

export const DASHBOARD_CHART_DATA: Record<ChartPeriod, ChartBarItem[]> = {
  minggu: [
    { label: "Sen", value: 4, height: "45%" },
    { label: "Sel", value: 9, height: "90%" },
    { label: "Rab", value: 3, height: "35%" },
    { label: "Kam", value: 7, height: "70%" },
    { label: "Jum", value: 6, height: "60%" },
    { label: "Sab", value: 8, height: "80%" },
    { label: "Min", value: 2, height: "25%" },
  ],
  bulan: [
    { label: "Mgg 1", value: 24, height: "65%" },
    { label: "Mgg 2", value: 38, height: "95%" },
    { label: "Mgg 3", value: 19, height: "50%" },
    { label: "Mgg 4", value: 31, height: "80%" },
  ],
  bulan_lalu: [
    { label: "Mgg 1", value: 18, height: "55%" },
    { label: "Mgg 2", value: 26, height: "75%" },
    { label: "Mgg 3", value: 32, height: "90%" },
    { label: "Mgg 4", value: 22, height: "65%" },
  ],
}

export const PERIOD_LABELS: Record<ChartPeriod, string> = {
  minggu: "Minggu Ini",
  bulan: "Bulan Ini",
  bulan_lalu: "Bulan Lalu",
}

export const INITIAL_AGENDA_LIST: AgendaItem[] = [
  {
    title: "Workshop SEFT Batch 4",
    type: "Event",
    time: "Besok, 10:00 WIB",
    href: "/admin/event",
    badgeColor: "bg-[#5D205E] text-white",
    dotColor: "bg-[#5D205E]",
  },
  {
    title: "Konseling: Bpk. Andi Pratama",
    type: "Konseling",
    time: "Besok, 13:00 WIB",
    href: "/admin/jadwal",
    badgeColor: "bg-[#F3E8F5] text-[#5D205E]",
    dotColor: "bg-[#BFA3C5]",
  },
  {
    title: "Batas Pembayaran Klien (Invoice #EV-0071)",
    type: "Peringatan",
    time: "Hari Ini, 15:00",
    href: "/admin/transaksi",
    badgeColor: "bg-red-50 text-red-700",
    dotColor: "bg-red-500",
  },
  {
    title: "Webinar Mental Health Awareness",
    type: "Event",
    time: "Kamis, 19:00",
    href: "/admin/event",
    badgeColor: "bg-[#5D205E] text-white",
    dotColor: "bg-[#5D205E]",
  },
  {
    title: "Konseling: Ibu Sarah Melati",
    type: "Konseling",
    time: "Jumat, 09:00 WIB",
    href: "/admin/jadwal",
    badgeColor: "bg-[#F3E8F5] text-[#5D205E]",
    dotColor: "bg-[#BFA3C5]",
  },
  {
    title: "Pengajuan Kerja Sama Baru (Biro Sahabat)",
    type: "Kemitraan",
    time: "Menunggu Review",
    href: "/admin/kerja-sama",
    badgeColor: "bg-blue-50 text-blue-700",
    dotColor: "bg-blue-500",
  },
]

export const INITIAL_RECENT_TRANSACTIONS: RecentTransactionItem[] = [
  {
    id: "TRX-8821",
    client: "Rian Hidayat",
    layanan: "Seminar Resilience & Mindfulness",
    kategori: "Event",
    total: "Rp 102.500",
    metode: "QRIS",
    status: "Lunas",
  },
  {
    id: "TRX-8822",
    client: "Nadia Utami",
    layanan: "Konseling Individu (1 Sesi)",
    kategori: "Konseling",
    total: "Rp 250.000",
    metode: "Transfer BCA",
    status: "Lunas",
  },
  {
    id: "TRX-8823",
    client: "Dimas Wicaksono",
    layanan: "Workshop SEFT Batch 4",
    kategori: "Event",
    total: "Rp 150.000",
    metode: "Mandiri VA",
    status: "Menunggu Pembayaran",
  },
  {
    id: "TRX-8824",
    client: "Farah Salsabila",
    layanan: "Psikotes Minat & Bakat Karir",
    kategori: "Psikotes",
    total: "Rp 320.000",
    metode: "GoPay",
    status: "Lunas",
  },
]

export const INITIAL_TODAY_SESSIONS: TodaySessionItem[] = [
  {
    waktu: "09:00 - 10:00 WIB",
    klien: "Karen Sya",
    psikolog: "Sarah Amalia, M.Psi",
    layanan: "Konseling Dewasa",
    metode: "Online",
    status: "Selesai",
  },
  {
    waktu: "13:30 - 14:30 WIB",
    klien: "Budi Santoso",
    psikolog: "Dr. Dimas Prasetyo",
    layanan: "Konseling Karir & Stres",
    metode: "Offline",
    status: "Sedang Berjalan",
  },
  {
    waktu: "16:00 - 17:00 WIB",
    klien: "Anisa Rahma",
    psikolog: "Rizki Putri D., M.Psi",
    layanan: "Konseling Remaja",
    metode: "Online",
    status: "Mendatang",
  },
]
