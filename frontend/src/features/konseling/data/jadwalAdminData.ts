import { BookedAssessment, ClientSessionToday, WeeklyTemplateItem } from "@/features/konseling/types"
import { INITIAL_TENAGA_AHLI } from "@/features/psikolog/data/initialData"

export const TIME_SLOTS = [
  "09:00 - 10:00",
  "10:00 - 11:00",
  "13:00 - 14:00",
  "14:30 - 15:30",
  "15:30 - 16:30",
]

export const RAW_CLIENT_SESSIONS: Omit<ClientSessionToday, "status" | "isUpcomingNearest">[] = []

export const WEEK_VARIATIONS: WeeklyTemplateItem[][] = []

export function parseTimeRangeMinutes(timeStr: string) {
  const parts = timeStr.split("-").map((s) => s.trim())
  if (parts.length < 2) return { startMinutes: 0, endMinutes: 0 }
  const [startH, startM] = parts[0].split(":").map(Number)
  const [endH, endM] = parts[1].split(":").map(Number)
  return {
    startMinutes: (startH || 0) * 60 + (startM || 0),
    endMinutes: (endH || 0) * 60 + (endM || 0),
  }
}

export function getInitialSessionsBasedOnTime(): ClientSessionToday[] {
  return []
}

export function getMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(date.getFullYear(), date.getMonth(), diff)
}

export function formatDateKey(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function formatWhatsAppMessage(session: {
  namaKlien: string
  klienId: string
  layanan: string
  psikolog: string
  waktu: string
  tipe: string
}): string {
  return `Halo Kak ${session.namaKlien},

Kami dari Tim Administrasi Empathika ingin mengonfirmasi jadwal sesi Anda hari ini:

📋 *Detail Jadwal Konseling:*
• *ID Klien:* ${session.klienId}
• *Layanan:* ${session.layanan}
• *Psikolog:* ${session.psikolog}
• *Waktu Sesi:* ${session.waktu} WIB
• *Metode:* ${session.tipe}

Mohon dapat bersiap 10 menit sebelum sesi dimulai. Jika ada kendala atau pertanyaan yang ingin ditanyakan, silakan membalas pesan ini. Terima kasih! 🙏`
}

export function getWhatsAppUrl(session: {
  kontak?: string
  namaKlien: string
  klienId: string
  layanan: string
  psikolog: string
  waktu: string
  tipe: string
}): string {
  if (!session.kontak) return "#"
  const clean = session.kontak.replace(/\D/g, "")
  const waNumber = clean.startsWith("0") ? "62" + clean.slice(1) : clean
  const message = formatWhatsAppMessage(session)
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`
}

export function formatWhatsAppPsikologReminder(session: {
  namaKlien: string
  klienId: string
  layanan: string
  psikolog: string
  waktu: string
  tipe: string
}): string {
  return `Halo ${session.psikolog},

Mengingatkan bahwa Anda memiliki jadwal sesi konseling hari ini di Empathika:

📋 *Detail Jadwal Konseling:*
• *Klien:* ${session.namaKlien} (ID: ${session.klienId})
• *Layanan:* ${session.layanan}
• *Waktu Sesi:* ${session.waktu} WIB
• *Metode:* ${session.tipe}

Mohon dapat bersiap dan membuka ruang konsultasi sebelum sesi dimulai. Terima kasih atas dedikasi dan kerjasamanya! 🙏
- Tim Admin Empathika`
}

export function getWhatsAppPsikologUrl(session: {
  noTeleponPsikolog?: string
  kontak?: string
  namaKlien: string
  klienId: string
  layanan: string
  psikolog: string
  waktu: string
  tipe: string
}): string {
  let phone = session.noTeleponPsikolog

  if (!phone && typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("empathika_tenaga_ahli_data")
      const list = saved ? JSON.parse(saved) : INITIAL_TENAGA_AHLI
      const found = list.find(
        (p: any) =>
          p.nama?.toLowerCase().includes(session.psikolog.toLowerCase()) ||
          session.psikolog.toLowerCase().includes(p.nama?.toLowerCase())
      )
      if (found && found.noTelepon) {
        phone = found.noTelepon
      }
    } catch {}
  }

  if (!phone) {
    const foundInit = INITIAL_TENAGA_AHLI.find(
      (p) =>
        p.nama.toLowerCase().includes(session.psikolog.toLowerCase()) ||
        session.psikolog.toLowerCase().includes(p.nama.toLowerCase())
    )
    if (foundInit && foundInit.noTelepon) {
      phone = foundInit.noTelepon
    }
  }

  const clean = (phone || "").replace(/\D/g, "")
  if (!clean) return "#"
  const waNumber = clean.startsWith("0") ? "62" + clean.slice(1) : clean
  const message = formatWhatsAppPsikologReminder(session)
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`
}

export function generateWeekSessions(_monday: Date): BookedAssessment[] {
  return []
}

export function getSampleUpcomingBookings(): BookedAssessment[] {
  return []
}
