import { BookedAssessment, ClientSessionToday, WeeklyTemplateItem } from "@/features/konseling/types"

export const TIME_SLOTS = [
  "09:00 - 10:00",
  "10:00 - 11:00",
  "13:00 - 14:00",
  "14:30 - 15:30",
  "15:30 - 16:30",
]

export const RAW_CLIENT_SESSIONS: Omit<ClientSessionToday, "status" | "isUpcomingNearest">[] = [
  {
    id: "cs1",
    waktu: "09:00 - 10:00",
    namaKlien: "Budi Santoso",
    klienId: "010195",
    kontak: "0812-3456-7890",
    psikolog: "Dr. Dimas",
    layanan: "Konseling Individu",
    tipe: "Online [Zoom]",
    catatan: "Keluhan cemas dan stres pekerjaan berulang",
  },
  {
    id: "cs2",
    waktu: "10:30 - 11:30",
    namaKlien: "Karenn Sya",
    klienId: "010198",
    kontak: "0813-8899-7711",
    psikolog: "Dr. Dimas",
    layanan: "Hipnoterapi",
    tipe: "Online [Zoom]",
    catatan: "Sesi relaksasi dan penanganan insomnia",
  },
  {
    id: "cs3",
    waktu: "13:00 - 14:00",
    namaKlien: "Karenn Sya",
    klienId: "010198",
    kontak: "0813-8899-7711",
    psikolog: "Dr. Dimas",
    layanan: "Konseling Pribadi",
    tipe: "Online [Zoom]",
    catatan: "Lanjutan evaluasi progres mingguan dan latihan pernapasan",
  },
  {
    id: "cs4",
    waktu: "15:00 - 16:00",
    namaKlien: "Dimas Pratama",
    klienId: "010204",
    kontak: "0857-1122-3344",
    psikolog: "Dr. Dimas",
    layanan: "Home Visit",
    tipe: "Offline [Klinik]",
    catatan: "Pendampingan konseling keluarga tatap muka",
  },
  {
    id: "cs5",
    waktu: "16:30 - 17:30",
    namaKlien: "Sarah & David",
    klienId: "010211",
    kontak: "0821-9988-7766",
    psikolog: "Dr. Dimas",
    layanan: "Konseling Pasangan",
    tipe: "Online [Zoom]",
    catatan: "Komunikasi dan resolusi konflik pranikah",
  },
  {
    id: "cs6",
    waktu: "18:30 - 19:30",
    namaKlien: "Rian Hidayat",
    klienId: "010219",
    kontak: "0812-7788-9900",
    psikolog: "Dr. Dimas",
    layanan: "Konseling Karir",
    tipe: "Online [Zoom]",
    catatan: "Eksplorasi burnout dan evaluasi transisi karir profesional",
  },
  {
    id: "cs7",
    waktu: "20:00 - 21:00",
    namaKlien: "Amanda Putri",
    klienId: "010225",
    kontak: "0858-6677-8899",
    psikolog: "Dr. Dimas",
    layanan: "Asesmen Klinis",
    tipe: "Online [Zoom]",
    catatan: "Asesmen lanjutan kecemasan akademik dan regulasi emosi",
  },
  {
    id: "cs8",
    waktu: "21:30 - 22:30",
    namaKlien: "Kevin Sanjaya",
    klienId: "010232",
    kontak: "0819-3344-5566",
    psikolog: "Dr. Dimas",
    layanan: "Konseling Remaja",
    tipe: "Online [Zoom]",
    catatan: "Konseling manajemen waktu belajar dan relasi pertemanan",
  },
]

