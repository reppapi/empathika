import apiClient from "@/lib/axios"
import type { Psikolog, PsikologFilter } from "@/types/psikolog"

export interface JadwalSlotItem {
  id: string
  id_psikolog: string
  nama_psikolog?: string
  foto_psikolog?: string | null
  kategori_psikolog?: string
  spesialisasi?: string
  tarif_per_jam?: number
  tanggal: string
  jam_mulai: string
  jam_selesai: string
  label_waktu: string
  status: "TERSEDIA" | "SUDAH_DIBOOKING" | "TIDAK_TERSEDIA"
  tipe_jadwal: "KONSULTASI" | "ASESMEN"
}

export const psikologService = {
  getList: (filter?: PsikologFilter & { status?: string }) =>
    apiClient.get<Psikolog[]>("/psikolog", { params: filter }).then((r) => r.data),

  getBySlug: (slug: string) =>
    apiClient.get<Psikolog>(`/psikolog/${slug}`).then((r) => r.data),

  getJadwal: (psikologId: string) =>
    apiClient.get(`/psikolog/${psikologId}/jadwal`).then((r) => r.data),

  // ── Alur Slot Jadwal Konsultasi ──
  getJadwalTersedia: (params?: { tanggal?: string; id_psikolog?: string; tipe_jadwal?: string }) =>
    apiClient.get<JadwalSlotItem[]>("/psikolog/jadwal-tersedia", { params }).then((r) => r.data),

  getJadwalSaya: (params?: { start_date?: string; end_date?: string }) =>
    apiClient.get("/psikolog/me/jadwal", { params }).then((r) => r.data),

  createJadwalSlot: (payload: {
    id_psikolog?: string
    tanggal: string
    jam_mulai: string
    jam_selesai: string
    tipe_jadwal?: string
  }) => apiClient.post("/psikolog/me/jadwal-slots", payload).then((r) => r.data),

  deleteJadwalSlot: (slotId: string) =>
    apiClient.delete(`/psikolog/me/jadwal-slots/${slotId}`).then((r) => r.data),

  createPsikologBaru: (payload: any) =>
    apiClient.post("/psikolog/tambah", payload).then((r) => r.data),

  deletePsikolog: (id: string) =>
    apiClient.delete(`/psikolog/${id}`).then((r) => r.data),
}


