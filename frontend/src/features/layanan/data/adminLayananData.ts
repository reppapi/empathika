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
  tarif_tenaga_ahli?: {
    psikolog?: { weekday: number | string; weekend: number | string }
    konselor?: { weekday: number | string; weekend: number | string }
    peer?: { weekday: number | string; weekend: number | string }
  } | null
}

export const INITIAL_ADMIN_LAYANAN: AdminLayananItem[] = [
  {
    id: 1,
    layanan: "Asesmen Minat Bakat",
    kategoriId: "05",
    metode: "Online/Offline",
    weekday: "Rp 400.000,00",
    weekend: "Rp 500.000,00",
    status: "Aktif",
    deskripsi:
      "Rangkaian asesmen komprehensif untuk memetakan potensi akademik, bakat karier, dan profil kecenderungan minat individu secara terstandar.",
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
  const nextId = current.length > 0 ? Math.max(...current.map((i) => Number(i.id) || 0)) + 1 : 1
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
