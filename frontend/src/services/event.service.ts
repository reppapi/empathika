import apiClient from "@/lib/axios"

export interface PaketBundlingItem {
  id?: string
  nama_paket: string
  kuota_tiket: number
  harga_paket: number
}

export interface EventItemApi {
  id: string
  judul: string
  jenis_event: "WEBINAR" | "WORKSHOP" | "SEMINAR"
  tipe_event: "ONLINE" | "OFFLINE"
  link_meet?: string | null
  link_wa?: string | null
  deskripsi: string
  tanggal: string
  jam_mulai: string
  durasi_menit: number
  lokasi: string | null
  kuota: number
  harga: number | string
  harga_coret?: number | string | null
  harga_bundling?: number | string | null
  kuota_tiket_bundling?: number | null
  nama_bundling?: string | null
  paket_bundling?: PaketBundlingItem[] | null
  banner_url: string | null
  nama_pembicara: string
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED" | "DRAFT"
  jumlah_booking?: number
  sisa_kuota?: number
  createdAt: string
  updatedAt: string
}

export interface CreateEventDto {
  judul: string
  jenis_event: "WEBINAR" | "WORKSHOP" | "SEMINAR"
  tipe_event: "ONLINE" | "OFFLINE"
  link_meet?: string | null
  link_wa: string
  deskripsi: string
  tanggal: string // YYYY-MM-DD
  jam_mulai: string // HH:MM
  durasi_menit: number
  lokasi?: string | null
  kuota: number
  harga: number
  harga_coret?: number | null
  harga_bundling?: number | null
  kuota_tiket_bundling?: number | null
  nama_bundling?: string | null
  paket_bundling?: PaketBundlingItem[] | null
  banner_url?: string | null
  nama_pembicara: string
  status?: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED" | "DRAFT"
}

export interface UpdateEventDto {
  judul?: string
  jenis_event?: "WEBINAR" | "WORKSHOP" | "SEMINAR"
  tipe_event?: "ONLINE" | "OFFLINE"
  link_meet?: string | null
  link_wa?: string | null
  deskripsi?: string
  tanggal?: string
  jam_mulai?: string
  durasi_menit?: number
  lokasi?: string | null
  kuota?: number
  harga?: number
  harga_coret?: number | null
  harga_bundling?: number | null
  kuota_tiket_bundling?: number | null
  nama_bundling?: string | null
  paket_bundling?: PaketBundlingItem[] | null
  banner_url?: string | null
  nama_pembicara?: string
  status?: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED" | "DRAFT"
}

export interface EventQueryParams {
  search?: string
  jenis_event?: "WEBINAR" | "WORKSHOP" | "SEMINAR"
  tipe_event?: "ONLINE" | "OFFLINE"
  status?: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED" | "DRAFT"
  page?: number
  limit?: number
}

// ==========================================
// DOKUMENTASI EVENT SELESAI
// ==========================================

export interface EventDokumentasiFotoApi {
  id: string
  foto_url: string
  urutan: number
  createdAt: string
}

export interface EventDokumentasiApi {
  id: string
  judul: string
  tanggal: string
  deskripsi: string
  createdAt: string
  updatedAt: string
  jumlah_foto: number
  thumbnail: string | null
  foto: EventDokumentasiFotoApi[]
}

export interface CreateEventDokumentasiDto {
  judul: string
  tanggal: string // YYYY-MM-DD
  deskripsi: string
  foto: Array<{ foto_url: string; urutan?: number }>
}

export interface UpdateEventDokumentasiDto {
  judul?: string
  tanggal?: string
  deskripsi?: string
  foto?: Array<{ foto_url: string; urutan?: number }>
}

export interface EventDokumentasiQueryParams {
  search?: string
  page?: number
  limit?: number
}

export const eventService = {
  // Regular Event
  getList: (params?: EventQueryParams) =>
    apiClient
      .get<{
        success: boolean
        data: EventItemApi[]
        meta: { total: number; page: number; limit: number; totalPages: number }
      }>("/event", { params })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<{ success: boolean; data: EventItemApi }>(`/event/${id}`).then((r) => r.data),

  create: (data: CreateEventDto) =>
    apiClient.post<{ success: boolean; data: EventItemApi }>("/event", data).then((r) => r.data),

  update: (id: string, data: UpdateEventDto) =>
    apiClient.put<{ success: boolean; data: EventItemApi }>(`/event/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete<{ success: boolean; data: null }>(`/event/${id}`).then((r) => r.data),

  // Dokumentasi Event Selesai
  getDokumentasiList: (params?: EventDokumentasiQueryParams) =>
    apiClient
      .get<{
        success: boolean
        data: EventDokumentasiApi[]
        pagination: { total: number; page: number; limit: number; totalPages: number }
      }>("/event/dokumentasi", { params })
      .then((r) => r.data),

  getDokumentasiById: (id: string) =>
    apiClient
      .get<{ success: boolean; data: EventDokumentasiApi }>(`/event/dokumentasi/${id}`)
      .then((r) => r.data),

  createDokumentasi: (data: CreateEventDokumentasiDto) =>
    apiClient
      .post<{ success: boolean; message: string; data: EventDokumentasiApi }>("/event/dokumentasi", data)
      .then((r) => r.data),

  updateDokumentasi: (id: string, data: UpdateEventDokumentasiDto) =>
    apiClient
      .put<{ success: boolean; message: string; data: EventDokumentasiApi }>(`/event/dokumentasi/${id}`, data)
      .then((r) => r.data),

  deleteDokumentasi: (id: string) =>
    apiClient
      .delete<{ success: boolean; message: string }>(`/event/dokumentasi/${id}`)
      .then((r) => r.data),
}
