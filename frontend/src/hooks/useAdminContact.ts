"use client"

import { useState, useEffect, useCallback } from "react"
import { adminService } from "@/services/admin.service"

export interface AdminContactInfo {
  phone: string
  waNumber: string
  displayPhone: string
  email: string
  getWhatsAppUrl: (customMessage?: string) => string
}

const DEFAULT_PHONE = "0878-7878-5498"
const DEFAULT_WA_DIGITS = "6287878785498"
const DEFAULT_EMAIL = "empathika889@gmail.com"

/** Format nomor telepon untuk tampilan rapi +62 xxx-xxxx-xxxx */
export function formatDisplayPhone(raw?: string | null): string {
  if (!raw) return "+62 878-7878-5498"
  const digits = raw.replace(/\D/g, "")
  if (!digits) return "+62 878-7878-5498"
  let standard = digits
  if (standard.startsWith("0")) standard = standard.slice(1)
  if (standard.startsWith("62")) standard = standard.slice(2)
  if (standard.length >= 9) {
    const p1 = standard.slice(0, 3)
    const p2 = standard.slice(3, 7)
    const p3 = standard.slice(7)
    return `+62 ${p1}-${p2}${p3 ? `-${p3}` : ""}`
  }
  return `+62 ${standard}`
}

/** Format nomor telepon apa pun menjadi format internasional WhatsApp berawalan 62 tanpa simbol */
export function formatToWhatsAppNumber(raw?: string | null): string {
  if (!raw) return DEFAULT_WA_DIGITS
  const digits = raw.replace(/\D/g, "")
  if (!digits || digits === "081234567890" || digits === "6281234567890" || digits === "08123456789") {
    return DEFAULT_WA_DIGITS
  }
  if (digits.startsWith("0")) {
    return "62" + digits.slice(1)
  }
  if (digits.startsWith("62")) {
    return digits
  }
  return "62" + digits
}

/**
 * Hook terpadu untuk mengambil nomor kontak WhatsApp Admin / Pengaturan Biro secara dinamis.
 * Jika admin memperbarui nomor di Pengaturan Biro / Profil Admin, seluruh tombol WhatsApp di web
 * otomatis menggunakan nomor terbaru.
 */
export function useAdminContact(): AdminContactInfo {
  const [phone, setPhone] = useState<string>(() => {
    // 1. Cek cache lokal profil admin (instan)
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("empathika_admin_profile")
        if (saved) {
          const parsed = JSON.parse(saved)
          const p = parsed.noTelepon || parsed.no_telepon
          if (p && p !== "081234567890" && p !== "08123456789") {
            return p
          }
        }
      } catch {}
    }
    return DEFAULT_PHONE
  })

  const [email, setEmail] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("empathika_admin_profile")
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed.email) return parsed.email
        }
      } catch {}
    }
    return DEFAULT_EMAIL
  })

  const syncContact = useCallback(() => {
    // Ambil dari backend profil admin publik terbaru
    adminService
      .getPublicProfile()
      .then((res) => {
        if (res?.data) {
          const p = res.data.no_telepon || res.data.noTelepon
          const e = res.data.email
          if (e) setEmail(e)
          if (p && p !== "081234567890" && p !== "08123456789") {
            setPhone(p)
            try {
              const saved = localStorage.getItem("empathika_admin_profile")
              const existing = saved ? JSON.parse(saved) : {}
              localStorage.setItem(
                "empathika_admin_profile",
                JSON.stringify({ ...existing, noTelepon: p, no_telepon: p, email: e || existing.email })
              )
            } catch {}
          } else {
            setPhone(DEFAULT_PHONE)
          }
        }
      })
      .catch(() => {
        // Fallback: cek cache lokal jika request gagal
        try {
          const saved = localStorage.getItem("empathika_admin_profile")
          if (saved) {
            const parsed = JSON.parse(saved)
            const p = parsed.noTelepon || parsed.no_telepon
            if (p) setPhone(p)
            if (parsed.email) setEmail(parsed.email)
          }
        } catch {}
      })
  }, [])

  useEffect(() => {
    syncContact()

    if (typeof window !== "undefined") {
      window.addEventListener("storage", syncContact)
      window.addEventListener("focus", syncContact)
      window.addEventListener("empathika_admin_profile_updated", syncContact)
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", syncContact)
        window.removeEventListener("focus", syncContact)
        window.removeEventListener("empathika_admin_profile_updated", syncContact)
      }
    }
  }, [syncContact])

  const waNumber = formatToWhatsAppNumber(phone)
  const displayPhone = formatDisplayPhone(phone)

  const getWhatsAppUrl = useCallback(
    (customMessage?: string) => {
      const msg = customMessage || "Halo Admin Empathika, saya ingin bertanya mengenai layanan."
      return `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`
    },
    [waNumber]
  )

  return {
    phone,
    waNumber,
    displayPhone,
    email,
    getWhatsAppUrl,
  }
}

