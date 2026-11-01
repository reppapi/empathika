import apiClient from "@/lib/axios"

export interface LayananApiItem {
  id: string
  nama: string
  kategori: string
  metode: string
  deskripsi: string
  harga_weekday: number
  harga_weekend: number
  banner_url?: string | null
  aktif: boolean
  createdAt?: string
  updatedAt?: string
}

export const layananService = {
  getList: (params?: { kategori?: string; aktif?: boolean; search?: string }) =>
    apiClient.get<{ success: boolean; data: LayananApiItem[] }>("/layanan", { params }).then((r) => r.data),

  getAll: (params?: { kategori?: string; aktif?: boolean; search?: string }) =>
    apiClient.get<{ success: boolean; data: LayananApiItem[] }>("/layanan", { params }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<{ success: boolean; data: LayananApiItem }>(`/layanan/${id}`).then((r) => r.data),

  getBySlug: (slug: string) =>
    apiClient.get(`/layanan/${slug}`).then((r) => r.data),

  create: (data: any) =>
    apiClient.post<{ success: boolean; message: string; data: LayananApiItem }>("/layanan", data).then((r) => r.data),

  update: (id: string, data: any) =>
    apiClient.put<{ success: boolean; message: string; data: LayananApiItem }>(`/layanan/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/layanan/${id}`).then((r) => r.data),
}
