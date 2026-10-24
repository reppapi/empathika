export interface BookedAssessment {
  id: string
  date: string // format YYYY-MM-DD
  waktu: string
  layanan: string
  metode: "Online" | "Offline"
  namaKlien?: string
  psikolog?: string
}

export type ClientSessionStatus =
  | "Selesai"
  | "Segera Dimulai"
  | "Menunggu Jadwal"
  | "Sedang Berlangsung"
  | "Dibatalkan"
  | "Dibatalkan (Refund)"

export interface ClientSessionToday {
  id: string
  waktu: string
  namaKlien: string
  klienId: string
  kontak?: string
  psikolog: string
  layanan: string
  tipe: string
  catatan?: string
  status: ClientSessionStatus
  isUpcomingNearest?: boolean
  tanggal?: string
  // Fitur Refund H-1
  canRefund?: boolean
  isPastH1?: boolean
  isRefunded?: boolean
  isPaid?: boolean
  refundDeadline?: string
  nominalRefund?: number
  idTransaksi?: string | null
  kodeTransaksi?: string | null
  // Fitur Invoice (populated dari API saat data dari BE)
  hasInvoice?: boolean       // apakah sudah ada invoice
  invoiceStatus?: "BELUM_DIKIRIM" | "DIKIRIM" | "GAGAL" | null
  invoiceSentAt?: string | null
}

export interface WeeklyTemplateItem {
  dayOffset: number // 0 = Senin, 1 = Selasa, 2 = Rabu, 3 = Kamis, 4 = Jumat, 5 = Sabtu
  waktu: string
  layanan: string
  metode: "Online" | "Offline"
  namaKlien: string
  psikolog: string
}

