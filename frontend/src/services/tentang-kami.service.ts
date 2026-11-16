import apiClient from "@/lib/axios"

export interface NilaiItem {
  id: string
  judul: string
  deskripsi: string
  icon: "heart" | "star" | "shield" | "users" | "lightbulb" | "award"
}

export interface TentangKamiContent {
  hero: {
    tagline: string
    gallery: [string, string, string, string, string, string]
  }
  berkenalan: {
    judul: string
    paragraf1: string
    paragraf2: string
  }
  nilai: {
    judulSection: string
    subjudulSection: string
    items: NilaiItem[]
  }
  kenapaHadir: {
    judul: string
    fotoTim: string
    paragraf1: string
    paragraf2: string
    paragraf3: string
  }
  layananSection?: {
    judul?: string
    deskripsi?: string
  }
}

export const DEFAULT_TENTANG_KAMI: TentangKamiContent = {
  hero: {
    tagline: "Ruang yang kami bangun untuk menemani setiap langkah menuju pemahaman dan pertumbuhan diri.",
    gallery: [
      "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=400&q=80",
    ],
  },
  berkenalan: {
    judul: "Mari Berkenalan dengan Empathika.",
    paragraf1:
      "Empathika hadir sebagai ruang bagi siapa pun yang ingin lebih memahami diri, bertumbuh, dan menjalani setiap proses dengan lebih baik. Kami percaya bahwa kesehatan mental adalah bagian penting dari kesejahteraan hidup, sama pentingnya dengan kesehatan fisik. Melalui layanan psikologi, kami ingin membuat akses terhadap bantuan profesional terasa lebih dekat, nyaman, dan mudah dijangkau. Bersama para psikolog dan tenaga profesional, kami menghadirkan ruang yang aman untuk bercerita, belajar, dan menemukan langkah yang sesuai dengan kebutuhanmu.",
    paragraf2:
      "Setiap orang memiliki cerita dan perjalanan yang berbeda. Karena itu, Empathika hadir untuk menemani, bukan menghakimi. Kami ingin menjadi bagian dari perjalananmu dalam memahami diri, menghadapi berbagai proses, dan tumbuh menjadi versi diri yang lebih baik. Bagi kami, mendapatkan bantuan bukanlah tanda kelemahan, melainkan sebuah langkah untuk lebih peduli pada diri sendiri dan menjalani kehidupan dengan lebih baik.",
  },
  nilai: {
    judulSection: "Nilai yang Kami Bawa",
    subjudulSection:
      "Kami berpegang teguh pada nilai-nilai ini dalam setiap langkah perjalanan untuk mendukung kesejahteraan mental Anda.",
    items: [
      {
        id: "empati",
        judul: "Empati",
        deskripsi: "Mendengarkan tanpa menghakimi dan memahami potensi diri Anda sepenuhnya.",
        icon: "heart",
      },
      {
        id: "profesional",
        judul: "Profesional",
        deskripsi: "Tenaga ahli klinis berlisensi dengan standar dan peran kompetensi yang tinggi.",
        icon: "star",
      },
      {
        id: "privasi",
        judul: "Privasi Terjaga",
        deskripsi: "Kerahasiaan data setiap orang dan cerita Anda adalah prioritas mutlak kami.",
        icon: "shield",
      },
      {
        id: "solutif",
        judul: "Solutif Aktif",
        deskripsi: "Setiap orang bisa menangani dan mengatasi masalah secara aktif dan solutif.",
        icon: "users",
      },
    ],
  },
  kenapaHadir: {
    judul: "Kenapa Empathika Hadir?",
    fotoTim: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80",
    paragraf1:
      "Sering kali, mencari bantuan psikologis bukanlah hal yang mudah. Rasa takut, stigma, keterbatasan akses, hingga kekhawatiran untuk bercerita membuat banyak orang memilih menyimpan semuanya sendiri.",
    paragraf2:
      "Empathika hadir dari kepedulian terhadap hal tersebut. Kami ingin menciptakan ruang yang terasa aman, nyaman, dan terbuka bagi siapa pun untuk mulai memahami dirinya dan mendapatkan bantuan yang dibutuhkan.",
    paragraf3:
      "Dengan memanfaatkan teknologi, Empathika menghadirkan layanan psikologi yang lebih mudah dijangkau dan dekat dengan keseharian. Karena mendapatkan bantuan seharusnya tidak terasa rumit, dan setiap orang berhak memiliki ruang untuk didengarkan.",
  },
  layananSection: {
    judul: "Ada untuk Setiap Langkahmu",
    deskripsi:
      "Kami menyediakan beragam layanan psikologi untuk menemani setiap fase kehidupan dan membantu memenuhi kebutuhanmu.",
  },
}

