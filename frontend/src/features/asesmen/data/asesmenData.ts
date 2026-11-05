export interface AsesmenPackage {
  id: string
  title: string
  shortTitle: string
  subtitle: string
  tagline: string
  description: string
  image: string
  badgeColor: string
  weekday: string
  weekend: string
  onlinePrice: string
  duration: string
  questions: string
  targetAudience: string
  onlineBenefits: string[]
  offlineBenefits: string[]
  guidelines: string[]
}

export const ASESMEN_PACKAGES: AsesmenPackage[] = [
  {
    id: "asesmen-minat-bakat",
    title: "Asesmen Minat Bakat",
    shortTitle: "Minat & Bakat",
    tagline: "Eksplorasi Potensi Diri & Arah Karir",
    subtitle:
      "Pemetaan komprehensif potensi akademik, kecenderungan minat karir, dan profil bakat individu bersama tim profesional Empathika.",
    description:
      "Rangkaian asesmen psikometri terstandar untuk mengukur kemampuan kognitif, gaya belajar, kecenderungan minat vokasional, serta potensi diri. Membantu siswa, mahasiswa, maupun profesional dalam menentukan jurusan studi dan arah karir yang paling selaras dengan kepribadian.",
    image: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&w=1200&q=80",
    badgeColor: "bg-purple-100 text-[#561269] border-purple-200",
    weekday: "Rp 400.000",
    weekend: "Rp 500.000",
    onlinePrice: "Rp 350.000",
    duration: "45 - 60 Menit",
    questions: "60 Butir Soal",
    targetAudience: "Siswa SMP/SMA, Mahasiswa, & Profesional Muda",
    onlineBenefits: [
      "Laporan Hasil Psikogram Minat & Bakat Lengkap (PDF)",
      "Rekomendasi Jurusan Pendidikan & Pilihan Karir Relevan",
      "Analisis Profil Gaya Belajar & Kecenderungan Karakter Kerja",
      "Lembar Rekomendasi Resmi Terverifikasi Tim Psikolog Empathika",
    ],
    offlineBenefits: [
      "Sesi Tatap Muka 60-90 Menit di Ruang Konseling Klinik Empathika",
      "Pemberian Baterai Tes Psikometri Fisik Terstandar",
      "Wawancara & Observasi Klinis Langsung oleh Asesor Profesional",
      "Laporan Hasil Cetak Resmi & Sesi Konsultasi Penjelasan Hasil",
    ],
    guidelines: [
      "Siapkan perangkat laptop/komputer dengan koneksi internet yang stabil untuk pengerjaan online.",
      "Jawablah seluruh pernyataan secara spontan dan jujur sesuai dengan kondisi diri Anda yang sebenarnya.",
      "Tidak ada jawaban benar atau salah dalam asesmen minat bakat; setiap profil diri adalah unik.",
    ],
  },
  {
    id: "asesmen-kesiapan-sekolah",
    title: "Asesmen Kesiapan Sekolah",
    shortTitle: "Kesiapan Sekolah",
    tagline: "Kematangan Tumbuh Kembang Anak",
    subtitle:
      "Pemeriksaan psikologis perkembangan anak untuk mengukur kematangan kognitif, motorik, bahasa, dan regulasi sosio-emosional.",
    description:
      "Evaluasi psikologis mendalam perkembangan anak usia dini menjelang masuk jenjang sekolah formal (TK ke SD). Mengukur kematangan kognitif, koordinasi motorik halus/kasar, pemahaman instruksi, kemandirian, dan kesiapan adaptasi sosial di lingkungan belajar baru.",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80",
    badgeColor: "bg-amber-100 text-amber-900 border-amber-200",
    weekday: "Rp 350.000",
    weekend: "Rp 450.000",
    onlinePrice: "Rp 300.000",
    duration: "40 - 60 Menit",
    questions: "45 Indikator Perkembangan",
    targetAudience: "Anak Usia 5 - 7 Tahun Menjelang Sekolah Dasar",
    onlineBenefits: [
      "Skrining Perkembangan Kognitif, Bahasa, & Motorik Anak",
      "Analisis Kesiapan Sosio-Emosional Menghadapi Lingkungan Sekolah",
      "Laporan Rapor Kesiapan Sekolah Digital (PDF)",
      "Panduan Stimulasi Tumbuh Kembang Praktis bagi Orang Tua",
    ],
    offlineBenefits: [
      "Observasi Langsung Interaksi Anak & Asesor Ramah Anak di Klinik",
      "Pemeriksaan Kesiapan Motorik & Kognitif dengan Alat Peraga Terstandar",
      "Sesi Diskusi & Feedback Langsung dengan Orang Tua Setelah Asesmen",
      "Laporan Hasil Resmi Bertanda Tangan Psikolog Anak Empathika",
    ],
    guidelines: [
      "Pastikan anak dalam kondisi fisik sehat, bugar, cukup tidur, dan tidak mengantuk.",
      "Dampingi anak dengan tenang dan hindari memberikan bantuan jawaban atas tugas/pertanyaan tes.",
      "Asesmen dirancang dalam bentuk aktivitas interaktif menyenangkan yang ramah untuk anak.",
    ],
  },
  {
    id: "asesmen-klinis",
    title: "Asesmen Klinis",
    shortTitle: "Asesmen Klinis",
    tagline: "Evaluasi Mendalam Kesehatan Mental",
    subtitle:
      "Pemeriksaan diagnostik psikologis mendalam untuk mengidentifikasi dinamika kepribadian, regulasi emosi, dan kesehatan mental.",
    description:
      "Evaluasi psikologis komprehensif untuk memetakan kondisi kesehatan mental, tingkat kecemasan (anxiety), stres, depresi, trauma masa lalu, mekanisme koping (coping mechanism), serta dinamika kepribadian menggunakan inventori klinis yang tervalidasi secara ilmiah.",
    image: "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=1200&q=80",
    badgeColor: "bg-rose-100 text-rose-900 border-rose-200",
    weekday: "Rp 350.000",
    weekend: "Rp 450.000",
    onlinePrice: "Rp 350.000",
    duration: "50 - 70 Menit",
    questions: "65 Butir Indikator Klinis",
    targetAudience: "Remaja & Dewasa dengan Isu Regulasi Emosi / Beban Mental",
    onlineBenefits: [
      "Pemeriksaan Multi-Skala Inventori Klinis Terstandar Internasional",
      "Pemetaan Tingkat Distres, Kecemasan, & Indikator Emosional",
      "Laporan Profil Psikologis Klinis Terverifikasi (PDF)",
      "Rekomendasi Rencana Intervensi / Sesi Terapi Personal",
    ],
    offlineBenefits: [
      "Sesi Wawancara Klinis Tatap Muka Mendalam Bersama Psikolog Klinis",
      "Ruang Konseling Privat, Nyaman, dan Terjamin Kerahasiaannya",
      "Pemeriksaan Menyeluruh Termasuk Bahasa Tubuh & Dinamika Emosi",
      "Rekomendasi Penanganan Klinis & Tindak Lanjut Pemulihan",
    ],
    guidelines: [
      "Pilihlah ruangan yang tenang, privat, dan bebas dari distraksi selama pengerjaan.",
      "Jawablah seluruh pernyataan dengan jujur sesuai apa yang Anda rasakan selama 2 minggu terakhir.",
      "Seluruh data dan hasil evaluasi dijamin kerahasiaannya sesuai Kode Etik Psikologi.",
    ],
  },
]

