// =====================================================================
// invoice.service.ts (Frontend)
// API calls untuk fitur invoice — diakses dari dashboard Admin.
// =====================================================================

import apiClient from "@/lib/axios"

export interface InvoiceApiData {
  id: string
  nomor: string
  id_transaksi: string
  nama_client: string
  no_wa_client: string | null
  nama_psikolog: string
  judul_layanan: string
  tanggal_sesi: string   // ISO string
  jenis_sesi: string
  harga: number
  metode_bayar: string
  tanggal_bayar: string | null
  tanggal_terbit: string
  status_kirim: "BELUM_DIKIRIM" | "DIKIRIM" | "GAGAL"
  sent_at: string | null
  sent_by_admin: string | null
  gagal_alasan: string | null
  // Extra fields dari endpoint getOrCreate
  pesan_wa?: string
  wa_valid?: boolean
  wa_normalized?: string | null
  wa_error?: string | null
}

export const invoiceService = {
  /**
   * Ambil (atau terbitkan secara lazy) invoice untuk transaksi.
   * Juga mengembalikan teks pesan WA dan info validasi nomor WA.
   */
  getOrCreate: (transaksiId: string) =>
    apiClient
      .get<{ success: boolean; data: InvoiceApiData }>(`/invoice/transaksi/${transaksiId}`)
      .then((r) => r.data.data),

  /**
   * Dapatkan URL wa.me dengan teks invoice ter-URL-encode.
   */
  getWaUrl: (transaksiId: string) =>
    apiClient
      .get<{
        success: boolean
        data: { url: string; nomor_tujuan: string; invoice: InvoiceApiData }
      }>(`/invoice/transaksi/${transaksiId}/wa-url`)
      .then((r) => r.data.data),

  /**
   * Tandai invoice sudah dikirim (dipanggil setelah admin buka link WA).
   */
  markSent: (transaksiId: string) =>
    apiClient
      .post<{ success: boolean; data: InvoiceApiData }>(
        `/invoice/transaksi/${transaksiId}/mark-sent`
      )
      .then((r) => r.data.data),
}
