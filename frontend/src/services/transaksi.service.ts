import apiClient from "@/lib/axios"

export const transaksiService = {
  getMyTransaksi: () =>
    apiClient.get("/transaksi/me").then((r) => r.data),

  getById: (id: string) =>
    apiClient.get(`/transaksi/${id}`).then((r) => r.data),

  createPayment: (bookingId: string, method: string) =>
    apiClient.post("/transaksi", { bookingId, method }).then((r) => r.data),
}

