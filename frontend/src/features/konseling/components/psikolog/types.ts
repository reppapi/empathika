export const DEFAULT_LAYANAN_KONSULTASI = [
  "Semua Layanan Konsultasi",
]

export const DEFAULT_TIME_SLOTS = [
  "09:00 - 10:00",
  "10:00 - 11:00",
  "13:30 - 14:30",
  "14:30 - 15:30",
  "15:30 - 16:30",
]

export type MetodeKonsultasi = "Online" | "Offline" | "Keduanya"

export interface BookedSession {
  id: string
  date: string // format YYYY-MM-DD
  waktu: string
  layanan: string
  metode: MetodeKonsultasi
  namaKlien?: string
  kontak?: string
  klienId?: string
  id_psikolog?: string
  namaPsikolog?: string
  noTeleponPsikolog?: string
  catatan?: string
  isAvailableSlot?: boolean
  status?: string
  isCancelled?: boolean
  isRescheduled?: boolean
}
