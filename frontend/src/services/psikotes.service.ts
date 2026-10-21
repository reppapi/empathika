import apiClient from "@/lib/axios"

export interface PaketPsikotesApiResponse {
  id: string
  judul: string
  jenis_akses: "GRATIS" | "BERBAYAR"
  harga: string | number
  banner_url?: string | null
  deskripsi?: string | null
  status: "PUBLISHED" | "DRAFT"
  benefits?: string[] | null
  createdAt: string
  updatedAt: string
  soal_psikotes?: Array<{
    id: string
    id_paket: string
    urutan: number
    pertanyaan: string
    pilihan_jawaban: Array<{
      id: string
      id_soal: string
      label: string
      teks_jawaban: string
      bobot: number
    }>
  }>
  interpretasi_psikotes?: Array<{
    id: string
    id_paket: string
    min_skor: number
    max_skor: number
    grade: string
    judul: string
    deskripsi: string
    makna?: string | null
    tips?: any
  }>
  _count?: {
    booking_psikotes: number
  }
}

export const psikotesService = {
  getList: (params?: { search?: string; status?: string; jenis_akses?: string; include_draft?: boolean | string }) =>
    apiClient.get<{ success: boolean; message: string; data: PaketPsikotesApiResponse[] }>("/psikotes", { params }).then((r) => r.data),

  getById: (testId: string, params?: { allowDraft?: boolean | string }) =>
    apiClient.get<{ success: boolean; message: string; data: PaketPsikotesApiResponse }>(`/psikotes/${testId}`, { params }).then((r) => r.data),

  create: (data: any) =>
    apiClient.post<{ success: boolean; message: string; data: PaketPsikotesApiResponse }>("/psikotes", data).then((r) => r.data),

  update: (id: string, data: any) =>
    apiClient.put<{ success: boolean; message: string; data: PaketPsikotesApiResponse }>(`/psikotes/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/psikotes/${id}`).then((r) => r.data),

  submitJawaban: (testId: string, jawaban: Record<string, string>) =>
    apiClient.post(`/psikotes/${testId}/submit`, { jawaban }).then((r) => r.data),

  getHasil: (testId: string) =>
    apiClient.get(`/psikotes/${testId}/hasil`).then((r) => r.data),
}
