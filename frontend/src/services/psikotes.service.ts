/** Service API client untuk katalog, booking/tiket, submit tes, dan admin psikotes. */
import apiClient from "@/lib/axios"

export interface PaketPsikotesApiResponse {
  id: string
  judul: string
  jenis_akses: "GRATIS" | "BERBAYAR"
  harga: string | number
  banner_url?: string | null
  deskripsi?: string | null
  tentang_tes?: string | null
  status: "PUBLISHED" | "DRAFT"
  createdAt: string
  updatedAt: string
  alat_ukur?: {
    id: string
    kode: string
    nama: string
    kategori: string
    instruksi?: string
    instruksiSingkat?: string
    targetUsia?: string
    periode?: string
  } | null
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
    tips?: any
  }>
  _count?: {
    booking_psikotes: number
  }
}

export interface SubmitPsikotesPayload {
  jawaban: Array<{ id_soal: string; id_pilihan: string }> | Record<string, string>
  id_booking?: string
  bookingId?: string
  orderId?: string
  kode_akses?: string
  nama?: string
  no_telepon?: string
  email?: string
  peserta?: {
    nama_lengkap?: string
    jenis_kelamin?: string
    status_pernikahan?: string | null
    usia?: number | null
    pekerjaan?: string | null
    pendidikan?: string | null
    [key: string]: any
  }
  klien?: {
    nama?: string
    no_telepon?: string
    email?: string
    usia?: number
    jenis_kelamin?: string
  }
  id_biro?: string
  dampak_aktivitas?: number | null
}

export interface SubmitPsikotesResult {
  id_booking: string
  access_token?: string
  id_paket: string
  judul_paket: string
  client: {
    id: string
    nama: string
    no_telepon?: string | null
  }
  peserta?: {
    nama_lengkap: string
    usia?: number | null
    jenis_kelamin?: string | null
    kategori_peserta?: string | null
  }
  total_skor: number
  detail_skor?: any
  hasil: {
    id: string
    grade: string
    judul: string
    deskripsi: string
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

  verifyTicket: (payload: { kode_akses: string; no_telepon: string }) =>
    apiClient
      .post<{
        success: boolean
        message: string
        data: {
          booking_id: string
          access_token?: string
          kode_akses: string
          status_pengerjaan: "BELUM_MULAI" | "SELESAI"
          test_id: string
          judul_paket: string
          nama_pembeli: string
          peserta?: {
            nama_lengkap: string
            usia?: number | null
            jenis_kelamin?: string | null
          } | null
          hasil_tes?: {
            id: string
            total_skor: number
            tanggal_selesai: string
          } | null
          redirect_url: string
        }
      }>("/psikotes/verify-ticket", payload)
      .then((r) => r.data),

  getHasilByBooking: (bookingId: string, accessToken?: string | null) =>
    apiClient
      .get<{
        success: boolean
        message: string
        data: {
          id_booking: string
          id_paket: string
          kode_akses: string | null
          status_pengerjaan: string
          paket: PaketPsikotesApiResponse
          client: {
            id: string
            nama: string
            no_telepon?: string | null
            usia?: number | null
            jenis_kelamin?: string | null
          }
          peserta: {
            nama_lengkap: string
            no_telepon?: string | null
            usia?: number | null
            jenis_kelamin?: string | null
            tempat_lahir?: string | null
            tanggal_lahir?: string | null
            pendidikan?: string | null
            pekerjaan?: string | null
          }
          hasil: {
            id: string
            total_skor: number
            detail_skor: any
            tanggal_selesai: string
            grade?: string | null
            judul?: string | null
            deskripsi?: string | null
            tips?: any
          }
        }
      }>(`/psikotes/booking/${bookingId}/hasil`, {
        params: accessToken ? { token: accessToken } : undefined,
      })
      .then((r) => r.data),
}


