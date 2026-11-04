export const CATEGORIES = [
  { id: "01", title: "Konsultasi" },
  { id: "02", title: "Psikotes" },
  { id: "03", title: "Workshop" },
  { id: "04", title: "Seminar" },
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
    href: "/booking",
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
    href: "/booking",
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
    href: "/booking",
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
    href: "/booking",
  },
]

export const PSIKOTES_SERVICES: any[] = []

export const WORKSHOP_SERVICES = [
  {
    topTitle: "WORKSHOP SEFT",
    topSubtitle: "Spiritual Emotional Freedom Technique",
    bottomTitle: "Workshop SEFT Empathika",
    bottomDescription: "Program workshop interaktif bersama para ahli untuk melepaskan beban emosi mendalam dan meraih ketenangan batin.",
    bgColor: "bg-[#561269]",
    titleColor: "text-white",
    btnText: "Lihat Workshop",
    shape: "circles",
    href: "/event",
  },
  {
    topTitle: "REGULASI EMOSI",
    topSubtitle: "Pelatihan Keterampilan Praktis",
    bottomTitle: "Workshop Manajemen Stres & Regulasi Emosi",
    bottomDescription: "Pelatihan interaktif untuk membekali peserta dengan keterampilan praktis mengelola emosi dan mencegah burnout.",
    bgColor: "bg-[#f48520]",
    titleColor: "text-white",
    btnText: "Lihat Workshop",
    shape: "circles-dark",
    href: "/event",
  },
  {
    topTitle: "PEER HELPER",
    topSubtitle: "Pelatihan Konselor Sebaya",
    bottomTitle: "Pelatihan & Workshop Konselor Sebaya",
    bottomDescription: "Pelatihan pembekalan bagi siswa, mahasiswa, dan komunitas untuk menjadi pendengar aktif dan konselor sebaya yang empatik.",
    bgColor: "bg-[#f0d164]",
    titleColor: "text-gray-900",
    btnText: "Lihat Workshop",
    shape: "heart",
    href: "/event",
  },
]

export const SEMINAR_SERVICES = [
  {
    topTitle: "SEMINAR",
    topSubtitle: "Psikoedukasi & Healing",
    bottomTitle: "Seminar Empathika",
    bottomDescription: "Program seminar sebagai ruang edukatif dan reflektif untuk meningkatkan pemahaman psikologis serta kesadaran diri.",
    bgColor: "bg-[#561269]",
    titleColor: "text-white",
    btnText: "Lihat Seminar",
    shape: "circles",
    href: "/layanan/seminar",
  },
]

export const ASESMEN_SERVICES = [
  {
    topTitle: "ASESMEN",
    topSubtitle: "Minat & Bakat Siswa / Karir",
    bottomTitle: "Asesmen Minat Bakat",
    bottomDescription: "Rangkaian asesmen komprehensif untuk memetakan potensi akademik, bakat karier, dan profil kecenderungan minat individu secara terstandar.",
    bgColor: "bg-[#561269]",
    titleColor: "text-white",
    btnText: "Pilih Asesmen",
    shape: "circles",
    href: "/asesmen?paket=Asesmen+Minat+Bakat",
    bannerUrl: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&w=1200&q=80",
  },
  {
    topTitle: "ASESMEN",
    topSubtitle: "Kematangan Anak & Kognitif",
    bottomTitle: "Asesmen Kesiapan Sekolah",
    bottomDescription: "Pemeriksaan psikologis perkembangan anak untuk mengukur kematangan kognitif, motorik, dan emosional dalam memasuki jenjang sekolah formal.",
    bgColor: "bg-[#f48520]",
    titleColor: "text-white",
    btnText: "Pilih Asesmen",
    shape: "circles-dark",
    href: "/asesmen?paket=Asesmen+Kesiapan+Sekolah",
    bannerUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80",
  },
  {
    topTitle: "ASESMEN",
    topSubtitle: "Diagnostik & Kesehatan Mental",
    bottomTitle: "Asesmen Klinis",
    bottomDescription: "Evaluasi psikologis mendalam untuk mengidentifikasi kondisi klinis, regulasi emosi, kecemasan, dan kesehatan mental secara menyeluruh.",
    bgColor: "bg-[#e31e3d]",
    titleColor: "text-white",
    btnText: "Pilih Asesmen",
    shape: "heart",
    href: "/asesmen?paket=Asesmen+Klinis",
    bannerUrl: "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=1200&q=80",
  },
]

// Mapping data layanan ke masing-masing kategori
export const SERVICES_DATA: Record<string, any[]> = {
  "01": KONSULTASI_SERVICES,
  "02": PSIKOTES_SERVICES,
  "03": WORKSHOP_SERVICES,
  "04": SEMINAR_SERVICES,
  "05": ASESMEN_SERVICES,
}
