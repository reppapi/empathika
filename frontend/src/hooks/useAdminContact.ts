"use client"

import { useState, useEffect, useCallback } from "react"
import { adminService } from "@/services/admin.service"

export interface AdminContactInfo {
  phone: string
  waNumber: string
  getWhatsAppUrl: (customMessage?: string) => string
}

const DEFAULT_PHONE = "0878-7878-5498"
const DEFAULT_WA_DIGITS = "6287878785498"

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

  const syncPhone = useCallback(() => {
    // Ambil dari backend profil admin publik terbaru
    adminService
      .getPublicProfile()
      .then((res) => {
        if (res?.data) {
          const p = res.data.no_telepon || res.data.noTelepon
          if (p && p !== "081234567890" && p !== "08123456789") {
            setPhone(p)
            try {
              const saved = localStorage.getItem("empathika_admin_profile")
              const existing = saved ? JSON.parse(saved) : {}
              localStorage.setItem(
                "empathika_admin_profile",
                JSON.stringify({ ...existing, noTelepon: p, no_telepon: p })
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
          }
        } catch {}
      })
  }, [])

  useEffect(() => {
    syncPhone()

    if (typeof window !== "undefined") {
      window.addEventListener("storage", syncPhone)
      window.addEventListener("focus", syncPhone)
      window.addEventListener("empathika_admin_profile_updated", syncPhone)
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", syncPhone)
        window.removeEventListener("focus", syncPhone)
        window.removeEventListener("empathika_admin_profile_updated", syncPhone)
      }
    }
  }, [syncPhone])

  const waNumber = formatToWhatsAppNumber(phone)

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
    getWhatsAppUrl,
  }
}

