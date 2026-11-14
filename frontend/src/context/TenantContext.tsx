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

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [subdomainSlug, setSubdomainSlug] = useState<string | null>(null)
  const [biroProfile, setBiroProfile] = useState<PublicBiroProfile | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)

  useEffect(() => {
    setSubdomainSlug(getSubdomainSlug())
  }, [])

  // Model 2 (Subdomain-based): satu-satunya penentu tenant
  const isSubdomain = !!subdomainSlug
  const isBiro = !!subdomainSlug
  const slug = subdomainSlug || ""
  const biroPrefix = ""

  // Fetch profil biro jika berada dalam konteks biro (subdomain)
  useEffect(() => {
    if (!slug) {
      setBiroProfile(null)
      return
    }

    let isMounted = true
    setIsLoadingProfile(true)

    biroPublicService
      .getProfile(slug)
      .then((res) => {
        if (isMounted && res.success && res.data) {
          setBiroProfile(res.data)
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

  // Sinkronisasi variabel warna tema biro ke CSS root browser
  useEffect(() => {
    if (typeof document !== "undefined") {
      // Jangan timpa / hapus tema jika pengguna berada di portal admin biro (/admin-biro)
      if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin-biro")) {
        return
      }

      if (isBiro && biroProfile?.warna_tema) {
        document.documentElement.style.setProperty("--biro-theme-color", biroProfile.warna_tema)
        document.documentElement.setAttribute("data-biro-theme", "true")
      } else {
        document.documentElement.style.removeProperty("--biro-theme-color")
        document.documentElement.removeAttribute("data-biro-theme")
      }
    }
  }, [isBiro, biroProfile?.warna_tema])

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
