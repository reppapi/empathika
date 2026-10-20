import { EventItemApi } from "@/services/event.service"

export interface AdminEventData {
  id: string
  judul: string
  subjudul?: string
  jenis: "Workshop" | "Seminar" | "Webinar"
  pembicara: string
  tanggal: string
  waktuMulai?: string
  waktuSelesai?: string
  waktu: string
  lokasi?: string
  tiketTerjual: number
  totalTiket: number
  harga?: string
  deskripsi?: string
  status: "Dipublikasi" | "Selesai" | "Draft"
  bannerUrl?: string
}

// Helper untuk mapping data dari Backend API (EventItemApi) ke format AdminEventData
export function mapApiToAdminEvent(apiItem: EventItemApi): AdminEventData {
  // Jenis
  let jenis: "Workshop" | "Seminar" | "Webinar" = "Workshop"
  if (apiItem.jenis_event === "SEMINAR") jenis = "Seminar"
  if (apiItem.jenis_event === "WEBINAR") jenis = "Webinar"

  // Status
  let status: "Dipublikasi" | "Selesai" | "Draft" = "Dipublikasi"
  if (apiItem.status === "COMPLETED" || apiItem.status === "CANCELLED") status = "Selesai"
  if (apiItem.status === "DRAFT") status = "Draft"

  // Tanggal display (misal "2026-10-25" -> "25 Okt 2026")
  let displayTanggal = apiItem.tanggal
  try {
    const d = new Date(apiItem.tanggal)
    if (!isNaN(d.getTime())) {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sept", "Okt", "Nov", "Des"]
      displayTanggal = `${d.getUTCDate()} ${monthNames[d.getUTCMonth()]} ${d.getUTCFullYear()}`
    }
  } catch {}

  // Waktu format
  let waktuMulai = "09:00"
  try {
    const t = new Date(apiItem.jam_mulai)
    if (!isNaN(t.getTime())) {
      const hh = String(t.getUTCHours()).padStart(2, "0")
      const mm = String(t.getUTCMinutes()).padStart(2, "0")
      waktuMulai = `${hh}:${mm}`
    } else if (typeof apiItem.jam_mulai === "string" && apiItem.jam_mulai.includes(":")) {
      waktuMulai = apiItem.jam_mulai.slice(0, 5)
    }
  } catch {}

  return {
    id: apiItem.id,
    judul: apiItem.judul,
    subjudul: `${jenis} Empathika`,
    jenis,
    pembicara: apiItem.nama_pembicara,
    tanggal: displayTanggal,
    waktuMulai,
    waktu: `${waktuMulai} WIB`,
    lokasi: apiItem.lokasi || undefined,
    tiketTerjual: apiItem.jumlah_booking ?? 0,
    totalTiket: apiItem.kuota,
    harga: String(apiItem.harga),
    deskripsi: apiItem.deskripsi,
    status,
    bannerUrl: apiItem.banner_url || undefined,
  }
}
