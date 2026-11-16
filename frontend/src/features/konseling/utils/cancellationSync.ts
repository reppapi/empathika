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
 * Aturan Bisnis Reschedule (Jadwal Ulang) Sesi:
 * Reschedule HANYA BISA dilakukan maksimal H-3 jam sebelum jadwal sesi dimulai.
 * Jika waktu saat ini sudah kurang dari 3 jam sebelum sesi (misal H-2 jam, H-1 jam, atau sesi sudah berjalan/lewat),
 * sesi TIDAK DAPAT di-reschedule lagi ("gabisa reschedule").
 */
export function canRescheduleSession(dateStr?: string, waktuStr?: string): boolean {
  if (!dateStr) return false

  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const todayKey = `${year}-${month}-${day}`

  // 1. Jika tanggal jadwal sudah lampau -> tidak bisa reschedule
  if (dateStr < todayKey) return false

  // 2. Ambil jam mulai sesi
  let jamMulai = "09:00"
  if (waktuStr) {
    const match = waktuStr.match(/(\d{2}:\d{2})/)
    if (match) {
      jamMulai = match[1]
    }
  }

  const [hours, minutes] = jamMulai.split(":").map(Number)
  const dateParts = dateStr.split("-").map(Number)
  if (dateParts.length !== 3 || !dateParts[0] || !dateParts[1] || !dateParts[2]) {
    return false
  }

  // Waktu mulai sesi sebagai Date object (WIB lokal)
  const sessionStartTime = new Date(
    dateParts[0],
    dateParts[1] - 1,
    dateParts[2],
    hours || 0,
    minutes || 0,
    0,
    0
  )

  // Selisih waktu dalam jam
  const diffMs = sessionStartTime.getTime() - now.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)

  // Maksimal reschedule adalah H-3 jam (minimal selisih 3 jam sebelum jadwal sesi dimulai)
  return diffHours >= 3
}

/**
 * Aturan Bisnis Pembatalan Sesi:
 * Sesi dapat dibatalkan oleh Admin jika sesi belum selesai dan tanggal jadwalnya hari ini atau ke depan.
 * Jika sesi dibatalkan sebelum hari H (maksimal H-1), klien berhak mengajukan refund.
 */
export function canCancelSession(dateStr?: string): boolean {
  if (!dateStr) return false
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const todayKey = `${year}-${month}-${day}`

  // Jika tanggal sudah lewat kemarin, tidak bisa dibatalkan lagi
  return dateStr >= todayKey
}

export interface RescheduledSessionRecord {
  id?: string
  date?: string
  waktu: string
  newDate?: string
  newWaktu?: string
  namaKlien?: string
  psikolog?: string
  rescheduledAt: number
}

const RESCHEDULE_STORAGE_KEY = "empathika_rescheduled_sessions"

export function getRescheduledSessions(): RescheduledSessionRecord[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(RESCHEDULE_STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as RescheduledSessionRecord[]
  } catch {
    return []
  }
}

export function recordRescheduledSession(record: {
  id?: string
  date?: string
  waktu: string
  newDate?: string
  newWaktu?: string
  namaKlien?: string
  psikolog?: string
}): void {
  if (typeof window === "undefined") return
  try {
    const current = getRescheduledSessions()
    const newRecord: RescheduledSessionRecord = {
      ...record,
      rescheduledAt: Date.now(),
    }

    const filtered = current.filter((item) => {
      if (record.id && item.id && record.id === item.id) return false
      const sameTime = (record.waktu || "").trim() === (item.waktu || "").trim()
      const sameDate = !record.date || !item.date || record.date === item.date
      const sameClient =
        record.namaKlien &&
        item.namaKlien &&
        record.namaKlien.trim().toLowerCase() === item.namaKlien.trim().toLowerCase()
      return !(sameTime && sameDate && sameClient)
    })

    filtered.push(newRecord)
    localStorage.setItem(RESCHEDULE_STORAGE_KEY, JSON.stringify(filtered))

    window.dispatchEvent(new Event("storage"))
    window.dispatchEvent(
      new CustomEvent("empathika_session_rescheduled", {
        detail: newRecord,
      })
    )
  } catch (err) {
    console.error("Gagal sinkronisasi reschedule sesi:", err)
  }
}

export function isSessionRescheduled(
  session: {
    id?: string
    date?: string
    waktu: string
    namaKlien?: string
    isAvailableSlot?: boolean
    statusSlot?: string
  },
  rescheduledList?: RescheduledSessionRecord[]
): boolean {
  // Slot ketersediaan kosong / bebas harus selalu berstatus TERSEDIA, bukan reschedule
  if (
    session.isAvailableSlot ||
    session.statusSlot === "TERSEDIA" ||
    !session.namaKlien ||
    session.namaKlien.trim().toLowerCase() === "tersedia"
  ) {
    return false
  }

  const list = rescheduledList || getRescheduledSessions()
  if (!list || list.length === 0) return false

  return list.some((r) => {
    const normSessionWaktu = (session.waktu || "").replace(" WIB", "").trim()
    const normNewWaktu = (r.newWaktu || r.waktu || "").replace(" WIB", "").trim()
    const sName = (session.namaKlien || "").trim().toLowerCase()
    const rName = (r.namaKlien || "").trim().toLowerCase()
    const sameClient =
      !sName || !rName || sName === rName || sName.includes(rName) || rName.includes(sName)

    // Cek kecocokan pada slot tanggal dan jam BARU (tujuan reschedule)
    const targetDate = r.newDate || r.date
    const sameDate = !session.date || !targetDate || session.date === targetDate
    const sameTime = normSessionWaktu === normNewWaktu

    if (sameDate && sameTime && sameClient) return true

    // Cek kecocokan via ID booking pada tanggal baru
    if (session.id && r.id && session.id === r.id && (!r.newDate || session.date === r.newDate)) {
      return true
    }

    return false
  })
}
