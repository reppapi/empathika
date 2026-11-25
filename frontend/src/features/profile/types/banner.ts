export interface BannerPromoItem {
  id: string
  judul: string
  gambar: string
  linkTujuan: string
  aktif: boolean
  tanggalMulai?: string | null
  tanggalBerakhir?: string | null
  createdAt?: string
}

export interface DefaultSlideConfig {
  title: string
  subtitle: string
  link: string
}

export const DEFAULT_HERO_SLIDE: DefaultSlideConfig = {
  title: "Ruang Aman untuk Pulih Bersama Psikolog Profesional & Terpercaya",
  subtitle:
    "Kamu tidak harus memikul semuanya sendirian. Ceritakan apa yang kamu rasakan, mari temukan jalan keluar dan bertumbuh bersama Empathika.",
  link: "/konseling",
}

export interface HeroBannersData {
  promoBanners: BannerPromoItem[]
  defaultSlide: DefaultSlideConfig
}

export const BANNER_STORAGE_KEY = "empathika_hero_banners"

export function getStoredBanners(): BannerPromoItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(BANNER_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveStoredBanners(banners: BannerPromoItem[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(BANNER_STORAGE_KEY, JSON.stringify(banners))
    window.dispatchEvent(new Event("empathika_hero_banners_updated"))
    window.dispatchEvent(new Event("storage"))
  } catch (e) {
    console.error("Gagal menyimpan banner promosi ke storage:", e)
  }
}

/**
 * Mendapatkan string tanggal hari ini dalam format YYYY-MM-DD sesuai waktu lokal pengguna (WIB/WITA/WIT)
 */
export function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Filter banner yang sedang aktif dan berada dalam rentang tanggal berlaku
 */
export function getActiveBanners(banners: BannerPromoItem[]): BannerPromoItem[] {
  const todayStr = getLocalDateString()

  return banners.filter((b) => {
    if (!b.aktif) return false

    if (b.tanggalMulai) {
      const startStr = b.tanggalMulai.split("T")[0]
      if (todayStr < startStr) return false
    }

    if (b.tanggalBerakhir) {
      const endStr = b.tanggalBerakhir.split("T")[0]
      if (todayStr > endStr) return false
    }

    return true
  })
}

