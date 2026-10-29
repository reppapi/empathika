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
 * Menghitung batas waktu refund sesi (H-1 = 24 jam sebelum jadwal sesi).
 * Jam di database disimpan dalam representasi WIB, sehingga dikurangi 7 jam untuk UTC absolut.
 */
export function calculateRefundDeadline(
  tanggal: Date | string,
  jamMulai: Date | string
): { sessionDateTime: Date; refundDeadline: Date; isPastH1: boolean } {
  const sessionDate = typeof tanggal === 'string' ? parseDateString(tanggal) : new Date(tanggal)
  const sessionTime = typeof jamMulai === 'string' ? timeStringToDate(jamMulai) : new Date(jamMulai)

  const sessionDateTime = new Date(
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

  const refundDeadline = new Date(sessionDateTime.getTime() - 24 * 60 * 60 * 1000)
  const isPastH1 = Date.now() > refundDeadline.getTime()

  return { sessionDateTime, refundDeadline, isPastH1 }
}
