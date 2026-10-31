import apiClient from "@/lib/axios"

export interface CreateCheckoutInput {
  tipe: "KONSELING" | "EVENT" | "PSIKOTES"
  id_item: string
  nama: string
  email?: string
  no_telepon: string
  usia?: number
  jenis_kelamin?: string
  metode_layanan?: "ONLINE" | "OFFLINE"
  catatan?: string
  metode_pembayaran?: "TRANSFER_BANK" | "E_WALLET" | "QRIS"
  channel_pembayaran?: string
  success_redirect_url?: string
  failure_redirect_url?: string
}

export const transaksiService = {
  getMyTransaksi: () =>
    apiClient.get("/transaksi/me").then((r) => r.data),

  getById: (id: string) =>
    apiClient.get(`/transaksi/${id}`).then((r) => r.data),

  getAllAdmin: () =>
    apiClient.get<{ success: boolean; data: any[] }>("/transaksi/admin").then((r) => r.data),

  checkout: (data: CreateCheckoutInput) =>
    apiClient.post<{
      success: boolean
      message: string
      data: {
        transaksi: any
        booking: any
        invoiceUrl: string
        invoiceId: string
      }
    }>("/transaksi/checkout", data).then((r) => r.data),

  processRefund: (transaksiId: string, payload: { alasan: string }) =>
    apiClient.post(`/transaksi/${transaksiId}/refund`, payload).then((r) => r.data),
}
