// frontend/src/features/layanan/data/adminLayananData.ts

export interface AdminLayananItem {
  id: number | string
  layanan: string
  kategoriId: string // "01" (Konsultasi), "03" (Workshop), "04" (Seminar), "05" (Asesmen)
  metode: string // "Online" | "Offline" | "Online/Offline"
  weekday: string
  weekend: string
  status: "Aktif" | "Nonaktif"
  deskripsi: string
  bannerUrl?: string
  foto_kegiatan?: string[]
  manfaat?: string[]
  tarif_tenaga_ahli?: {
    psikolog?: { weekday: number | string; weekend: number | string }
    konselor?: { weekday: number | string; weekend: number | string }
    peer?: { weekday: number | string; weekend: number | string }
    manfaat?: string[]
    foto_kegiatan?: string[]
  } | null
  createdAt?: string
  updatedAt?: string
}

export const INITIAL_ADMIN_LAYANAN: AdminLayananItem[] = [
  {
    id: "ws-seft-01",
    layanan: "Workshop SEFT",
    kategoriId: "03",
    metode: "Online/Offline",
    weekday: "Kemitraan",
    weekend: "Kemitraan",
    status: "Aktif",
    deskripsi:
      "Workshop SEFT (Spiritual Emotional Freedom Technique) adalah program pengembangan diri dan terapi emosi yang membantu peserta mengelola emosi, meredakan stres, serta melepaskan beban batin secara mendalam melalui teknik yang mengintegrasikan psikologi energi, relaksasi emosi, dan pendekatan spiritualitas yang menenangkan.\n\nWorkshop ini dirancang secara praktis, aplikatif, dan interaktif. Peserta tidak hanya memahami konsep teoretis dan mengalami proses pelepasan emosi secara langsung, tetapi juga dilatih langkah demi langkah teknik SEFT agar dapat mempraktikkannya secara mandiri di rumah maupun lingkungan kerja. Seluruh sesi dipandu langsung oleh fasilitator berpengalaman dengan pendekatan yang empatik, aman, privat, serta menjunjung tinggi kode etik profesional.",
    bannerUrl:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    foto_kegiatan: [
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    id: "ws-peer-02",
    layanan: "Pelatihan & Workshop Konselor Sebaya",
    kategoriId: "03",
    metode: "Online/Offline",
    weekday: "Kemitraan",
    weekend: "Kemitraan",
    status: "Aktif",
    deskripsi:
      "Program pelatihan pembekalan komprehensif bagi siswa, mahasiswa, pendidik, dan komunitas untuk mengasah kepekaan sosial, keterampilan komunikasi suportif, serta kemampuan menjadi pendengar aktif dan konselor sebaya (peer helper) yang empatik tanpa menghakimi.\n\nPelatihan ini mengombinasikan pemahaman teori dasar konseling, studi kasus riil, role-play komunikasi, dan simulasi pendampingan teman sebaya. Peserta dibimbing langsung oleh psikolog profesional agar memiliki kesiapan mental, empati yang terarah, dan rasa tanggung jawab dalam mendampingi rekan di lingkungannya.",
    bannerUrl:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    foto_kegiatan: [
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    id: "sm-empathika-01",
    layanan: "Seminar Empathika",
    kategoriId: "04",
    metode: "Online/Offline",
    weekday: "Kemitraan",
    weekend: "Kemitraan",
    status: "Aktif",
    deskripsi:
      "Empathika menyelenggarakan program seminar sebagai ruang edukatif dan reflektif untuk meningkatkan pemahaman psikologis serta kesadaran diri dalam menghadapi berbagai dinamika kehidupan, baik personal, keluarga, maupun profesional.\n\nProgram dirancang secara interaktif dan aplikatif dengan materi yang mudah dipahami, memadukan psikoedukasi dengan sesi reflektif dan healing (SEFT) agar peserta dapat mengenali serta melepaskan beban emosional secara lebih mendalam.",
    bannerUrl:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    foto_kegiatan: [
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
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
        const hasWs = parsed.some((p: any) => p.kategoriId === "03" || p.kategori === "WORKSHOP")
        const hasSm = parsed.some((p: any) => p.kategoriId === "04" || p.kategori === "SEMINAR")
        if (!hasWs || !hasSm) {
          const defaultsToAdd = INITIAL_ADMIN_LAYANAN.filter(
            (init) => (!hasWs && init.kategoriId === "03") || (!hasSm && init.kategoriId === "04")
          )
          const merged = [...parsed, ...defaultsToAdd]
          saveStoredLayanan(merged)
          return merged
        }
        return parsed
      }
    }
  } catch (e) {
    console.error("Failed to read admin layanan from localStorage", e)
  }
  return INITIAL_ADMIN_LAYANAN
}

// Alias helper
export const getLayananList = getStoredLayanan

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
  const numericIds = current.map((i) => (typeof i.id === "number" ? i.id : parseInt(String(i.id).replace(/\D/g, ""), 10) || 0))
  const nextId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1
  const created: AdminLayananItem = { ...item, id: nextId }
  const updated = [created, ...current]
  saveStoredLayanan(updated)
  return created
}

export function updateLayananById(
  id: number | string,
  patch: Partial<Omit<AdminLayananItem, "id">>
): AdminLayananItem | null {
  const current = getStoredLayanan()
  const idx = current.findIndex((i) => String(i.id) === String(id))
  if (idx === -1) return null
  const updatedItem: AdminLayananItem = { ...current[idx], ...patch }
  current[idx] = updatedItem
  saveStoredLayanan([...current])
  return updatedItem
}

export function deleteLayananById(id: number | string): boolean {
  const current = getStoredLayanan()
  const filtered = current.filter((i) => String(i.id) !== String(id))
  if (filtered.length === current.length) return false
  saveStoredLayanan(filtered)
  return true
}

export function getLayananById(id: number | string): AdminLayananItem | null {
  const current = getStoredLayanan()
  return current.find((i) => String(i.id) === String(id)) || null
}
