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

/**
 * Format digit angka nomor Indonesia menjadi kelompok chunks yang rapi (3-4-4-2)
 * Contoh: 81234567890 -> 812-3456-7890
 */
export function formatIndoPhoneChunks(digits: string): string {
  if (!digits) return ""
  const chunks: string[] = []
  if (digits.length > 0) chunks.push(digits.slice(0, 3))
  if (digits.length > 3) chunks.push(digits.slice(3, 7))
  if (digits.length > 7) chunks.push(digits.slice(7, 11))
  if (digits.length > 11) chunks.push(digits.slice(11, 14))
  return chunks.join("-")
}

/**
 * Ekstrak digit angka nomor ponsel Indonesia murni (tanpa awalan 620, 62, atau 0)
 * Contoh:
 * - "081271351421" -> "81271351421"
 * - "+62 812-3456-7890" -> "81234567890"
 */
export function extractIndoPhoneDigits(val?: string | null): string {
  if (!val) return ""
  let digits = String(val).replace(/\D/g, "")
  if (digits.startsWith("620")) {
    digits = digits.slice(3)
  } else if (digits.startsWith("62")) {
    digits = digits.slice(2)
  } else if (digits.startsWith("0")) {
    digits = digits.slice(1)
  }
  return digits.slice(0, 13)
}

/**
 * Standard format tampilan nomor telepon Indonesia: "+62 812-3456-7890"
 * Dipisahkan strip tiap 4 digit setelah awalan 3 digit kode operator.
 * Jika nomor kosong, mengembalikan fallback (default: "-")
 */
export function formatIndoPhoneWithPrefix(val?: string | null, fallback = "-"): string {
  if (!val || val === "—") return fallback
  const digits = extractIndoPhoneDigits(val)
  if (!digits) return fallback
  return `+62 ${formatIndoPhoneChunks(digits)}`
}
