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