export const WEEK_VARIATIONS: WeeklyTemplateItem[][] = [
  // Variasi Minggu 1
  [
    { dayOffset: 0, waktu: "09:00 - 10:00", layanan: "Konseling Individu", metode: "Online", namaKlien: "Karen Sya", psikolog: "Dr. Dimas" },
    { dayOffset: 0, waktu: "13:00 - 14:00", layanan: "Hipnoterapi", metode: "Offline", namaKlien: "Budi Santoso", psikolog: "Dr. Dimas" },
    { dayOffset: 1, waktu: "10:00 - 11:00", layanan: "Konseling Pasangan", metode: "Online", namaKlien: "Sarah & David", psikolog: "Dr. Dimas" },
    { dayOffset: 1, waktu: "14:30 - 15:30", layanan: "Asesmen Klinis", metode: "Online", namaKlien: "Dimas Pratama", psikolog: "Dr. Dimas" },
    { dayOffset: 1, waktu: "16:30 - 17:30", layanan: "Konseling Karir", metode: "Offline", namaKlien: "Rian Hidayat", psikolog: "Dr. Dimas" },
    { dayOffset: 2, waktu: "09:00 - 10:00", layanan: "Konseling Remaja", metode: "Online", namaKlien: "Amanda Putri", psikolog: "Dr. Dimas" },
    { dayOffset: 2, waktu: "13:00 - 14:00", layanan: "Konseling Pribadi", metode: "Online", namaKlien: "Kevin Sanjaya", psikolog: "Dr. Dimas" },
    { dayOffset: 3, waktu: "10:30 - 11:30", layanan: "Konseling Individu", metode: "Offline", namaKlien: "Nadia Safira", psikolog: "Dr. Dimas" },
    { dayOffset: 3, waktu: "14:30 - 15:30", layanan: "Home Visit", metode: "Offline", namaKlien: "Farhan Pratama", psikolog: "Dr. Dimas" },
    { dayOffset: 3, waktu: "19:00 - 20:00", layanan: "Asesmen", metode: "Online", namaKlien: "Citra Lestari", psikolog: "Dr. Dimas" },
    { dayOffset: 4, waktu: "09:00 - 10:00", layanan: "Konseling Remaja", metode: "Online", namaKlien: "Yoga Permana", psikolog: "Dr. Dimas" },
    { dayOffset: 4, waktu: "13:00 - 14:00", layanan: "Hipnoterapi", metode: "Offline", namaKlien: "Tiara Andini", psikolog: "Dr. Dimas" },
    { dayOffset: 4, waktu: "16:00 - 17:00", layanan: "Konseling Karir", metode: "Online", namaKlien: "Hendra Wijaya", psikolog: "Dr. Dimas" },
    { dayOffset: 5, waktu: "10:00 - 11:00", layanan: "Konseling Pasangan", metode: "Offline", namaKlien: "Alisa & Reza", psikolog: "Dr. Dimas" },
    { dayOffset: 5, waktu: "14:00 - 15:00", layanan: "Konseling Pribadi", metode: "Online", namaKlien: "Dian Sastro", psikolog: "Dr. Dimas" },
  ],
  // Variasi Minggu 2
  [
    { dayOffset: 0, waktu: "10:00 - 11:00", layanan: "Konseling Karir", metode: "Online", namaKlien: "Budi Santoso", psikolog: "Dr. Dimas" },
    { dayOffset: 0, waktu: "14:30 - 15:30", layanan: "Asesmen Klinis", metode: "Offline", namaKlien: "Amanda Putri", psikolog: "Dr. Dimas" },
    { dayOffset: 0, waktu: "16:30 - 17:30", layanan: "Konseling Remaja", metode: "Online", namaKlien: "Reza Pratama", psikolog: "Dr. Dimas" },
    { dayOffset: 1, waktu: "09:00 - 10:00", layanan: "Home Visit", metode: "Offline", namaKlien: "Karen Sya", psikolog: "Dr. Dimas" },
    { dayOffset: 1, waktu: "13:00 - 14:00", layanan: "Konseling Pribadi", metode: "Online", namaKlien: "Nadia Safira", psikolog: "Dr. Dimas" },
    { dayOffset: 2, waktu: "10:30 - 11:30", layanan: "Konseling Pasangan", metode: "Online", namaKlien: "Sarah Jenkins", psikolog: "Dr. Dimas" },
    { dayOffset: 2, waktu: "14:00 - 15:00", layanan: "Hipnoterapi", metode: "Offline", namaKlien: "Citra Lestari", psikolog: "Dr. Dimas" },
    { dayOffset: 2, waktu: "19:00 - 20:00", layanan: "Konseling Individu", metode: "Online", namaKlien: "Dimas Pratama", psikolog: "Dr. Dimas" },
    { dayOffset: 3, waktu: "09:00 - 10:00", layanan: "Konseling Remaja", metode: "Online", namaKlien: "Kevin Sanjaya", psikolog: "Dr. Dimas" },
    { dayOffset: 3, waktu: "13:00 - 14:00", layanan: "Konseling Karir", metode: "Offline", namaKlien: "Rian Hidayat", psikolog: "Dr. Dimas" },
    { dayOffset: 4, waktu: "10:00 - 11:00", layanan: "Konseling Pribadi", metode: "Online", namaKlien: "Tiara Andini", psikolog: "Dr. Dimas" },
    { dayOffset: 4, waktu: "14:30 - 15:30", layanan: "Asesmen", metode: "Offline", namaKlien: "Farhan Pratama", psikolog: "Dr. Dimas" },
    { dayOffset: 4, waktu: "16:00 - 17:00", layanan: "Konseling Individu", metode: "Online", namaKlien: "Yoga Permana", psikolog: "Dr. Dimas" },
    { dayOffset: 5, waktu: "09:30 - 10:30", layanan: "Hipnoterapi", metode: "Offline", namaKlien: "Hendra Wijaya", psikolog: "Dr. Dimas" },
    { dayOffset: 5, waktu: "13:30 - 14:30", layanan: "Konseling Pasangan", metode: "Online", namaKlien: "Alisa & Reza", psikolog: "Dr. Dimas" },
  ],
  // Variasi Minggu 3
  [
    { dayOffset: 0, waktu: "09:00 - 10:00", layanan: "Konseling Individu", metode: "Offline", namaKlien: "Dimas Pratama", psikolog: "Dr. Dimas" },
    { dayOffset: 0, waktu: "13:00 - 14:00", layanan: "Konseling Remaja", metode: "Online", namaKlien: "Amanda Putri", psikolog: "Dr. Dimas" },
    { dayOffset: 1, waktu: "10:00 - 11:00", layanan: "Hipnoterapi", metode: "Offline", namaKlien: "Tiara Andini", psikolog: "Dr. Dimas" },
    { dayOffset: 1, waktu: "14:30 - 15:30", layanan: "Konseling Pasangan", metode: "Online", namaKlien: "Sarah & David", psikolog: "Dr. Dimas" },
    { dayOffset: 1, waktu: "16:00 - 17:00", layanan: "Konseling Pribadi", metode: "Online", namaKlien: "Kevin Sanjaya", psikolog: "Dr. Dimas" },
    { dayOffset: 2, waktu: "09:00 - 10:00", layanan: "Konseling Karir", metode: "Offline", namaKlien: "Budi Santoso", psikolog: "Dr. Dimas" },
    { dayOffset: 2, waktu: "13:00 - 14:00", layanan: "Asesmen Klinis", metode: "Online", namaKlien: "Citra Lestari", psikolog: "Dr. Dimas" },
    { dayOffset: 3, waktu: "10:30 - 11:30", layanan: "Konseling Individu", metode: "Online", namaKlien: "Karen Sya", psikolog: "Dr. Dimas" },
    { dayOffset: 3, waktu: "15:00 - 16:00", layanan: "Home Visit", metode: "Offline", namaKlien: "Hendra Wijaya", psikolog: "Dr. Dimas" },
    { dayOffset: 4, waktu: "09:00 - 10:00", layanan: "Konseling Remaja", metode: "Online", namaKlien: "Reza Pratama", psikolog: "Dr. Dimas" },
    { dayOffset: 4, waktu: "13:00 - 14:00", layanan: "Konseling Pribadi", metode: "Offline", namaKlien: "Nadia Safira", psikolog: "Dr. Dimas" },
    { dayOffset: 4, waktu: "19:00 - 20:00", layanan: "Konseling Karir", metode: "Online", namaKlien: "Yoga Permana", psikolog: "Dr. Dimas" },
    { dayOffset: 5, waktu: "10:00 - 11:00", layanan: "Asesmen", metode: "Online", namaKlien: "Farhan Pratama", psikolog: "Dr. Dimas" },
    { dayOffset: 5, waktu: "13:00 - 14:00", layanan: "Hipnoterapi", metode: "Offline", namaKlien: "Budi Santoso", psikolog: "Dr. Dimas" },
  ],
  // Variasi Minggu 4
  [
    { dayOffset: 0, waktu: "10:30 - 11:30", layanan: "Konseling Individu", metode: "Online", namaKlien: "Nadia Safira", psikolog: "Dr. Dimas" },
    { dayOffset: 0, waktu: "14:00 - 15:00", layanan: "Konseling Remaja", metode: "Offline", namaKlien: "Yoga Permana", psikolog: "Dr. Dimas" },
    { dayOffset: 1, waktu: "09:00 - 10:00", layanan: "Konseling Pribadi", metode: "Online", namaKlien: "Karen Sya", psikolog: "Dr. Dimas" },
    { dayOffset: 1, waktu: "13:00 - 14:00", layanan: "Konseling Karir", metode: "Online", namaKlien: "Rian Hidayat", psikolog: "Dr. Dimas" },
    { dayOffset: 1, waktu: "16:30 - 17:30", layanan: "Hipnoterapi", metode: "Offline", namaKlien: "Tiara Andini", psikolog: "Dr. Dimas" },
    { dayOffset: 2, waktu: "10:00 - 11:00", layanan: "Asesmen Klinis", metode: "Online", namaKlien: "Dimas Pratama", psikolog: "Dr. Dimas" },
    { dayOffset: 2, waktu: "14:30 - 15:30", layanan: "Konseling Pasangan", metode: "Offline", namaKlien: "Sarah & David", psikolog: "Dr. Dimas" },
    { dayOffset: 3, waktu: "09:00 - 10:00", layanan: "Konseling Individu", metode: "Online", namaKlien: "Budi Santoso", psikolog: "Dr. Dimas" },
    { dayOffset: 3, waktu: "13:00 - 14:00", layanan: "Konseling Remaja", metode: "Online", namaKlien: "Amanda Putri", psikolog: "Dr. Dimas" },
    { dayOffset: 3, waktu: "15:30 - 16:30", layanan: "Home Visit", metode: "Offline", namaKlien: "Farhan Pratama", psikolog: "Dr. Dimas" },
    { dayOffset: 4, waktu: "10:00 - 11:00", layanan: "Konseling Pasangan", metode: "Online", namaKlien: "Alisa & Reza", psikolog: "Dr. Dimas" },
    { dayOffset: 4, waktu: "14:00 - 15:00", layanan: "Konseling Pribadi", metode: "Offline", namaKlien: "Kevin Sanjaya", psikolog: "Dr. Dimas" },
    { dayOffset: 5, waktu: "09:00 - 10:00", layanan: "Konseling Karir", metode: "Online", namaKlien: "Hendra Wijaya", psikolog: "Dr. Dimas" },
    { dayOffset: 5, waktu: "13:00 - 14:00", layanan: "Asesmen", metode: "Offline", namaKlien: "Citra Lestari", psikolog: "Dr. Dimas" },
  ],
]

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

  // Jaga-jaga jika dibuka larut malam (> 22:30), tambahkan 1 slot aktif malam ini
  if (!foundNearest) {
    const currentH = now.getHours()
    const nextH = (currentH + 1) % 24
    list.push({
      id: "cs_night",
      waktu: `${String(currentH).padStart(2, "0")}:45 - ${String(nextH).padStart(2, "0")}:45`,
      namaKlien: "Dina Mariana",
      klienId: "010240",
      kontak: "0813-2233-4455",
      psikolog: "Dr. Dimas",
      layanan: "Konseling Darurat",
      tipe: "Online [Zoom]",
      catatan: "Sesi konseling malam / evaluasi stres akut",
      status: "Segera Dimulai",
      isUpcomingNearest: true,
    })
  }

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

