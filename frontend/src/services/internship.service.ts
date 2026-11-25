import apiClient from "@/lib/axios"

export interface InternshipQuestion {
  id: string
  label: string
  type: "text" | "textarea" | "url"
  required: boolean
}

export interface InternshipPosition {
  id: string
  judul: string
  divisi?: string
  durasi: string // contoh: "6 Month" atau "6 Bulan"
  lokasi: string // contoh: "WFA"
  workMode: string // contoh: "Remote" | "Hybrid" | "On-site"
  kompensasi: string // contoh: "Unpaid" | "Paid"
  deadline: string // contoh: "30/11/2026"
  deskripsi?: string
  responsibilities: string[]
  qualifications: string[]
  questions?: InternshipQuestion[]
  applyUrl: string // contoh: "/internship/apply/[id]"
  isOpen: boolean // true: Buka (tampil di client), false: Ditutup (tidak muncul di client)
  createdAt: string
  updatedAt?: string
}

export interface InternshipApplicationAnswer {
  questionId?: string
  question: string
  answer: string
}

export interface InternshipApplication {
  id: string
  positionId: string
  positionTitle: string
  nama: string
  email: string
  telepon: string
  universitas: string
  jurusan?: string | null
  semester?: string | null
  cvUrl: string
  portfolioUrl?: string | null
  jawaban: InternshipApplicationAnswer[]
  status: "MENUNGGU" | "REVIEW" | "DITERIMA" | "DITOLAK"
  catatanAdmin?: string | null
  createdAt: string
  updatedAt?: string
}

export const STORAGE_KEY_INTERNSHIP = "empathika_internship_positions"
export const STORAGE_KEY_INTERNSHIP_APPLICATIONS = "empathika_internship_applications"

