"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { getSubdomainSlug } from "@/hooks/useTenant"
import { biroPublicService, type PublicBiroProfile } from "@/services/biro.service"

interface TenantContextValue {
  isBiro: boolean
  isSubdomain: boolean
  slug: string
  biroPrefix: string
  biroProfile: PublicBiroProfile | null
  isLoadingProfile: boolean
  withBiro: (path: string) => string
}

const TenantContext = createContext<TenantContextValue>({
  isBiro: false,
  isSubdomain: false,
  slug: "",
  biroPrefix: "",
  biroProfile: null,
  isLoadingProfile: false,
  withBiro: (path) => path,
})

interface TenantProviderProps {
  children: React.ReactNode
  initialSlug?: string | null
  initialThemeColor?: string | null
  initialProfile?: PublicBiroProfile | null
}

export function TenantProvider({
  children,
  initialSlug = null,
  initialThemeColor = null,
  initialProfile = null,
}: TenantProviderProps) {
  const [subdomainSlug, setSubdomainSlug] = useState<string | null>(() => {
    if (initialSlug) return initialSlug
    return getSubdomainSlug()
  })
  const [biroProfile, setBiroProfile] = useState<PublicBiroProfile | null>(initialProfile)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)

  useEffect(() => {
    const detected = getSubdomainSlug()
    if (detected && detected !== subdomainSlug) {
      setSubdomainSlug(detected)
    }
  }, [subdomainSlug])

  // Model 2 (Subdomain-based): satu-satunya penentu tenant
  const isSubdomain = !!subdomainSlug
  const isBiro = !!subdomainSlug
  const slug = subdomainSlug || ""
  const biroPrefix = ""

  // Hydration-safe fallback: ambil dari cache lokal hanya setelah mounting selesai
  useEffect(() => {
    if (!biroProfile && slug && typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(`biro_profile_${slug}`)
        if (cached) {
          setBiroProfile(JSON.parse(cached))
        }
      } catch (e) {}
    }
  }, [slug, biroProfile])

  // Fetch profil biro jika berada dalam konteks biro (subdomain)
  useEffect(() => {
    if (!slug) {
      setBiroProfile(null)
      return
    }

    let isMounted = true
    // Jangan tampilkan loading state jika profil sudah ada (dari SSR / cache) untuk mencegah layout shift
    if (!biroProfile || biroProfile.slug !== slug) {
      setIsLoadingProfile(true)
    }

    biroPublicService
      .getProfile(slug)
      .then((res) => {
        if (isMounted && res.success && res.data) {
          setBiroProfile(res.data)
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(`biro_profile_${slug}`, JSON.stringify(res.data))
              if (res.data.warna_tema) {
                localStorage.setItem(`biro_theme_${slug}`, res.data.warna_tema)
                document.cookie = `biro_theme_${slug}=${encodeURIComponent(res.data.warna_tema)}; path=/; max-age=2592000; SameSite=Lax`
              }
            } catch (e) {}
          }
        }
      })
      .catch((err) => {
        console.warn(`[Tenant] Tidak dapat memuat profil biro untuk slug '${slug}':`, err?.message)
      })
      .finally(() => {
        if (isMounted) setIsLoadingProfile(false)
      })

    return () => {
      isMounted = false
    }
  }, [slug])

  // Sinkronisasi otomatis saat ada pembaruan profil biro dari tab/jendela lain
  useEffect(() => {
    const handleProfileSync = () => {
      if (!slug || typeof window === "undefined") return
      try {
        const cached = localStorage.getItem(`biro_profile_${slug}`)
        if (cached) {
          const parsed = JSON.parse(cached)
          setBiroProfile(parsed)
        }
      } catch (e) {}
    }

    window.addEventListener("storage", handleProfileSync)
    window.addEventListener("biro_profile_updated", handleProfileSync)

    return () => {
      window.removeEventListener("storage", handleProfileSync)
      window.removeEventListener("biro_profile_updated", handleProfileSync)
    }
  }, [slug])

  // Sinkronisasi variabel warna tema biro ke CSS root browser
  useEffect(() => {
    if (typeof document !== "undefined") {
      // Jangan timpa / hapus tema jika pengguna berada di portal admin biro (/admin-biro)
      if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin-biro")) {
        return
      }

      const activeColor = biroProfile?.warna_tema || initialThemeColor

      if (isBiro && activeColor) {
        document.documentElement.style.setProperty("--biro-theme-color", activeColor)
        document.documentElement.setAttribute("data-biro-theme", "true")
        if (typeof window !== "undefined" && slug) {
          try {
            localStorage.setItem(`biro_theme_${slug}`, activeColor)
            document.cookie = `biro_theme_${slug}=${encodeURIComponent(activeColor)}; path=/; max-age=2592000; SameSite=Lax`
          } catch (e) {}
        }
      } else if (!isBiro) {
        document.documentElement.style.removeProperty("--biro-theme-color")
        document.documentElement.removeAttribute("data-biro-theme")
      }
    }
  }, [isBiro, biroProfile?.warna_tema, initialThemeColor, slug])

  const withBiro = (path: string): string => {
    if (!path) return "/"
    if (
      path.startsWith("http://") ||
      path.startsWith("https://") ||
      path.startsWith("mailto:") ||
      path.startsWith("tel:") ||
      path.startsWith("#")
    ) {
      return path
    }

    // Bersihkan prefix /biro/[slug] jika ada referensi string lama
    if (slug && path.startsWith(`/biro/${slug}`)) {
      const cleaned = path.replace(new RegExp(`^/biro/${slug}`), "")
      return cleaned || "/"
    }

    return path.startsWith("/") ? path : `/${path}`
  }

  return (
    <TenantContext.Provider
      value={{
        isBiro,
        isSubdomain,
        slug,
        biroPrefix,
        biroProfile,
        isLoadingProfile,
        withBiro,
      }}
    >
      {children}
    </TenantContext.Provider>
  )
}

export function useTenantContext() {
  return useContext(TenantContext)
}
