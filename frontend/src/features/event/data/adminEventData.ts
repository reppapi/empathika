import { EventItemApi } from "@/services/event.service"

export interface AdminEventData {
  id: string
  judul: string
  subjudul?: string
  jenis: "Workshop" | "Seminar" | "Webinar"
  tipe: "Online" | "Offline"
  linkMeet?: string
  linkWa?: string
  pembicara: string
  tanggal: string
  waktuMulai?: string
  waktuSelesai?: string
  waktu: string
  lokasi?: string
  tiketTerjual: number
  totalTiket: number
  harga?: string
  hargaCoret?: string
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

  // Tipe
  const tipe: "Online" | "Offline" = apiItem.tipe_event === "OFFLINE" ? "Offline" : "Online"

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
  let waktuDisplay = "09:00 WIB"
  try {
    const t = new Date(apiItem.jam_mulai)
    if (!isNaN(t.getTime())) {
      const hh = String(t.getUTCHours()).padStart(2, "0")
      const mm = String(t.getUTCMinutes()).padStart(2, "0")
      waktuMulai = `${hh}:${mm}`

      const durasi = apiItem.durasi_menit || 120
      const totalMins = t.getUTCHours() * 60 + t.getUTCMinutes() + durasi
      const endH = String(Math.floor(totalMins / 60) % 24).padStart(2, "0")
      const endM = String(totalMins % 60).padStart(2, "0")
      waktuDisplay = `${hh}:${mm} - ${endH}:${endM} WIB`
    } else if (typeof apiItem.jam_mulai === "string" && apiItem.jam_mulai.includes(":")) {
      waktuMulai = apiItem.jam_mulai.slice(0, 5)
      waktuDisplay = `${waktuMulai} WIB`
    }
  } catch {}

  return {
    id: apiItem.id,
    judul: apiItem.judul,
    subjudul: `${jenis} Empathika`,
    jenis,
    tipe,
    linkMeet: apiItem.link_meet || undefined,
    linkWa: apiItem.link_wa || undefined,
    pembicara: apiItem.nama_pembicara,
    tanggal: displayTanggal,
    waktuMulai,
    waktu: waktuDisplay,
    lokasi: apiItem.lokasi || undefined,
    tiketTerjual: apiItem.jumlah_booking ?? 0,
    totalTiket: apiItem.kuota,
    harga: String(apiItem.harga),
    hargaCoret: apiItem.harga_coret ? String(apiItem.harga_coret) : undefined,
    deskripsi: apiItem.deskripsi,
    status,
    bannerUrl: apiItem.banner_url || undefined,
  }
}
