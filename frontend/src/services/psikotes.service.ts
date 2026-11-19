/** Service API client untuk katalog, booking/tiket, submit tes, dan admin psikotes. */
import apiClient from "@/lib/axios"

export interface PaketPsikotesApiResponse {
  id: string
  judul: string
  jenis_akses: "GRATIS" | "BERBAYAR"
  harga: string | number
  banner_url?: string | null
  tentang_tes?: string | null
  status: "PUBLISHED" | "DRAFT"
  createdAt: string
  updatedAt: string
  alat_ukur?: {
    id: string
    kode: string
    nama: string
    kategori: string
    deskripsi?: string | null
    instruksi?: string
    instruksiSingkat?: string
    targetUsia?: string
    periode?: string
    pengembang?: string | null
    tahun?: string | null
    tujuan?: string | null
    targetResponden?: string | null
    referensi?: string | null
    rentangSkorTotal?: string | null
    cutoff?: string | null
    dimensiList?: Array<{
      nama: string
      deskripsi: string
      nomorSoal: number[]
      jumlahSoal: number
      skorMin: number
      skorMax: number
    }> | null
    aturanSkoring?: Array<{
      kelompok: string
      nomorSoal: number[]
      pembobotan: string
    }> | null
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
  }>
  statistik?: {
    total_peserta: number
    tes_selesai: number
    tes_sedang_berlangsung: number
  }
  _count?: {
    booking_psikotes: number
  }
}

export interface SubmitPsikotesPayload {
  jawaban: Array<{ id_soal: string; id_pilihan: string; teks_jawaban?: string | null }> | Record<string, string>
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
  peristiwa_lainnya?: string | null
  peristiwaLainnya?: string | null
  peristiwa_paling_mengganggu?: string | null
  peristiwaPalingMengganggu?: string | null
  choci_isian?: Record<string | number, string> | null
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
    tanggal_selesai: string
  }
}

export interface RekapJawabanItem {
  nomor: number
  pertanyaan: string
  jawaban: string
  label?: string | null
  skor: number
  id_soal?: string
  id_pilihan?: string
}

export interface ReviewPsikotesItem {
  id: string
  id_paket: string
  id_psikolog?: string | null
  is_claimed?: boolean
  claimed_at?: string | null
  is_stale_claim?: boolean
  kode_akses: string | null
  nama_paket: string
  nama_biro?: string | null
  is_biro?: boolean
  jenis_akses: string
  nama_peserta: string
  no_hp: string
  usia: number | null
  jenis_kelamin: string | null
  tanggal_pengerjaan: string
  batas_review?: string | null
  status_pengerjaan: "BELUM_MULAI" | "SEDANG_MENGERJAKAN" | "MENUNGGU_REVIEW" | "SELESAI"
  perlu_review_psikolog: boolean
  catatan_psikolog?: string | null
  rekomendasi_psikolog?: string | null
  draft_saved_at?: string | null
  tanggal_review?: string | null
  psikolog?: {
    id: string
    id_account?: string | null
    nama: string
    kategori?: string
    foto?: string | null
  } | null
  total_skor?: number | null
  detail_skor?: any
}

export interface ReviewPsikotesListResponse {
  summary: {
    total: number
    menunggu_review: number
    kolam_bersama: number
    sedang_ditelaah: number
    selesai_review: number
  }
  items: ReviewPsikotesItem[]
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

  verifyTicket: (payload: { kode_akses: string; no_telepon: string; id_paket?: string }) =>
    apiClient
      .post<{
        success: boolean
        message: string
        data: {
          booking_id: string
          access_token?: string
          kode_akses: string
          status_pengerjaan: "BELUM_MULAI" | "SEDANG_MENGERJAKAN" | "MENUNGGU_REVIEW" | "SELESAI" | string
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
            catatan_psikolog?: string | null
            rekomendasi_psikolog?: string | null
            draft_saved_at?: string | null
            tanggal_review?: string | null
          }
          psikolog?: {
            id: string
            nama_gelar: string
            kategori?: string
            foto?: string | null
          } | null
          rekap_jawaban?: RekapJawabanItem[]
          total_jawaban?: number
          snapshot_jawaban?: any
        }
      }>(`/psikotes/booking/${bookingId}/hasil`, {
        params: accessToken ? { token: accessToken } : undefined,
      })
      .then((r) => r.data),

  getReviewList: (params?: { status?: string; search?: string; page?: number; limit?: number }) =>
    apiClient
      .get<{
        success: boolean
        message: string
        data: ReviewPsikotesListResponse
      }>("/psikotes/review-list", { params })
      .then((r) => r.data),

  submitReview: (
    bookingId: string,
    payload: {
      catatan_psikolog: string
      rekomendasi_psikolog?: string | null
      id_psikolog?: string | null
      is_draft?: boolean
    }
  ) =>
    apiClient
      .post<{
        success: boolean
        message: string
        data: any
      }>(`/psikotes/booking/${bookingId}/review`, payload)
      .then((r) => r.data),

  claimReviewTicket: (bookingId: string) =>
    apiClient
      .post<{
        success: boolean
        message: string
        data: {
          id: string
          status_pengerjaan: string
          is_claimed: boolean
          claimed_by: any
          claimed_at: string
        }
      }>(`/psikotes/booking/${bookingId}/claim`)
      .then((r) => r.data),

  releaseReviewTicket: (bookingId: string) =>
    apiClient
      .post<{
        success: boolean
        message: string
        data: {
          id: string
          status_pengerjaan: string
          is_claimed: boolean
          claimed_by: null
          message: string
        }
      }>(`/psikotes/booking/${bookingId}/release`)
      .then((r) => r.data),
}


