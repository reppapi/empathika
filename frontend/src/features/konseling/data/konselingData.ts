export const KONSELING_STYLES = [
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

// Buat array isi 9 data, berputar secara bergantian mengambil style dari KONSELING_STYLES
export const KONSELING_DATA = Array.from({ length: 9 }).map((_, index) => {
  return KONSELING_STYLES[index % KONSELING_STYLES.length]
})
