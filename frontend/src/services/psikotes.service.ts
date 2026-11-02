import apiClient from "@/lib/axios"

export interface PaketPsikotesApiResponse {
  id: string
  judul: string
  jenis_akses: "GRATIS" | "BERBAYAR"
  harga: string | number
  banner_url?: string | null
  deskripsi?: string | null
  status: "PUBLISHED" | "DRAFT"
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

export interface SubmitPsikotesPayload {
  jawaban: Array<{ id_soal: string; id_pilihan: string }> | Record<string, string>
  nama?: string
  no_telepon?: string
  email?: string
  klien?: {
    nama?: string
    no_telepon?: string
    email?: string
    usia?: number
    jenis_kelamin?: string
  }
  id_biro?: string
}

export interface SubmitPsikotesResult {
  id_booking: string
  id_paket: string
  judul_paket: string
  client: {
    id: string
    nama: string
    no_telepon?: string | null
  }
  total_skor: number
  hasil: {
    id: string
    grade: string
    judul: string
    deskripsi: string
    makna?: string | null
    tips?: any
    tanggal_selesai: string
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

  submitJawaban: (testId: string, payload: SubmitPsikotesPayload) =>
    apiClient.post<{ success: boolean; message: string; data: SubmitPsikotesResult }>(`/psikotes/${testId}/submit`, payload).then((r) => r.data),

  getHasil: (testId: string) =>
    apiClient.get(`/psikotes/${testId}/hasil`).then((r) => r.data),

  getPeserta: (params?: { search?: string; jenis_akses?: string; id_paket?: string; page?: number; limit?: number }) =>
    apiClient
      .get<{
        success: boolean
        message: string
        data: {
          summary: {
            total_peserta: number
            total_gratis: number
            total_berbayar: number
            total_selesai: number
          }
          items: Array<{
            id: string
            id_paket: string
            nama_paket: string
            jenis_akses: string
            harga: any
            nama_peserta: string
            no_hp: string
            usia: number | null
            jenis_kelamin: string | null
            tanggal: string
            status: string
            skor: string
            total_skor: number | null
            hasil: any
          }>
        }
      }>("/psikotes/peserta", { params })
      .then((r) => r.data),

  createBooking: (payload: {
    id_paket?: string
    testId?: string
    metode_pembayaran?: string
    channel_pembayaran?: string | null
    status_pembayaran?: string
    kode_transaksi?: string
    harga?: number
    nama?: string
    no_telepon?: string
    email?: string
    klien?: {
      nama?: string
      no_telepon?: string
      email?: string
      usia?: number
      jenis_kelamin?: string
    }
    id_biro?: string | null
  }) =>
    apiClient
      .post<{
        success: boolean
        message: string
        data: {
          booking: any
          transaksi: any
          paket: any
          client: any
        }
      }>("/psikotes/booking", payload)
      .then((r) => r.data),
}


