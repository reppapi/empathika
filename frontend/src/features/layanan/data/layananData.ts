export const CATEGORIES = [
  { id: "01", title: "Konsultasi" },
  { id: "02", title: "Psikotes" },
  { id: "03", title: "Workshop" },
  { id: "04", title: "Seminar" },
  { id: "05", title: "Asesmen" },
]

export const KONSULTASI_SERVICES: any[] = []
export const PSIKOTES_SERVICES: any[] = []

export const WORKSHOP_SERVICES = [
  {
    topTitle: "WORKSHOP SEFT",
    topSubtitle: "Spiritual Emotional Freedom Technique",
    bottomTitle: "Workshop SEFT",
    bottomDescription:
      "Program pengembangan diri yang membantu peserta mengelola emosi, meredakan stres, dan melepaskan beban batin melalui integrasi psikologi dan spiritualitas.",
    bgColor: "bg-[#561269]",
    titleColor: "text-white",
    btnText: "Lihat Workshop",
    shape: "circles",
    href: "/layanan/workshop/seft",
  },
  {
    topTitle: "PEER HELPER",
    topSubtitle: "Pelatihan Konselor Sebaya",
    bottomTitle: "Pelatihan & Workshop Konselor Sebaya",
    bottomDescription:
      "Pembekalan komprehensif untuk mengasah kepekaan sosial, keterampilan active listening, dan kesiapan menjadi konselor sebaya yang suportif.",
    bgColor: "bg-[#f0d164]",
    titleColor: "text-gray-900",
    btnText: "Lihat Workshop",
    shape: "circles-dark",
    href: "/layanan/workshop/peer-helper",
  },
]

export const SEMINAR_SERVICES = [
  {
    topTitle: "SEMINAR",
    topSubtitle: "Psikoedukasi & Healing",
    bottomTitle: "Seminar Empathika",
    bottomDescription:
      "Program seminar sebagai ruang edukatif dan reflektif untuk meningkatkan pemahaman psikologis serta kesadaran diri.",
    bgColor: "bg-[#561269]",
    titleColor: "text-white",
    btnText: "Lihat Seminar",
    shape: "circles",
    href: "/layanan/seminar",
  },
]

export const ASESMEN_SERVICES: any[] = []

export const SERVICES_DATA: Record<string, any[]> = {
  "01": [],
  "02": [],
  "03": WORKSHOP_SERVICES,
  "04": SEMINAR_SERVICES,
  "05": [],
}
