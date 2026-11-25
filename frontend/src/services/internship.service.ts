import apiClient from "@/lib/axios"

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
  applyUrl: string // contoh: "https://empathika.id/daftar-internship"
  isOpen: boolean // true: Buka (tampil di client), false: Ditutup (tidak muncul di client)
  createdAt: string
  updatedAt?: string
}

export const STORAGE_KEY_INTERNSHIP = "empathika_internship_positions"

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
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(STORAGE_KEY_INTERNSHIP, JSON.stringify(res.data.data))
          } catch {}
        }
        return res.data.data
      }
    } catch (err: any) {
      console.warn("Gagal mengambil data internship publik dari database:", err?.message)
    }

    // Jika offline, coba ambil dari cache lokal terakhir (bukan dummy)
    if (typeof window !== "undefined") {
      try {
        const local = localStorage.getItem(STORAGE_KEY_INTERNSHIP)
        if (local) {
          const parsed = JSON.parse(local)
          if (Array.isArray(parsed)) {
            return parsed.filter((p) => p.isOpen)
          }
        }
      } catch {}
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
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(STORAGE_KEY_INTERNSHIP, JSON.stringify(res.data.data))
          } catch {}
        }
        return res.data.data
      }
    } catch (err: any) {
      console.warn("Gagal mengambil data internship admin dari database:", err?.message)
    }

    // Jika offline, coba ambil dari cache lokal terakhir (bukan dummy)
    if (typeof window !== "undefined") {
      try {
        const local = localStorage.getItem(STORAGE_KEY_INTERNSHIP)
        if (local) {
          const parsed = JSON.parse(local)
          if (Array.isArray(parsed)) {
            return parsed
          }
        }
      } catch {}
    }

    return []
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
}