export const internshipService = {
  /**
   * Mengambil posisi internship yang aktif/terbuka untuk halaman client (publik) langsung dari Database
   */
  getPublicPositions: async (): Promise<InternshipPosition[]> => {
    try {
      const res = await apiClient.get<{ success: boolean; data: InternshipPosition[] }>(
        "/admin/internship/public"
      )
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data
      }
    } catch (err: any) {
      console.warn("Gagal mengambil data internship publik dari database:", err?.message)
    }

    return []
  },

  /**
   * Mengambil seluruh posisi internship untuk halaman Admin langsung dari Database
   */
  getAllPositions: async (): Promise<InternshipPosition[]> => {
    try {
      const res = await apiClient.get<{ success: boolean; data: InternshipPosition[] }>(
        "/admin/internship"
      )
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data
      }
    } catch (err: any) {
      console.warn("Gagal mengambil data internship admin dari database:", err?.message)
    }

    return []
  },

  /**
   * Mengambil detail satu posisi internship berdasarkan ID
   */
  getPositionById: async (id: string): Promise<InternshipPosition | null> => {
    try {
      const res = await apiClient.get<{ success: boolean; data: InternshipPosition }>(
        `/admin/internship/public/${id}`
      )
      if (res.data?.success && res.data.data) {
        return res.data.data
      }
    } catch (err: any) {
      console.warn("Gagal mengambil posisi dari endpoint publik:", err?.message)
    }

    return null
  },

  /**
   * Menambahkan posisi baru langsung ke Database
   */
  createPosition: async (
    data: Omit<InternshipPosition, "id" | "createdAt" | "updatedAt">
  ): Promise<InternshipPosition[]> => {
    try {
      await apiClient.post<{ success: boolean; data: InternshipPosition }>(
        "/admin/internship",
        data
      )
    } catch (err: any) {
      console.error("Gagal menambahkan posisi internship ke database:", err)
      throw new Error(err.response?.data?.message || err.message || "Gagal menyimpan ke database")
    }

    // Ambil data terbaru langsung dari database
    const fresh = await internshipService.getAllPositions()
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("empathika_internship_updated", { detail: fresh }))
    }
    return fresh
  },

  /**
   * Memperbarui posisi yang ada di Database
   */
  updatePosition: async (
    id: string,
    updates: Partial<Omit<InternshipPosition, "id" | "createdAt">>
  ): Promise<InternshipPosition[]> => {
    try {
      await apiClient.put<{ success: boolean; data: InternshipPosition }>(
        `/admin/internship/${id}`,
        updates
      )
    } catch (err: any) {
      console.error("Gagal memperbarui posisi internship di database:", err)
      throw new Error(err.response?.data?.message || err.message || "Gagal memperbarui di database")
    }

    const fresh = await internshipService.getAllPositions()
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("empathika_internship_updated", { detail: fresh }))
    }
    return fresh
  },

  /**
   * Toggle status buka/tutup posisi langsung di Database
   */
  toggleStatus: async (id: string): Promise<InternshipPosition[]> => {
    try {
      await apiClient.patch<{ success: boolean; data: InternshipPosition }>(
        `/admin/internship/${id}/toggle`
      )
    } catch (err: any) {
      console.error("Gagal mengubah status posisi di database:", err)
      throw new Error(err.response?.data?.message || err.message || "Gagal mengubah status di database")
    }

    const fresh = await internshipService.getAllPositions()
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("empathika_internship_updated", { detail: fresh }))
    }
    return fresh
  },

  /**
   * Menghapus posisi langsung dari Database
   */
  deletePosition: async (id: string): Promise<InternshipPosition[]> => {
    try {
      await apiClient.delete<{ success: boolean; message: string }>(
        `/admin/internship/${id}`
      )
    } catch (err: any) {
      console.error("Gagal menghapus posisi di database:", err)
      throw new Error(err.response?.data?.message || err.message || "Gagal menghapus dari database")
    }

    const fresh = await internshipService.getAllPositions()
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("empathika_internship_updated", { detail: fresh }))
    }
    return fresh
  },

  /**
   * Sinkronisasi daftar posisi (bulk) ke Database
   */
  savePositions: async (positions: InternshipPosition[]): Promise<InternshipPosition[]> => {
    try {
      const res = await apiClient.put<{ success: boolean; data: InternshipPosition[] }>(
        "/admin/internship",
        { positions }
      )
      if (res.data?.success && Array.isArray(res.data.data)) {
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(STORAGE_KEY_INTERNSHIP, JSON.stringify(res.data.data))
            window.dispatchEvent(new CustomEvent("empathika_internship_updated", { detail: res.data.data }))
          } catch {}
        }
        return res.data.data
      }
    } catch (err: any) {
      console.error("Gagal sinkronisasi positions ke database:", err)
      throw new Error(err.response?.data?.message || err.message || "Gagal menyimpan ke database")
    }

    return positions
  },

  /**
   * Mengunggah berkas CV atau portofolio pelamar (Publik)
   */
  uploadFile: async (
    file: File
  ): Promise<{ url: string; filename: string; originalName: string; size: number }> => {
    const formData = new FormData()
    formData.append("file", file)
    const res = await apiClient.post<{
      success: boolean
      message: string
      data: { url: string; filename: string; originalName: string; size: number }
    }>("/admin/internship/upload-file", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    if (res.data?.success && res.data.data) {
      return res.data.data
    }
    throw new Error(res.data?.message || "Gagal mengunggah berkas")
  },

  /**
   * Mengirimkan formulir pendaftaran / lamaran magang (Publik)
   */
  applyInternship: async (
    data: Omit<InternshipApplication, "id" | "status" | "createdAt" | "updatedAt">
  ): Promise<InternshipApplication> => {
    const res = await apiClient.post<{ success: boolean; message: string; data: InternshipApplication }>(
      "/admin/internship/apply",
      data
    )
    if (res.data?.success && res.data.data) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("empathika_internship_updated"))
      }
      return res.data.data
    }
    throw new Error(res.data?.message || "Gagal mengirimkan formulir lamaran")
  },

  /**
   * Mengambil seluruh daftar pelamar internship untuk admin
   */
  getApplications: async (): Promise<InternshipApplication[]> => {
    try {
      const res = await apiClient.get<{ success: boolean; data: InternshipApplication[] }>(
        "/admin/internship/applications"
      )
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data
      }
    } catch (err: any) {
      console.warn("Gagal mengambil data pelamar internship dari database:", err?.message)
    }

    return []
  },

  /**
   * Mengambil detail satu pelamar internship
   */
  getApplicationById: async (id: string): Promise<InternshipApplication | null> => {
    try {
      const res = await apiClient.get<{ success: boolean; data: InternshipApplication }>(
        `/admin/internship/applications/${id}`
      )
      if (res.data?.success && res.data.data) {
        return res.data.data
      }
    } catch (err: any) {
      console.warn("Gagal mengambil detail pelamar internship dari database:", err?.message)
    }

    return null
  },

  /**
   * Memperbarui status lamaran (MENUNGGU / REVIEW / DITERIMA / DITOLAK)
   */
  updateApplicationStatus: async (
    id: string,
    status: InternshipApplication["status"],
    catatanAdmin?: string | null
  ): Promise<InternshipApplication> => {
    const res = await apiClient.patch<{ success: boolean; data: InternshipApplication }>(
      `/admin/internship/applications/${id}/status`,
      { status, catatanAdmin }
    )
    if (res.data?.success && res.data.data) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("empathika_internship_updated"))
      }
      return res.data.data
    }
    throw new Error("Gagal memperbarui status pelamar di database")
  },

  /**
   * Menghapus lamaran pelamar
   */
  deleteApplication: async (id: string): Promise<void> => {
    await apiClient.delete<{ success: boolean; message: string }>(
      `/admin/internship/applications/${id}`
    )
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("empathika_internship_updated"))
    }
  },
}
