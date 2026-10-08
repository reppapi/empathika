export const CATEGORIES = [
  { id: "01", title: "Psikotes" },
  { id: "02", title: "Konsultasi" },
  { id: "03", title: "Pelatihan peer helper" },
  { id: "04", title: "Event" },
  { id: "05", title: "Asesmen" },
]

export const PSIKOTES_SERVICES = [
  {
    topTitle: "TES 16 KEPRIBADIAN",
    topSubtitle: "(MBTI) Bahasa Indonesia",
    bottomTitle: "Tes Online 16 Kepribadian (MBTI)...",
    bottomDescription: "",
    bgColor: "bg-[#f48520]",
    titleColor: "text-white",
    btnText: "Ikuti Tes",
    shape: "circles",
    href: "/psikotes/mbti",
  },
  {
    topTitle: "TES ONLINE 16 KEPRIBADIAN",
    topSubtitle: "(MBTI) Bahasa Indonesia",
    bottomTitle: "Tes Online 16 Kepribadian (MBTI)...",
    bottomDescription: "",
    bgColor: "bg-[#f0d164]",
    titleColor: "text-gray-900",
    btnText: "Ikuti Tes",
    shape: "circles-dark",
    href: "/psikotes/mbti-2",
  },
  {
    topTitle: "TES LOVE LANGUAGE",
    topSubtitle: "",
    bottomTitle: "Tes Love Language: 5 Tipe Bahasa Cinta...",
    bottomDescription: "",
    bgColor: "bg-[#e31e3d]",
    titleColor: "text-white",
    btnText: "Ikuti Tes",
    shape: "heart",
    href: "/psikotes/love-language",
  },
]

export const KONSULTASI_SERVICES = [
  {
    topTitle: "KONSULTASI",
    topSubtitle: "Individu / Kelompok",
    bottomTitle: "Konsultasi Individu atau Kelompok",
    bottomDescription: "Dapatkan sesi konseling tatap muka atau online bersama psikolog profesional untuk membahas permasalahan pribadi secara intensif dan privat.",
    bgColor: "bg-[#f48520]",
    titleColor: "text-white",
    btnText: "Booking Sesi",
    shape: "circles",
  },
  {
    topTitle: "PEER KONSELOR",
    topSubtitle: "Layanan Teman Sebaya",
    bottomTitle: "Sesi Bersama Peer Konselor",
    bottomDescription: "Layanan pendampingan santai bersama teman sebaya (peer counselor) yang terlatih untuk mendengarkan keluh kesah Anda tanpa penghakiman.",
    bgColor: "bg-[#f0d164]",
    titleColor: "text-gray-900",
    btnText: "Booking Sesi",
    shape: "circles-dark",
  },
  {
    topTitle: "HIPNOTERAPI",
    topSubtitle: "Terapi Alam Bawah Sadar",
    bottomTitle: "Layanan Hipnoterapi",
    bottomDescription: "Terapi mendalam yang menyasar alam bawah sadar untuk membantu mengatasi trauma, kecemasan, fobia, hingga kebiasaan buruk yang sulit dihilangkan.",
    bgColor: "bg-[#e31e3d]",
    titleColor: "text-white",
    btnText: "Booking Sesi",
    shape: "heart",
  },
  {
    topTitle: "HOME VISIT",
    topSubtitle: "Layanan Kunjungan",
    bottomTitle: "Layanan Home Visit",
    bottomDescription: "Layanan spesial di mana psikolog kami akan langsung mengunjungi lokasi Anda demi kenyamanan, terutama bagi klien yang kesulitan mobilitas.",
    bgColor: "bg-[#561269]",
    titleColor: "text-white",
    btnText: "Booking Sesi",
    shape: "circles",
  },
]

export const EVENTS_SERVICES = [
  {
    topTitle: "SEMINAR",
    topSubtitle: "Berbagi Wawasan Edukatif",
    bottomTitle: "Seminar Psikologi",
    bottomDescription: "Sesi edukatif bersama para ahli untuk membahas topik-topik menarik seputar kesehatan mental dan psikologi di masyarakat.",
    bgColor: "bg-[#e31e3d]",
    titleColor: "text-white",
    btnText: "Lihat Detail",
    shape: "circles",
  },
  {
    topTitle: "WORKSHOP",
    topSubtitle: "Pelatihan Interaktif",
    bottomTitle: "Workshop & Pelatihan",
    bottomDescription: "Pelatihan mendalam dan interaktif yang dirancang khusus untuk membekali peserta dengan keterampilan praktis mengelola emosi.",
    bgColor: "bg-[#561269]",
    titleColor: "text-white",
    btnText: "Lihat Detail",
    shape: "circles-dark",
  },
  {
    topTitle: "GOES TO SCHOOL",
    topSubtitle: "Program Edukasi Sekolah",
    bottomTitle: "Empathika Goes to School",
    bottomDescription: "Program kunjungan ke sekolah untuk memberikan psikoedukasi kepada siswa dan guru terkait pentingnya kesehatan mental sejak dini.",
    bgColor: "bg-[#f48520]",
    titleColor: "text-white",
    btnText: "Lihat Detail",
    shape: "heart",
  }
]

// Mapping data layanan ke masing-masing kategori
export const SERVICES_DATA: Record<string, any[]> = {
  "01": PSIKOTES_SERVICES,
  "02": KONSULTASI_SERVICES,
  "03": KONSULTASI_SERVICES,
  "04": EVENTS_SERVICES,
  "05": KONSULTASI_SERVICES,
}
