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

export const DUMMY_TRANSAKSI: TransaksiItem[] = []

export const getLatestTransaksi = (_limit = 4): TransaksiItem[] => {
  return []
}

export const getDefaultTransaksi = (_limit = 4): TransaksiItem[] => {
  return []
}

export const getTodayTransactions = (_dateKey?: string): TransaksiItem[] => {
  return []
}
