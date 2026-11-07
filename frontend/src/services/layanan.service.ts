import apiClient from "@/lib/axios"

export interface LayananApiResponse {
  id: string
  nama: string
  kategori: string
  metode: string
  deskripsi: string
  harga_weekday: number | string
  harga_weekend: number | string
  tarif_tenaga_ahli?: {
    psikolog?: { weekday: number; weekend: number }
    konselor?: { weekday: number; weekend: number }
    peer?: { weekday: number; weekend: number }
  } | null
  banner_url?: string | null
  aktif: boolean
  createdAt?: string
  updatedAt?: string
}

export const layananService = {
  getAll: (params?: { kategori?: string; aktif?: boolean | string; search?: string }) =>
    apiClient
      .get<{ success: boolean; data: LayananApiResponse[] }>("/layanan", { params })
      .then((r) => r.data),

  getList: (params?: { kategori?: string; aktif?: boolean | string; search?: string }) =>
    apiClient
      .get<{ success: boolean; data: LayananApiResponse[] }>("/layanan", { params })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient
      .get<{ success: boolean; data: LayananApiResponse }>(`/layanan/${id}`)
      .then((r) => r.data),

  getBySlug: (slug: string) =>
    apiClient
      .get<{ success: boolean; data: LayananApiResponse }>(`/layanan/${slug}`)
      .then((r) => r.data),

  create: (data: any) =>
    apiClient
      .post<{ success: boolean; message: string; data: LayananApiResponse }>("/layanan", data)
      .then((r) => r.data),

  update: (id: string, data: any) =>
    apiClient
      .put<{ success: boolean; message: string; data: LayananApiResponse }>(`/layanan/${id}`, data)
      .then((r) => r.data),

  delete: (id: string) =>
    apiClient
      .delete<{ success: boolean; message: string }>(`/layanan/${id}`)
      .then((r) => r.data),
}
