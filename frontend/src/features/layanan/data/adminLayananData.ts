// frontend/src/features/layanan/data/adminLayananData.ts

export interface AdminLayananItem {
  id: number
  layanan: string
  kategoriId: string // "01" (Konsultasi), "03" (Workshop), "04" (Seminar), "05" (Asesmen)
  metode: string // "Online" | "Offline" | "Online/Offline"
  weekday: string
  weekend: string
  status: "Aktif" | "Nonaktif"
  deskripsi: string
  bannerUrl?: string
}

export const INITIAL_ADMIN_LAYANAN: AdminLayananItem[] = [
  // ── Konsultasi (01) ──
  {
    id: 1,
    layanan: "Psikolog",
    kategoriId: "01",
    metode: "Online/Offline",
    weekday: "Rp 350.000",
    weekend: "Rp 450.000",
    status: "Aktif",
    deskripsi:
      "Layanan konsultasi psikologi intensif bersama psikolog berlisensi untuk berbagai penanganan klinis, depresi, kecemasan, dan permasalahan kesehatan mental.",
    bannerUrl: "",
  },
  {
    id: 2,
    layanan: "Peer Konselor",
    kategoriId: "01",
    metode: "Online/Offline",
    weekday: "Rp 350.000",
    weekend: "Rp 450.000",
    status: "Aktif",
    deskripsi:
      "Layanan pendampingan santai bersama teman sebaya (peer counselor) yang terlatih untuk mendengarkan keluh kesah Anda tanpa penghakiman.",
    bannerUrl: "",
  },
  {
    id: 3,
    layanan: "Hipnoterapi",
    kategoriId: "01",
    metode: "Offline",
    weekday: "Rp 400.000",
    weekend: "Rp 500.000",
    status: "Aktif",
    deskripsi:
      "Terapi mendalam yang menyasar alam bawah sadar untuk membantu mengatasi trauma, kecemasan, fobia, hingga kebiasaan buruk yang sulit dihilangkan.",
    bannerUrl: "",
  },
  {
    id: 4,
    layanan: "Home Visit",
    kategoriId: "01",
    metode: "Offline",
    weekday: "Rp 500.000",
    weekend: "Rp 600.000",
    status: "Aktif",
    deskripsi:
      "Layanan spesial di mana psikolog kami akan langsung mengunjungi lokasi Anda demi kenyamanan, terutama bagi klien yang kesulitan mobilitas.",
    bannerUrl: "",
  },
  // ── Workshop (03) ──
  {
    id: 5,
    layanan: "Workshop Regulasi Emosi & Pelatihan Konselor Sebaya",
    kategoriId: "03",
    metode: "Online/Offline",
    weekday: "Rp 350.000",
    weekend: "Rp 450.000",
    status: "Aktif",
    deskripsi:
      "Pelatihan pembekalan intensif bagi siswa/mahasiswa/komunitas untuk mengelola stres dan menjadi pendengar aktif yang empatik.",
    bannerUrl: "",
  },
  // ── Asesmen (05) ──
  {
    id: 6,
    layanan: "Asesmen Minat Bakat",
    kategoriId: "05",
    metode: "Online/Offline",
    weekday: "Rp 400.000",
    weekend: "Rp 500.000",
    status: "Aktif",
    deskripsi:
      "Rangkaian asesmen komprehensif untuk memetakan potensi akademik, bakat karier, dan profil kecenderungan minat individu.",
    bannerUrl: "",
  },
  {
    id: 7,
    layanan: "Asesmen Kesiapan Sekolah",
    kategoriId: "05",
    metode: "Offline",
    weekday: "Rp 350.000",
    weekend: "Rp 450.000",
    status: "Aktif",
    deskripsi:
      "Pemeriksaan psikologis perkembangan anak untuk mengukur kematangan kognitif, motorik, dan emosional dalam memasuki jenjang sekolah.",
    bannerUrl: "",
  },
]

const STORAGE_KEY = "empathika_admin_layanan_data"

export function getStoredLayanan(): AdminLayananItem[] {
  if (typeof window === "undefined") return INITIAL_ADMIN_LAYANAN
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (e) {
    console.error("Failed to read admin layanan from localStorage", e)
  }
  return INITIAL_ADMIN_LAYANAN
}

export function saveStoredLayanan(items: AdminLayananItem[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (e) {
    console.error("Failed to save admin layanan to localStorage", e)
  }
}

export function addLayanan(item: Omit<AdminLayananItem, "id">): AdminLayananItem {
  const current = getStoredLayanan()
  const nextId = current.length > 0 ? Math.max(...current.map((i) => i.id)) + 1 : 1
  const created: AdminLayananItem = { ...item, id: nextId }
  const updated = [created, ...current]
  saveStoredLayanan(updated)
  return created
}

export function updateLayananById(
  id: number,
  patch: Partial<Omit<AdminLayananItem, "id">>
): AdminLayananItem | null {
  const current = getStoredLayanan()
  const idx = current.findIndex((i) => i.id === id)
  if (idx === -1) return null
  const updatedItem: AdminLayananItem = { ...current[idx], ...patch }
  current[idx] = updatedItem
  saveStoredLayanan([...current])
  return updatedItem
}

export function deleteLayananById(id: number): boolean {
  const current = getStoredLayanan()
  const filtered = current.filter((i) => i.id !== id)
  if (filtered.length === current.length) return false
  saveStoredLayanan(filtered)
  return true
}

export function getLayananById(id: number): AdminLayananItem | null {
  const current = getStoredLayanan()
  return current.find((i) => i.id === id) || null
}
