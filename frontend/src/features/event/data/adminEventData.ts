export interface AdminEventData {
  id: string
  judul: string
  subjudul?: string
  jenis: "Workshop" | "Seminar"
  pembicara: string
  tanggal: string // e.g. "2026-09-10" atau "10 Sept 2026"
  waktuMulai?: string
  waktuSelesai?: string
  waktu: string // e.g. "10:30 WIB"
  lokasi?: string
  tiketTerjual: number
  totalTiket: number
  harga?: string
  deskripsi?: string
  status: "Dipublikasi" | "Selesai" | "Draft"
  bannerUrl?: string
}

export const INITIAL_ADMIN_EVENTS: AdminEventData[] = [
  {
    id: "1",
    judul: "AMTR : A Moment to Remember",
    subjudul: "Workshop SEFT Empathika",
    jenis: "Workshop",
    pembicara: "nama, M.Psi., Psikolog",
    tanggal: "10 Sept 2026",
    waktuMulai: "10:30",
    waktuSelesai: "12:30",
    waktu: "10:30 WIB",
    lokasi: "Jica FPMIPA UPI",
    tiketTerjual: 85,
    totalTiket: 100,
    harga: "150000",
    deskripsi: "Workshop pengenalan dan penerapan SEFT (Spiritual Emotional Freedom Technique) bersama Empathika.",
    status: "Dipublikasi",
  },
  {
    id: "2",
    judul: "AMTR : A Moment to Remember",
    subjudul: "Workshop Emosi & Self Love",
    jenis: "Workshop",
    pembicara: "nama, M.Psi., Psikolog",
    tanggal: "10 Sept 2026",
    waktuMulai: "10:30",
    waktuSelesai: "13:00",
    waktu: "10:30 WIB",
    lokasi: "Auditorium Gd. Pascasarjana UPI",
    tiketTerjual: 85,
    totalTiket: 100,
    harga: "120000",
    deskripsi: "Sesi workshop mendalam tentang regulasi emosi dan self-love dalam kehidupan sehari-hari.",
    status: "Selesai",
  },
  {
    id: "3",
    judul: "AMTR : A Moment to Remember",
    subjudul: "Seminar Kesehatan Mental",
    jenis: "Seminar",
    pembicara: "nama, M.Psi., Psikolog",
    tanggal: "10 Sept 2026",
    waktuMulai: "10:30",
    waktuSelesai: "12:00",
    waktu: "10:30 WIB",
    lokasi: "Online via Zoom Meeting",
    tiketTerjual: 85,
    totalTiket: 100,
    harga: "50000",
    deskripsi: "Seminar online interaktif tentang kesadaran kesehatan mental di era modern.",
    status: "Draft",
  },
]
