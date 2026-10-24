export interface BookedAssessment {
  id: string
  date: string // format YYYY-MM-DD
  waktu: string
  layanan: string
  metode: "Online" | "Offline"
  namaKlien?: string
  psikolog?: string
  status?: "Aktif" | "Dibatalkan" | "Selesai" | string
}

export type ClientSessionStatus =
  | "Selesai"
  | "Segera Dimulai"
  | "Menunggu Jadwal"
  | "Sedang Berlangsung"
  | "Dibatalkan"

export interface ClientSessionToday {
  id: string
  date?: string // format YYYY-MM-DD
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
}

export interface WeeklyTemplateItem {
  dayOffset: number // 0 = Senin, 1 = Selasa, 2 = Rabu, 3 = Kamis, 4 = Jumat, 5 = Sabtu
  waktu: string
  layanan: string
  metode: "Online" | "Offline"
  namaKlien: string
  psikolog: string
}
