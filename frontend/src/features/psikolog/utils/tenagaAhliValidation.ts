import { KategoriTenaga } from "../types"

export interface ValidationErrors {
  email?: string
  noTelepon?: string
  noStr?: string
  noSipp?: string
  noSilp?: string
}

export interface TouchedFields {
  email?: boolean
  noTelepon?: boolean
  noStr?: boolean
  noSipp?: boolean
  noSilp?: boolean
}

/**
 * Validasi Email:
 * - Wajib diisi
 * - Format email valid
 * - Wajib mengandung '@gmail' (sesuai instruksi: kalau email gaada @gmail berarti salah)
 */
export function validateEmail(email: string): string | null {
  const val = email.trim()
  if (!val) {
    return "Email login wajib diisi"
  }
  const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!basicEmailRegex.test(val)) {
    return "Format email tidak valid (contoh: psikolog@gmail.com)"
  }
  if (!val.toLowerCase().includes("@gmail")) {
    return "Email harus menggunakan domain Gmail (harus mengandung @gmail.com)"
  }
  return null
}

/**
 * Validasi Nomor Telepon / WhatsApp:
 * - Wajib diisi
 * - Wajib diawali '08' (sesuai instruksi: kalau ga dari 08 berarti salah)
 * - Hanya berisi angka
 * - Panjang 10 - 14 digit
 */
export function validateNoTelepon(noTelepon: string): string | null {
  const val = noTelepon.trim()
  if (!val) {
    return "Nomor telepon / WhatsApp wajib diisi"
  }
  if (!val.startsWith("08")) {
    return "Nomor telepon harus diawali dengan '08' (contoh: 081234567890)"
  }
  if (!/^\d+$/.test(val)) {
    return "Nomor telepon hanya boleh berisi angka tanpa spasi atau karakter lain"
  }
  if (val.length < 10 || val.length > 14) {
    return "Nomor telepon harus terdiri dari 10 sampai 14 digit angka"
  }
  return null
}

/**
 * Validasi Nomor STR:
 * - Wajib diisi jika kategori adalah Psikolog
 * - Wajib diawali 'STR' (sesuai instruksi: nomor str harus diawali dengan itu)
 */
export function validateNoStr(noStr: string, kategori: KategoriTenaga): string | null {
  if (kategori !== "psikolog") {
    return null
  }
  const val = noStr.trim()
  if (!val) {
    return "Nomor STR wajib diisi untuk kategori Psikolog"
  }
  if (!val.toUpperCase().startsWith("STR")) {
    return "Nomor STR harus diawali dengan 'STR' (contoh: STR-8921-2023)"
  }
  return null
}

/**
 * Validasi Nomor SIPP:
 * - Untuk kategori Psikolog: Wajib diisi jika Nomor SILP tidak diisi
 * - Jika diisi, wajib diawali 'SIPP' (contoh: SIPP-1049-2024)
 */
export function validateNoSipp(
  noSipp?: string,
  kategori?: KategoriTenaga,
  noSilp?: string
): string | null {
  if (kategori !== "psikolog") {
    return null
  }
  const sippVal = (noSipp || "").trim()
  const silpVal = (noSilp || "").trim()

  // Jika SILP tidak diisi, maka SIPP wajib diisi
  if (!silpVal && !sippVal) {
    return "Nomor SIPP wajib diisi jika nomor SILP tidak diisi"
  }

  if (sippVal && !sippVal.toUpperCase().startsWith("SIPP")) {
    return "Nomor SIPP harus diawali dengan 'SIPP' (contoh: SIPP-1049-2024)"
  }
  return null
}

/**
 * Validasi Nomor SILP:
 * - Untuk kategori Psikolog: Wajib diisi jika Nomor SIPP tidak diisi
 * - Jika diisi, wajib diawali 'SILP' (contoh: SILP-2024-001)
 */
export function validateNoSilp(
  noSilp?: string,
  kategori?: KategoriTenaga,
  noSipp?: string
): string | null {
  if (kategori !== "psikolog") {
    return null
  }
  const silpVal = (noSilp || "").trim()
  const sippVal = (noSipp || "").trim()

  // Jika SIPP tidak diisi, maka SILP wajib diisi
  if (!sippVal && !silpVal) {
    return "Nomor SILP wajib diisi jika nomor SIPP tidak diisi"
  }

  if (silpVal && !silpVal.toUpperCase().startsWith("SILP")) {
    return "Nomor SILP harus diawali dengan 'SILP' (contoh: SILP-2024-001)"
  }
  return null
}

/**
 * Validasi gabungan form tenaga ahli
 */
export function validateTenagaAhliForm(data: {
  email: string
  noTelepon: string
  noStr: string
  noSipp: string
  noSilp?: string
  kategori: KategoriTenaga
}): ValidationErrors {
  const errors: ValidationErrors = {}

  const emailErr = validateEmail(data.email)
  if (emailErr) errors.email = emailErr

  const telpErr = validateNoTelepon(data.noTelepon)
  if (telpErr) errors.noTelepon = telpErr

  const strErr = validateNoStr(data.noStr, data.kategori)
  if (strErr) errors.noStr = strErr

  const sippErr = validateNoSipp(data.noSipp, data.kategori, data.noSilp)
  if (sippErr) errors.noSipp = sippErr

  const silpErr = validateNoSilp(data.noSilp, data.kategori, data.noSipp)
  if (silpErr) errors.noSilp = silpErr

  return errors
}
