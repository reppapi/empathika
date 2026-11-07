import api from "@/lib/axios"

export interface PublicBiroProfile {
  id: string
  nama_biro: string
  slug: string
  alamat: string | null
  deskripsi: string | null
  no_telepon: string | null
  website_url: string | null
  logoURI: string | null
  status: string
  owner: {
    nama: string
    email: string
    no_telepon: string | null
  }
  statistik: {
    total_psikolog: number
    total_layanan: number
    total_klien_terdaftar: number
  }
}

export interface PublicBiroPsikolog {
  id: string
  nama: string
  spesialisasi: string[]
  tingkat_pendidikan: string
  rating: number
  pengalaman_tahun: number
  foto_profil: string | null
  tipe_afiliasi: "INTERNAL_BIRO" | "MITRA_EMPATHIKA"
  jadwal_terdekat?: any[]
}

export interface PublicBiroLayanan {
  id: string
  judul: string
  deskripsi: string
  kategori: string
  harga: number
  metode: string
  durasi_menit: number
  tipe_kepemilikan: "KHUSUS_BIRO" | "LAYANAN_GLOBAL_EMPATHIKA"
}

export const biroPublicService = {
  getProfile: async (slug: string) => {
    const res = await api.get<{ success: boolean; data: PublicBiroProfile }>(`/biro/public/${slug}`)
    return res.data
  },

  getPsikolog: async (slug: string, params?: { search?: string; kategori?: string; spesialisasi?: string }) => {
    const res = await api.get<{ success: boolean; data: PublicBiroPsikolog[] }>(`/biro/public/${slug}/psikolog`, {
      params,
    })
    return res.data
  },

  getPsikologDetail: async (slug: string, psikologId: string) => {
    const res = await api.get<{ success: boolean; data: any }>(`/biro/public/${slug}/psikolog/${psikologId}`)
    return res.data
  },

  getLayanan: async (slug: string, params?: { kategori?: string }) => {
    const res = await api.get<{ success: boolean; data: PublicBiroLayanan[] }>(`/biro/public/${slug}/layanan`, {
      params,
    })
    return res.data
  },

  getJadwal: async (slug: string, params?: { tanggal?: string; id_psikolog?: string; tipe_jadwal?: string }) => {
    const res = await api.get<{ success: boolean; data: any[] }>(`/biro/public/${slug}/jadwal-tersedia`, {
      params,
    })
    return res.data
  },

  createBooking: async (slug: string, data: any) => {
    const res = await api.post<{ success: boolean; data: any }>(`/biro/public/${slug}/booking`, data)
    return res.data
  },

  getBookingStatus: async (slug: string, kodePesanan: string) => {
    const res = await api.get<{ success: boolean; data: any }>(`/biro/public/${slug}/booking/${kodePesanan}`)
    return res.data
  },

  sendContact: async (slug: string, data: { nama: string; email: string; no_telepon?: string; pesan: string }) => {
    const res = await api.post<{ success: boolean; data: any }>(`/biro/public/${slug}/kontak`, data)
    return res.data
  },
}

// ── Admin Biro Service (untuk dashboard admin Empathika) ──────────────────────
export interface BiroAccountData {
  id: string
  nama: string
  email: string
  role: string
  no_telepon?: string | null
  aktif: boolean
  accountAktif: boolean
  tokenAktivasi?: string | null
  tokenExpiredAt?: string | null
  linkMasihBerlaku?: boolean
  canGenerateLink?: boolean
  owned_biro?: {
    id: string
    nama_biro: string
    slug: string
    status: string
    logoURI?: string | null
    warna_tema?: string | null
    alamat?: string | null
    deskripsi?: string | null
    no_telepon?: string | null
  }[]
  createdAt: string
  updatedAt?: string
}

export interface CreateBiroPayload {
  nama: string
  slug: string
  email: string
  noTelepon?: string
  alamat?: string
  deskripsi?: string
  warnaIdentitas?: string
  logoURI?: string
  tokenAktivasi?: string
  tokenExpiredAt?: string
}

export interface UpdateBiroPayload {
  nama?: string
  slug?: string
  email?: string
  noTelepon?: string | null
  alamat?: string | null
  deskripsi?: string | null
  warnaIdentitas?: string | null
  logoURI?: string | null
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING"
}

export const biroAdminService = {
  /** Ambil semua akun Biro (untuk daftar di halaman admin) */
  getList: () =>
    api.get<{ success: boolean; data: BiroAccountData[] }>("/biro/accounts").then((r) => r.data),

  /** Ambil detail satu akun Biro berdasarkan accountId */
  getById: (accountId: string) =>
    api.get<{ success: boolean; data: BiroAccountData }>(`/biro/admin/${accountId}`).then((r) => r.data),

  /** Admin membuat akun Biro baru */
  createBiro: (payload: CreateBiroPayload) =>
    api.post<{ success: boolean; data: BiroAccountData }>("/biro/admin/create", payload).then((r) => r.data),

  /** Admin memperbarui profil Biro */
  updateBiro: (accountId: string, payload: UpdateBiroPayload) =>
    api.put<{ success: boolean }>(`/biro/admin/${accountId}`, payload).then((r) => r.data),

  /** Mengambil data akun & profil biro yang sedang login */
  getMyAccount: () =>
    api.get<{ success: boolean; data: BiroAccountData }>("/biro/account").then((r) => r.data),
}
