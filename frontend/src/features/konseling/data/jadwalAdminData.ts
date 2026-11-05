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

export function parseTimeRangeMinutes(timeStr?: string) {
  if (!timeStr) return { startMinutes: 0, endMinutes: 0 }
  const cleaned = timeStr.replace(/wib/gi, "").trim()
  const parts = cleaned.split(/[-–—]/).map((s) => s.trim())
  if (parts.length < 2) {
    const m = cleaned.match(/(\d{1,2})[:.](\d{2})/)
    if (m) {
      const mins = parseInt(m[1], 10) * 60 + parseInt(m[2], 10)
      return { startMinutes: mins, endMinutes: mins + 60 }
    }
    return { startMinutes: 0, endMinutes: 0 }
  }
  const startM = parts[0].match(/(\d{1,2})[:.](\d{2})/)
  const endM = parts[1].match(/(\d{1,2})[:.](\d{2})/)
  const startMinutes = startM ? parseInt(startM[1], 10) * 60 + parseInt(startM[2], 10) : 0
  const endMinutes = endM ? parseInt(endM[1], 10) * 60 + parseInt(endM[2], 10) : startMinutes + 60
  return { startMinutes, endMinutes }
}

export function getInitialSessionsBasedOnTime(): ClientSessionToday[] {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  let foundNearest = false

  const list: ClientSessionToday[] = RAW_CLIENT_SESSIONS.map((item) => {
    const { startMinutes, endMinutes } = parseTimeRangeMinutes(item.waktu)

    // Kasus 1: Sesi sudah lewat dibanding jam sekarang
    if (currentMinutes >= endMinutes) {
      return {
        ...item,
        status: "Selesai" as const,
        isUpcomingNearest: false,
      }
    }

    // Kasus 2: Sesi sedang berlangsung di jam sekarang (bukan sesi terdekat berikutnya)
    if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
      return {
        ...item,
        status: "Sedang Berlangsung" as const,
        isUpcomingNearest: false,
      }
    }

    // Kasus 3: Sesi di masa mendatang hari ini (currentMinutes < startMinutes)
    if (!foundNearest) {
      foundNearest = true
      return {
        ...item,
        status: "Segera Dimulai" as const,
        isUpcomingNearest: true,
      }
    }

    // Sesi setelahnya berstatus Menunggu Jadwal
    return {
      ...item,
      status: "Menunggu Jadwal" as const,
      isUpcomingNearest: false,
    }
  }).map((session) => {
    // Simulasi batas refund H-1 (24 jam sebelum jam sesi hari ini)
    const [startH, startM] = session.waktu.split("-")[0].trim().split(":").map(Number)
    const sessionTime = new Date(now)
    sessionTime.setHours(startH || 9, startM || 0, 0, 0)
    const refundDeadline = new Date(sessionTime.getTime() - 24 * 60 * 60 * 1000)
    const isPastH1 = now.getTime() > refundDeadline.getTime()

    // Sesi hari ini secara default sudah melewati H-1 jika sesi dimulai hari ini
    const isPaid = true
    const isRefunded = (session.status as string) === "Dibatalkan (Refund)" || (session.status as string) === "Dibatalkan"
    const isCompleted = session.status === "Selesai"
    const canRefund = isPaid && !isRefunded && !isCompleted && !isPastH1

    return {
      ...session,
      canRefund,
      isPastH1,
      isRefunded,
      isPaid,
      refundDeadline: refundDeadline.toISOString(),
      nominalRefund: 200000,
    }
  })

  return list
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
    } catch { }
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
