import apiClient from "@/lib/axios"

export const adminService = {
  getJadwal: (params?: { date?: string; layanan?: string; status?: string }) =>
    apiClient.get("/admin/jadwal", { params }).then((r) => r.data),

  createJadwalSlot: (payload: {
    id_psikolog: string
    tanggal: string
    jam_mulai: string
    jam_selesai: string
    tipe_jadwal?: string
  }) => apiClient.post("/admin/jadwal-slots", payload).then((r) => r.data),

  createSesiBaru: (payload: {
    id_psikolog: string
    id_layanan: string
    tanggal: string
    jam_mulai: string
    jam_selesai: string
    metode: "ONLINE" | "OFFLINE"
    deskripsi_trauma?: string
    klien: {
      nama: string
      no_telepon: string
      usia?: number
      jenis_kelamin?: string
    }
  }) => apiClient.post("/admin/sesi-baru", payload).then((r) => r.data),

  updateBookingStatus: (id: string, status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED") =>
    apiClient.patch(`/admin/booking/${id}/status`, { status }).then((r) => r.data),

  processRefund: (bookingId: string, payload: { alasan: string }) =>
    apiClient.post(`/admin/booking/${bookingId}/refund`, payload).then((r) => r.data),

  // Modul Profil Admin Utama
  getProfile: () => apiClient.get("/admin/profile").then((r) => r.data),

  updateProfile: (payload: {
    nama?: string
    email?: string
    no_telepon?: string | null
    noTelepon?: string | null
    alamat?: string | null
    link_maps?: string | null
    linkMaps?: string | null
    bio?: string | null
    foto?: string | null
    instagram?: string | null
    tiktok?: string | null
    youtube?: string | null
    linkedin?: string | null
    password?: string
  }) => apiClient.put("/admin/profile", payload).then((r) => r.data),

  getPublicProfile: () => apiClient.get("/admin/profile/public").then((r) => r.data),
}

