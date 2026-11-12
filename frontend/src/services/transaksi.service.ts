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

export interface AdminTransaksiQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  clientId?: string
  all?: boolean
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export const transaksiService = {
  getMyTransaksi: () =>
    apiClient.get("/transaksi/me").then((r) => r.data),

  getById: (id: string) =>
    apiClient.get(`/transaksi/${id}`).then((r) => r.data),

  getAllAdmin: (params?: AdminTransaksiQueryParams) =>
    apiClient
      .get<{
        success: boolean
        data: any[]
        pagination?: PaginationMeta
      }>("/transaksi/admin", { params })
      .then((r) => r.data),

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
