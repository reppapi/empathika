/**
 * Utility functions for parsing and formatting date and time for Prisma PostgreSQL
 */

export function timeStringToDate(timeStr: string): Date {
  const parts = timeStr.split(':').map(Number)
  const hours = parts[0] || 0
  const minutes = parts[1] || 0
  // Standard Prisma @db.Time uses 1970-01-01
  return new Date(Date.UTC(1970, 0, 1, hours, minutes, 0, 0))
}

export function formatTimeToString(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const hours = String(d.getUTCHours()).padStart(2, '0')
  const minutes = String(d.getUTCMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export function parseDateString(dateStr: string): Date {
  // dateStr format: YYYY-MM-DD
  const parts = dateStr.split('-').map(Number)
  const year = parts[0]
  const month = parts[1] - 1
  const day = parts[2]
  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0))
}

export function formatDateToString(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Mengonversi tanggal dan jam sesi menjadi UTC Date absolut (disesuaikan dari WIB / UTC+7).
 */
export function getSessionDateTime(
  tanggal: Date | string,
  jamMulai: Date | string
): Date {
  const sessionDate = typeof tanggal === 'string' ? parseDateString(tanggal) : new Date(tanggal)
  const sessionTime = typeof jamMulai === 'string' ? timeStringToDate(jamMulai) : new Date(jamMulai)

  return new Date(
    Date.UTC(
      sessionDate.getUTCFullYear(),
      sessionDate.getUTCMonth(),
      sessionDate.getUTCDate(),
      sessionTime.getUTCHours() - 7,
      sessionTime.getUTCMinutes(),
      0,
      0
    )
  )
}

export type StatusKelayakanRefund = 'FULL_REFUND' | 'POTONGAN_30' | 'DITOLAK'

export interface HasilEvaluasiRefund {
  sessionDateTime: Date
  refundDeadlineH3: Date
  refundDeadline3Jam: Date
  hoursUntilSession: number
  kategori: StatusKelayakanRefund
  persenRefund: number
  persenPotongan: number
  alasanPenolakan?: string
}

/**
 * Menghitung kelayakan dan kalkulasi aturan refund baru:
 * - > H-3 (72 jam sebelum sesi): Refund 100% (potongan 0%)
 * - Antara H-3 sampai > 3 jam sebelum sesi: Refund 70% (potongan 30%)
 * - <= 3 jam sebelum sesi: Ditolak (0% refund)
 */
export function evaluateRefundEligibility(
  tanggal: Date | string,
  jamMulai: Date | string,
  now: number = Date.now()
): HasilEvaluasiRefund {
  const sessionDateTime = getSessionDateTime(tanggal, jamMulai)
  const diffMs = sessionDateTime.getTime() - now
  const hoursUntilSession = diffMs / (1000 * 60 * 60)

  const refundDeadlineH3 = new Date(sessionDateTime.getTime() - 72 * 60 * 60 * 1000)
  const refundDeadline3Jam = new Date(sessionDateTime.getTime() - 3 * 60 * 60 * 1000)

  if (hoursUntilSession > 72) {
    return {
      sessionDateTime,
      refundDeadlineH3,
      refundDeadline3Jam,
      hoursUntilSession,
      kategori: 'FULL_REFUND',
      persenRefund: 100,
      persenPotongan: 0,
    }
  }

  if (hoursUntilSession > 3) {
    return {
      sessionDateTime,
      refundDeadlineH3,
      refundDeadline3Jam,
      hoursUntilSession,
      kategori: 'POTONGAN_30',
      persenRefund: 70,
      persenPotongan: 30,
    }
  }

  const deadline3JamStr = refundDeadline3Jam.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return {
    sessionDateTime,
    refundDeadlineH3,
    refundDeadline3Jam,
    hoursUntilSession,
    kategori: 'DITOLAK',
    persenRefund: 0,
    persenPotongan: 100,
    alasanPenolakan: `Refund tidak dapat diajukan karena batas waktu pengajuan (maksimal 3 jam sebelum sesi) telah terlewati pada ${deadline3JamStr} WIB`,
  }
}

/**
 * Fungsi kompatibilitas mundur
 */
export function calculateRefundDeadline(
  tanggal: Date | string,
  jamMulai: Date | string
): { sessionDateTime: Date; refundDeadline: Date; isPastH1: boolean } {
  const sessionDateTime = getSessionDateTime(tanggal, jamMulai)
  const refundDeadline = new Date(sessionDateTime.getTime() - 3 * 60 * 60 * 1000)
  const isPastH1 = Date.now() > refundDeadline.getTime()

  return { sessionDateTime, refundDeadline, isPastH1 }
}
