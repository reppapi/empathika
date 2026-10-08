export const CATEGORIES = [
  { id: "01", title: "Psikotes" },
  { id: "02", title: "Konsultasi" },
  { id: "03", title: "Pelatihan peer helper" },
  { id: "04", title: "Event" },
  { id: "05", title: "Asesmen" },
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
    title: "Overcoming Burnout: Mengelola Lelah Mental di Tempat Kerja",
    type: "Webinar",
    typeColor: "text-[#561269]",
    date: "Sabtu, 24 Oktober 2026",
    time: "19:00 - 21:00 WIB",
    speakerName: "Sarah M., M.Psi",
    speakerRole: "Psikolog Klinis",
    price: "Rp 50.000",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    speakerImg: "https://ui-avatars.com/api/?name=Sarah+M&background=561269&color=fff"
  },
  {
    title: "Seni Mengenali Diri Sendiri & Self-Healing Therapy",
    type: "Workshop",
    typeColor: "text-[#d97706]",
    date: "Minggu, 1 November 2026",
    time: "10:00 - 14:00 WIB",
    speakerName: "Dr. Andi Pratama",
    speakerRole: "Pakar Mindfulness",
    price: "Rp 150.000",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    speakerImg: "https://ui-avatars.com/api/?name=Dr+Andi&background=d97706&color=fff"
  }
]

// Mapping data layanan ke masing-masing kategori
export const SERVICES_DATA: Record<string, any[]> = {
  "01": KONSULTASI_SERVICES,
  "02": KONSULTASI_SERVICES,
  "03": KONSULTASI_SERVICES,
  "04": EVENTS_SERVICES,
  "05": KONSULTASI_SERVICES,
}
