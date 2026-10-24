import apiClient from "@/lib/axios"

export interface SubmitPengajuanDto {
  nama_instansi: string
  nama_pic: string
  email: string
  no_telepon: string
  kategori: string
  tipe_formulir?: string
  pesan?: string | null
  jawaban_detail?: Record<string, any> | null
}

export interface UpdatePengajuanStatusDto {
  status: "MENUNGGU" | "DIHUBUNGI" | "DISETUJUI" | "DITOLAK"
  pesan?: string | null
}

export interface ProgramKerjaSamaDto {
  id?: string
  slug: string
  title: string
  short_name: string
  deskripsi: string
  pelatihan_title?: string | null
  pelatihan_deskripsi?: string | null
  pelatihan_image?: string | null
  mitra_title?: string | null
  mitra_deskripsi?: string | null
  mitra_image?: string | null
  warna_tema?: string | null
  status?: "AKTIF" | "NONAKTIF"
  urutan?: number
}

export interface FormulirConfigDto {
  title?: string
  kategori_default?: string
  deskripsi?: string | null
  pertanyaan_khusus?: any[]
}

export const kerjaSamaService = {
  // ── 1. Pengajuan Kerja Sama (Leads) ─────────────────────────────────────────

  submitPengajuan: (data: SubmitPengajuanDto) =>
    apiClient.post("/kerja-sama/pengajuan", data).then((r) => r.data),

  getPengajuanList: (params?: {
    status?: string
    kategori?: string
    tipe_formulir?: string
    search?: string
    page?: number
    limit?: number
  }) =>
    apiClient.get("/kerja-sama/pengajuan", { params }).then((r) => r.data),

  getPengajuanById: (id: string) =>
    apiClient.get(`/kerja-sama/pengajuan/${id}`).then((r) => r.data),

  updatePengajuanStatus: (id: string, payload: UpdatePengajuanStatusDto) =>
    apiClient.patch(`/kerja-sama/pengajuan/${id}/status`, payload).then((r) => r.data),

  deletePengajuan: (id: string) =>
    apiClient.delete(`/kerja-sama/pengajuan/${id}`).then((r) => r.data),

  // ── 2. Program Kerja Sama ───────────────────────────────────────────────────

  getProgramList: () =>
    apiClient.get("/kerja-sama/program").then((r) => r.data),

  getProgramByIdOrSlug: (idOrSlug: string) =>
    apiClient.get(`/kerja-sama/program/${idOrSlug}`).then((r) => r.data),

  createProgram: (data: ProgramKerjaSamaDto) =>
    apiClient.post("/kerja-sama/program", data).then((r) => r.data),

  updateProgram: (id: string, data: Partial<ProgramKerjaSamaDto>) =>
    apiClient.put(`/kerja-sama/program/${id}`, data).then((r) => r.data),

  deleteProgram: (id: string) =>
    apiClient.delete(`/kerja-sama/program/${id}`).then((r) => r.data),

  // ── 3. Formulir Kerja Sama ──────────────────────────────────────────────────

  getFormulirList: () =>
    apiClient.get("/kerja-sama/formulir").then((r) => r.data),

  getFormulirBySlug: (slug: string) =>
    apiClient.get(`/kerja-sama/formulir/${slug}`).then((r) => r.data),

  updateFormulir: (slug: string, data: FormulirConfigDto) =>
    apiClient.put(`/kerja-sama/formulir/${slug}`, data).then((r) => r.data),
}
