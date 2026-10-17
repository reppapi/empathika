import { Wallet, Users, CheckCircle2, Clock, Sparkles } from "lucide-react"
import {
  MetricItem,
  AgendaItem,
  RecentTransactionItem,
  TodaySessionItem,
  ChartBarItem,
  ChartPeriod,
} from "../types"
import { getTodayTransactions } from "@/features/transaksi/data/transaksiData"
import { RAW_CLIENT_SESSIONS } from "@/features/konseling/components/admin/JadwalAdmin"

export const INITIAL_DASHBOARD_METRICS: MetricItem[] = [
  {
    title: "Pendapatan Bulan Ini",
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
    change: "Akumulasi bulan ini",
    icon: CheckCircle2,
    color: "#5D205E",
  },
  {
    title: "Pendaftar Workshop",
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

export const INITIAL_RECENT_TRANSACTIONS: RecentTransactionItem[] = getTodayTransactions().map(
  (trx) => ({
    id: trx.orderId,
    client: trx.clientName,
    layanan: trx.namaLayanan,
    kategori: trx.jenisLayanan.charAt(0).toUpperCase() + trx.jenisLayanan.slice(1),
    total: trx.totalBayar === 0 ? "Gratis" : `Rp. ${trx.totalBayar.toLocaleString("id-ID")}`,
    metode: trx.metodePembayaran,
    status: trx.status === "Lunas" ? "Lunas" : "Menunggu Pembayaran",
  })
)

export const INITIAL_TODAY_SESSIONS: TodaySessionItem[] = RAW_CLIENT_SESSIONS.map((item) => ({
  waktu: `${item.waktu} WIB`,
  klien: item.namaKlien,
  psikolog: item.psikolog,
  layanan: item.layanan,
  metode: item.tipe.toLowerCase().includes("online") ? "Online" : "Offline",
  status: "Menunggu Jadwal",
}))