export function generateWeekSessions(monday: Date): BookedAssessment[] {
  const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate())
  const firstJan = new Date(d.getFullYear(), 0, 1)
  const daysDiff = Math.floor((d.getTime() - firstJan.getTime()) / (24 * 60 * 60 * 1000))
  const weekNumber = Math.floor(daysDiff / 7)
  const variationIndex = Math.abs((d.getFullYear() * 52 + weekNumber) % WEEK_VARIATIONS.length)
  const template = WEEK_VARIATIONS[variationIndex]

  return template.map((item, idx) => {
    const targetDate = new Date(monday)
    targetDate.setDate(monday.getDate() + item.dayOffset)
    const dateKey = formatDateKey(targetDate)

    return {
      id: `gen_${dateKey}_${idx}`,
      date: dateKey,
      waktu: item.waktu,
      layanan: item.layanan,
      metode: item.metode,
      namaKlien: item.namaKlien,
      psikolog: item.psikolog,
    }
  })
}

export function getSampleUpcomingBookings(): BookedAssessment[] {
  const now = new Date()
  const nextMon = getMonday(now)
  nextMon.setDate(nextMon.getDate() + 7) // Senin minggu depan

  const d1 = new Date(nextMon)
  const d2 = new Date(nextMon)
  d2.setDate(d2.getDate() + 2) // Rabu minggu depan

  return [
    {
      id: "ub_next_1",
      date: formatDateKey(d1),
      waktu: "10:00 - 11:00",
      layanan: "Konseling Karir",
      metode: "Online",
      namaKlien: "Budi Santoso",
      psikolog: "Dr. Dimas",
    },
    {
      id: "ub_next_2",
      date: formatDateKey(d2),
      waktu: "14:00 - 15:00",
      layanan: "Konseling Pasangan",
      metode: "Online",
      namaKlien: "Sarah Jenkins",
      psikolog: "Dr. Dimas",
    },
  ]
}
