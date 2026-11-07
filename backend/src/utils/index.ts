export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .trim()
}

export function paginate(page: number, limit: number) {
  return {
    skip: (page - 1) * limit,
    take: limit,
  }
}

export function generateOrderId(prefix = 'KONS'): string {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `EMP-${prefix}-${yyyy}${mm}${dd}-${rand}`
}

export function generateTrxId(): string {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `TRX-${yyyy}${mm}${dd}-${rand}`
}

/**
 * Normalisasi format nomor telepon Indonesia menjadi format standar tunggal (diawali 628...)
 * Contoh konversi:
 * - 0812-3456-7890   -> 6281234567890
 * - +62 812-3456-789 -> 628123456789
 * - 81234567890      -> 6281234567890
 * - 620812345678     -> 62812345678
 * - 628123456789     -> 628123456789
 */
export function normalizePhoneNumber(phone?: string | null): string {
  if (!phone) return ''
  let cleaned = phone.replace(/\D/g, '')
  if (!cleaned) return ''

  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1)
  } else if (cleaned.startsWith('620')) {
    cleaned = '62' + cleaned.slice(3)
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned
  }

  return cleaned
}

