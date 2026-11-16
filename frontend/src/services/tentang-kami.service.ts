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
    tagline: "Ruang yang hadir untuk menemani setiap langkah dalam memahami diri dan terus bertumbuh.",
    gallery: [
      "http://localhost:3001/uploads/9d944566-12e6-493c-900b-8b3575419f97.webp",
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80",
      "http://localhost:3001/uploads/6f72e553-dfe8-4a63-96c5-1b85dacb90d9.webp",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80",
      "http://localhost:3001/uploads/05db008d-3d99-40fb-8555-d8c3bb286440.webp",
    ],
  },
  berkenalan: {
    judul: "Mari Berkenalan dengan Empathika.",
    paragraf1:
      "Empathika hadir sebagai ruang bagi siapa pun untuk lebih memahami diri, bertumbuh, dan menjalani kehidupan dengan lebih baik. Kami percaya bahwa kesehatan mental merupakan bagian penting dari kesejahteraan hidup. Melalui berbagai layanan psikologi yang didukung oleh psikolog dan tenaga profesional, kami berupaya menghadirkan akses bantuan yang lebih dekat, nyaman, dan mudah dijangkau. Di sini, setiap orang memiliki ruang yang aman untuk bercerita, belajar, dan menemukan langkah yang sesuai dengan kebutuhannya.",
    paragraf2:
      "Kami memahami bahwa setiap orang memiliki cerita dan perjalanan yang berbeda. Karena itu, Empathika hadir untuk mendampingi tanpa menghakimi. Kami ingin menjadi bagian dari perjalananmu dalam mengenali diri, menghadapi berbagai tantangan, dan terus bertumbuh. Sebab, bagi kami, mencari bantuan bukanlah tanda kelemahan, melainkan bentuk kepedulian terhadap diri sendiri dan langkah awal untuk menjalani kehidupan yang lebih baik.",
  },
  nilai: {
    judulSection: "Nilai yang Kami Bawa",
    subjudulSection:
      "Nilai-nilai ini menjadi landasan kami dalam menghadirkan layanan psikologi yang peduli dan berkualitas.",
    items: [
      {
        id: "empati",
        judul: "Empati",
        deskripsi: "Mendengarkan tanpa menghakimi dan memahami potensi diri setiap individu.",
        icon: "heart",
      },
      {
        id: "profesional",
        judul: "Profesional",
        deskripsi: "Didukung tenaga profesional yang kompeten dan berpengalaman.",
        icon: "star",
      },
      {
        id: "privasi",
        judul: "Privasi Terjaga",
        deskripsi: "Menjaga kerahasiaan data dan cerita setiap individu sebagai prioritas utama kami.",
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
    fotoTim: "http://localhost:3001/uploads/bff0e7cd-4b6e-449a-83d2-39ccb787b5aa.webp",
    paragraf1:
      "Mencari bantuan psikologis bukanlah hal yang selalu mudah. Rasa takut, stigma, keterbatasan akses, hingga kekhawatiran untuk terbuka sering kali membuat seseorang memilih memendam apa yang sedang dirasakannya.",
    paragraf2:
      "Berangkat dari kepedulian tersebut, Empathika hadir untuk mendekatkan layanan psikologi melalui pemanfaatan teknologi. Kami ingin menghadirkan akses bantuan yang lebih mudah, nyaman, dan terbuka bagi siapa pun yang membutuhkannya.",
    paragraf3:
      "Kami percaya bahwa setiap orang berhak mendapatkan dukungan dan ruang untuk didengarkan tanpa merasa dihakimi. Karena memahami diri dan mencari bantuan merupakan bagian dari perjalanan untuk menjalani kehidupan yang lebih baik.",
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

