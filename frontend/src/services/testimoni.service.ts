import apiClient from "@/lib/axios"

export interface TestimoniDetail {
  token: string
  is_submitted: boolean
  rating: number
  isi?: string | null
  submitted_at?: string | null
  clientName: string
  layanan: string
  psikolog: {
    nama: string
    foto: string
    kategori: string
  }
}

export interface TestimoniItem {
  id: string
  rating: number
  isi: string
  pemberi: string
  layanan: string
  tanggal: string
}

export const testimoniService = {
  generateLink: (bookingId: string) =>
    apiClient
      .post<{
        success: boolean
        data: {
          token: string
          is_submitted: boolean
          rating: number
          isi?: string | null
          namaKlien: string
          noTelepon: string
          namaPsikolog: string
        }
      }>("/testimoni/generate-link", { bookingId })
      .then((r) => r.data),

  getByToken: (token: string) =>
    apiClient
      .get<{
        success: boolean
        data: TestimoniDetail
      }>(`/testimoni/${token}`)
      .then((r) => r.data),

  submitTestimoni: (token: string, payload: { rating: number; isi: string }) =>
    apiClient
      .post<{
        success: boolean
        message: string
        data: any
      }>(`/testimoni/${token}`, payload)
      .then((r) => r.data),

  getByPsikologId: (psikologId: string) =>
    apiClient
      .get<{
        success: boolean
        data: TestimoniItem[]
      }>(`/testimoni/psikolog/${psikologId}`)
      .then((r) => r.data),
}
