import { bookingService } from "@/services/booking.service"

export interface CancelledSessionRecord {
  id?: string
  date?: string // format YYYY-MM-DD
  waktu: string
  namaKlien?: string
  psikolog?: string
  cancelledAt: number
}

const STORAGE_KEY = "empathika_cancelled_sessions"

/**
 * Mengambil daftar seluruh sesi yang telah dibatalkan dari penyimpanan bersama (localStorage).
 */
export function getCancelledSessions(): CancelledSessionRecord[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as CancelledSessionRecord[]
  } catch {
    return []
  }
}

/**
 * Menyimpan sesi yang dibatalkan oleh admin, memicu notifikasi event cross-tab / cross-component,
 * serta memanggil API backend jika ID sesi merupakan UUID booking resmi.
 */
export function recordCancelledSession(record: {
  id?: string
  date?: string
  waktu: string
  namaKlien?: string
  psikolog?: string
}): void {
  if (typeof window === "undefined") return
  try {
    const current = getCancelledSessions()
    const newRecord: CancelledSessionRecord = {
      id: record.id,
      date: record.date,
      waktu: record.waktu,
      namaKlien: record.namaKlien,
      psikolog: record.psikolog,
      cancelledAt: Date.now(),
    }

    // Cek apakah sudah pernah tersimpan sebelumnya
    const exists = current.some((item) => {
      if (record.id && item.id && record.id === item.id) return true
      const sameTime = (record.waktu || "").trim() === (item.waktu || "").trim()
      const sameDate = !record.date || !item.date || record.date === item.date
      const sameClient =
        record.namaKlien &&
        item.namaKlien &&
        record.namaKlien.trim().toLowerCase() === item.namaKlien.trim().toLowerCase()
      return sameTime && sameDate && Boolean(sameClient)
    })

    if (!exists) {
      current.push(newRecord)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
    }

    // Jika ID merupakan UUID database backend, sinkronkan ke server
    if (
      record.id &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(record.id)
    ) {
      bookingService.cancelBooking(record.id).catch((err) => {
        console.warn("Notice cancel booking on backend:", err?.message || err)
      })
    }

    // Trigger event agar halaman psikolog yang terbuka langsung reaktif dan mengubah status jadwalnya
    window.dispatchEvent(new Event("storage"))
    window.dispatchEvent(
      new CustomEvent("empathika_session_cancelled", {
        detail: newRecord,
      })
    )
  } catch (err) {
    console.error("Gagal sinkronisasi pembatalan sesi:", err)
  }
}

/**
 * Mengecek apakah suatu sesi termasuk dalam daftar sesi yang telah dibatalkan admin.
 */
export function isSessionCancelled(
  session: { id?: string; date?: string; waktu: string; namaKlien?: string },
  cancelledList?: CancelledSessionRecord[]
): boolean {
  const list = cancelledList || getCancelledSessions()
  if (!list || list.length === 0) return false

  return list.some((c) => {
    // 1. Cocokkan ID jika keduanya ada
    if (session.id && c.id && session.id === c.id) return true

    // 2. Cocokkan waktu
    const normSessionWaktu = (session.waktu || "").replace(" WIB", "").trim()
    const normCWaktu = (c.waktu || "").replace(" WIB", "").trim()
    if (normSessionWaktu !== normCWaktu) return false

    // 3. Cocokkan tanggal (jika keduanya ada)
    const sameDate = !session.date || !c.date || session.date === c.date

    // 4. Cocokkan nama klien (jika nama klien ada)
    const sName = (session.namaKlien || "").trim().toLowerCase()
    const cName = (c.namaKlien || "").trim().toLowerCase()
    const sameClient =
      !sName ||
      !cName ||
      sName === cName ||
      sName.includes(cName) ||
      cName.includes(sName)

    return sameDate && sameClient
  })
}

/**
 * Aturan Bisnis Pembatalan Sesi:
 * Sesi HANYA BISA dibatalkan sebelum hari H (maksimal H-1, tanggal jadwal > hari ini).
 * Sesi pada hari H (hari ini) atau masa lalu TIDAK DAPAT dibatalkan lagi.
 */
export function canCancelSession(dateStr?: string): boolean {
  if (!dateStr) return false
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const todayKey = `${year}-${month}-${day}`

  // Format YYYY-MM-DD: bisa langsung dicocokkan string leksikografis
  return dateStr > todayKey
}
