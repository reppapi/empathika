import apiClient from "@/lib/axios"

export const transaksiService = {
  getMyTransaksi: () =>
    apiClient.get("/transaksi/me").then((r) => r.data),

  getById: (id: string) =>
    apiClient.get(`/transaksi/${id}`).then((r) => r.data),

  getAllAdmin: () =>
    apiClient.get<{ success: boolean; data: any[] }>("/transaksi/admin").then((r) => r.data),

  processRefund: (transaksiId: string, payload: { alasan: string }) =>
    apiClient.post(`/transaksi/${transaksiId}/refund`, payload).then((r) => r.data),
}

