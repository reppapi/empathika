export interface BookedAssessment {
  id: string
  date: string // format YYYY-MM-DD
  waktu: string
  layanan: string
  metode: "Online" | "Offline"
  namaKlien?: string
  kontak?: string
  klienId?: string
  psikolog?: string
  id_psikolog?: string
  noTeleponPsikolog?: string
  catatan?: string
  status?: "Aktif" | "Dibatalkan" | "Reschedule" | "Selesai" | string
  isAvailableSlot?: boolean
  isBooked?: boolean
  isRescheduled?: boolean
  isCancelled?: boolean
  tipe_jadwal?: "ASESMEN" | "KONSULTASI" | string
}

export type ClientSessionStatus =
  | "Selesai"
  | "Segera Dimulai"
  | "Menunggu Jadwal"
  | "Sedang Berlangsung"
  | "Dibatalkan"
  | "Dibatalkan (Refund)"
  | "Reschedule"

export interface ClientSessionToday {
  id: string
  bookingId?: string
  date?: string // format YYYY-MM-DD
  waktu: string
  newDate?: string
  newWaktu?: string
  namaKlien: string
  klienId: string
  kontak?: string
  psikolog: string
  idPsikolog?: string
  noTeleponPsikolog?: string
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

