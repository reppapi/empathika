"use client"

import { useState, useEffect } from "react"

export interface TenantInfo {
  isBiro: boolean
  isSubdomain: boolean
  slug: string
  biroPrefix: string
  withBiro: (path: string) => string
}

/**
 * Ekstrak slug biro dari hostname/subdomain browser.
 * Mendukung:
 * - ugm.localhost (:port) -> "ugm"
 * - ugm.lvh.me (:port) -> "ugm"
 * - ugm.empathika.com -> "ugm"
 */
export function getSubdomainSlug(): string | null {
  if (typeof window === "undefined") return null

  // Support query param ?biro=slug atau ?tenant=slug untuk kemudahan pengujian lokal
  if (window.location.search) {
    const params = new URLSearchParams(window.location.search)
    const paramBiro = params.get("biro") || params.get("tenant")
    if (paramBiro) return paramBiro.toLowerCase().trim()
  }

  const hostname = window.location.hostname.toLowerCase()

  // 1. *.localhost
  if (hostname.endsWith(".localhost")) {
    const parts = hostname.replace(/\.localhost$/, "").split(".")
    const sub = parts[parts.length - 1]
    if (sub && sub !== "www") return sub
    return null
  }

  // 2. *.lvh.me
  if (hostname.endsWith(".lvh.me")) {
    const parts = hostname.replace(/\.lvh.me$/, "").split(".")
    const sub = parts[parts.length - 1]
    if (sub && sub !== "www") return sub
    return null
  }

  // 3. *.empathika.com (production)
  const parts = hostname.split(".")
  if (parts.length > 2) {
    const sub = parts[0]
    if (sub && sub !== "www") return sub
  }

  return null
}

export function useTenant(): TenantInfo {
  const [subdomainSlug, setSubdomainSlug] = useState<string | null>(null)

  useEffect(() => {
    setSubdomainSlug(getSubdomainSlug())
  }, [])

  // Model 2 (Subdomain-based): satu-satunya akses website tenant
  const isSubdomain = !!subdomainSlug
  const isBiro = !!subdomainSlug
  const slug = subdomainSlug || ""
  const biroPrefix = ""

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

  return {
    isBiro,
    isSubdomain,
    slug,
    biroPrefix,
    withBiro,
  }
}

// Alias untuk menjaga backward compatibility dengan kode yang sudah memanggil useBiroPrefix
export const useBiroPrefix = useTenant
