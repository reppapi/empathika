import { LucideIcon } from "lucide-react"

export interface TodaySessionItem {
  waktu: string
  klien: string
  psikolog: string
  layanan: string
  metode: "Online" | "Offline"
  status:
    | "Selesai"
    | "Sedang Berjalan"
    | "Sedang Berlangsung"
    | "Segera Dimulai"
    | "Menunggu Jadwal"
    | "Mendatang"
    | "Dibatalkan"
    | "Dibatalkan (Refund)"
}

export interface MetricItem {
  title: string
  value: string
  change: string
  icon: LucideIcon
  color: string
}

export interface AgendaItem {
  title: string
  type: string
  time: string
  href: string
  badgeColor: string
  dotColor: string
}

export interface RecentTransactionItem {
  id: string
  client: string
  layanan: string
  kategori: string
  total: string
  metode: string
  status: "Lunas" | "Menunggu Pembayaran"
}

export type ChartPeriod = "minggu" | "bulan" | "bulan_lalu"

export interface ChartBarItem {
  label: string
  value: number
  height: string
}
