import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "IDR"): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency }).format(amount)
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("id-ID", options).format(new Date(date))
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
}

/**
 * Membangun URL website biro berbasis Model 2 (Subdomain).
 * Contoh di lokal: http://ugm.localhost:3000
 * Contoh di production: https://ugm.empathika.com
 */
export function getBiroWebsiteUrl(slug: string): string {
  if (!slug) return ""
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname
    const port = window.location.port ? `:${window.location.port}` : ""
    const protocol = window.location.protocol
    if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname === "127.0.0.1") {
      return `${protocol}//${slug}.localhost${port}`
    }
    if (hostname.endsWith(".lvh.me") || hostname === "lvh.me") {
      return `${protocol}//${slug}.lvh.me${port}`
    }
    // Production / Staging: gunakan root domain
    const parts = hostname.split(".")
    const rootDomain = parts.length >= 2 ? parts.slice(-2).join(".") : hostname
    return `${protocol}//${slug}.${rootDomain}`
  }
  return `https://${slug}.empathika.com`
}

/**
 * Membersihkan dan memformat Order ID / ID Tiket agar selalu tampil konsisten diawali EMP-
 * Menghapus awalan TIKET- jika ada dan menormalkan duplikasi prefix.
 */
export function formatOrderId(id?: string | null): string {
  if (!id) return "-"
  return String(id)
    .trim()
    .replace(/^TIKET-/i, "")
    .replace(/^W-EMP-EMP-/, "W-EMP-")
    .replace(/^EMP-EMP-/, "EMP-")
}
