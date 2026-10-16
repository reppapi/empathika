/**
 * ewalletConfig.ts
 * Konfigurasi nomor tujuan E-Wallet yang dapat diubah oleh admin.
 * Data disimpan di localStorage agar sinkron antara tampilan admin dan user.
 */

export type EwalletId = "gopay" | "ovo" | "dana" | "shopeepay" | "linkaja"

export interface EwalletConfig {
  id: EwalletId
  name: string
  color: string
  defaultNomor: string
}

const LS_KEY = "empathika_ewallet_nomor"

export const EWALLET_DEFAULTS: EwalletConfig[] = [
  { id: "gopay",     name: "GoPay",     color: "#00AA13", defaultNomor: "0812-3456-7890" },
  { id: "ovo",       name: "OVO",       color: "#4C3494", defaultNomor: "0813-2345-6789" },
  { id: "dana",      name: "DANA",      color: "#118EEA", defaultNomor: "0811-9876-5432" },
  { id: "shopeepay", name: "ShopeePay", color: "#EE4D2D", defaultNomor: "0815-6543-2109" },
  { id: "linkaja",   name: "LinkAja",   color: "#E82529", defaultNomor: "0819-1234-5678" },
]

/** Baca semua nomor (merge default + override dari admin) */
export function getEwalletNomors(): Record<EwalletId, string> {
  const defaults = Object.fromEntries(
    EWALLET_DEFAULTS.map((e) => [e.id, e.defaultNomor])
  ) as Record<EwalletId, string>

  if (typeof window === "undefined") return defaults

  try {
    const stored = localStorage.getItem(LS_KEY)
    if (!stored) return defaults
    const parsed = JSON.parse(stored) as Partial<Record<EwalletId, string>>
    return { ...defaults, ...parsed }
  } catch {
    return defaults
  }
}

/** Simpan override nomor dari admin */
export function saveEwalletNomors(overrides: Partial<Record<EwalletId, string>>) {
  if (typeof window === "undefined") return
  localStorage.setItem(LS_KEY, JSON.stringify(overrides))
}

/** Dapatkan list e-wallet dengan nomor aktif (untuk komponen user) */
export function getActiveEwalletList() {
  const nomors = getEwalletNomors()
  return EWALLET_DEFAULTS.map((e) => ({
    id: e.id,
    name: e.name,
    color: e.color,
    nomor: nomors[e.id],
  }))
}