const STORAGE_KEY = "empathika_tentang_kami_content_cache"

export const tentangKamiService = {
  /**
   * Mengambil data publik Tentang Kami untuk pengunjung
   */
  getPublic: async (): Promise<TentangKamiContent> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: TentangKamiContent }>(
        "/admin/tentang-kami/public"
      )
      if (response.data?.success && response.data?.data) {
        const merged: TentangKamiContent = {
          ...DEFAULT_TENTANG_KAMI,
          ...response.data.data,
          hero: { ...DEFAULT_TENTANG_KAMI.hero, ...(response.data.data.hero || {}) },
          berkenalan: { ...DEFAULT_TENTANG_KAMI.berkenalan, ...(response.data.data.berkenalan || {}) },
          nilai: { ...DEFAULT_TENTANG_KAMI.nilai, ...(response.data.data.nilai || {}) },
          kenapaHadir: { ...DEFAULT_TENTANG_KAMI.kenapaHadir, ...(response.data.data.kenapaHadir || {}) },
          layananSection: {
            ...DEFAULT_TENTANG_KAMI.layananSection,
            ...(response.data.data.layananSection || {}),
          },
        }
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
          } catch {}
        }
        return merged
      }
    } catch {
      // Fallback ke cache localStorage jika ada
      if (typeof window !== "undefined") {
        try {
          const cached = localStorage.getItem(STORAGE_KEY)
          if (cached) {
            const parsed = JSON.parse(cached)
            return {
              ...DEFAULT_TENTANG_KAMI,
              ...parsed,
              hero: { ...DEFAULT_TENTANG_KAMI.hero, ...(parsed.hero || {}) },
              berkenalan: { ...DEFAULT_TENTANG_KAMI.berkenalan, ...(parsed.berkenalan || {}) },
              nilai: { ...DEFAULT_TENTANG_KAMI.nilai, ...(parsed.nilai || {}) },
              kenapaHadir: { ...DEFAULT_TENTANG_KAMI.kenapaHadir, ...(parsed.kenapaHadir || {}) },
              layananSection: {
                ...DEFAULT_TENTANG_KAMI.layananSection,
                ...(parsed.layananSection || {}),
              },
            }
          }
        } catch {}
      }
    }
    return DEFAULT_TENTANG_KAMI
  },

  /**
   * Mengambil data untuk halaman admin dashboard
   */
  getAdmin: async (): Promise<TentangKamiContent> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: TentangKamiContent }>(
        "/admin/tentang-kami"
      )
      if (response.data?.success && response.data?.data) {
        return {
          ...DEFAULT_TENTANG_KAMI,
          ...response.data.data,
          hero: { ...DEFAULT_TENTANG_KAMI.hero, ...(response.data.data.hero || {}) },
          berkenalan: { ...DEFAULT_TENTANG_KAMI.berkenalan, ...(response.data.data.berkenalan || {}) },
          nilai: { ...DEFAULT_TENTANG_KAMI.nilai, ...(response.data.data.nilai || {}) },
          kenapaHadir: { ...DEFAULT_TENTANG_KAMI.kenapaHadir, ...(response.data.data.kenapaHadir || {}) },
          layananSection: {
            ...DEFAULT_TENTANG_KAMI.layananSection,
            ...(response.data.data.layananSection || {}),
          },
        }
      }
    } catch {
      // Fallback jika API sedang offline
    }
    return DEFAULT_TENTANG_KAMI
  },

  /**
   * Memperbarui konten Tentang Kami dari dashboard admin
   */
  update: async (data: TentangKamiContent): Promise<TentangKamiContent> => {
    const response = await apiClient.put<{
      success: boolean
      message: string
      data: TentangKamiContent
    }>("/admin/tentang-kami", data)

    if (response.data?.success && response.data?.data) {
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data.data))
        } catch {}
      }
      return response.data.data
    }
    throw new Error(response.data?.message || "Gagal menyimpan perubahan")
  },
}

