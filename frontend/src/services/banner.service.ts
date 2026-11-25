import apiClient from "@/lib/axios"
import {
  BannerPromoItem,
  DefaultSlideConfig,
  DEFAULT_HERO_SLIDE,
  BANNER_STORAGE_KEY,
  getStoredBanners,
  saveStoredBanners,
  getActiveBanners,
} from "@/features/profile/types/banner"

export interface HeroBannersPayload {
  promoBanners: BannerPromoItem[]
  defaultSlide?: DefaultSlideConfig
}

export interface HeroBannersPublicResponse {
  activeBanners: BannerPromoItem[]
  defaultSlide: DefaultSlideConfig
}

export const bannerService = {
  /**
   * Mengambil banner aktif dan teks slide default untuk halaman publik beranda
   */
  getPublic: async (): Promise<HeroBannersPublicResponse> => {
    try {
      const response = await apiClient.get<{
        success: boolean
        data: {
          activeBanners: BannerPromoItem[]
          defaultSlide: DefaultSlideConfig
        }
      }>("/admin/banners/public")

      if (response.data?.success && response.data?.data) {
        return response.data.data
      }
    } catch {
      // Fallback ke localStorage jika backend belum terjangkau
    }

    const localBanners = getStoredBanners()
    return {
      activeBanners: getActiveBanners(localBanners),
      defaultSlide: DEFAULT_HERO_SLIDE,
    }
  },

  /**
   * Mengambil seluruh data banner (termasuk status nonaktif/terjadwal) dan pengaturan slide default untuk admin
   */
  getAdmin: async (): Promise<{
    promoBanners: BannerPromoItem[]
    defaultSlide: DefaultSlideConfig
  }> => {
    try {
      const response = await apiClient.get<{
        success: boolean
        data: {
          promoBanners: BannerPromoItem[]
          defaultSlide: DefaultSlideConfig
        }
      }>("/admin/banners")

      if (response.data?.success && response.data?.data) {
        // Sinkronkan ke localStorage
        saveStoredBanners(response.data.data.promoBanners)
        return response.data.data
      }
    } catch {
      // Fallback ke localStorage jika offline
    }

    return {
      promoBanners: getStoredBanners(),
      defaultSlide: DEFAULT_HERO_SLIDE,
    }
  },

  /**
   * Menyimpan data banner dan slide default dari dashboard admin
   */
  save: async (payload: HeroBannersPayload): Promise<{
    promoBanners: BannerPromoItem[]
    defaultSlide: DefaultSlideConfig
  }> => {
    // Simpan dulu secara optimistik di localStorage
    saveStoredBanners(payload.promoBanners)

    try {
      const response = await apiClient.put<{
        success: boolean
        message: string
        data: {
          promoBanners: BannerPromoItem[]
          defaultSlide: DefaultSlideConfig
        }
      }>("/admin/banners", payload)

      if (response.data?.success && response.data?.data) {
        saveStoredBanners(response.data.data.promoBanners)
        return response.data.data
      }
    } catch (e: any) {
      console.warn("Gagal menyimpan banner ke server backend, data tetap tersimpan di lokal:", e?.message)
    }

    return {
      promoBanners: payload.promoBanners,
      defaultSlide: payload.defaultSlide || DEFAULT_HERO_SLIDE,
    }
  },
}

