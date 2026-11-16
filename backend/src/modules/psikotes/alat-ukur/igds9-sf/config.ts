/** Konfigurasi metadata dan instruksi alat ukur kecanduan game IGDS9-SF. */
export const IGDS9SF_CONFIG = {
  kode: "IGDS9-SF",
  nama: "Internet Gaming Disorder Scale – Short-Form (IGDS9-SF)",
  kategori: "Kecanduan / Perilaku",
  targetUsia: "Anak-anak hingga Dewasa",
  periode: "12 bulan terakhir",
  instruksi:
    "Pertanyaan-pertanyaan ini akan menanyakan tentang aktivitas game kamu selama 12 bulan terakhir. Dengan aktivitas game, kami memahami setiap aktivitas terkait game yang telah dimainkan baik dari komputer/laptop atau dari konsol game atau perangkat jenis apa pun lainnya (misalnya, ponsel, tablet, dll.) baik online dan/atau offline.",
  instruksiSingkat: "Dalam 12 bulan terakhir, seberapa sering kamu:",
  deskripsi:
    "Instrumen 9 butir untuk menilai tingkat keparahan Internet Gaming Disorder (IGD) dan efek merugikannya berdasarkan kriteria resmi DSM-V (Pontes & Griffiths, 2015).",
  pengembang: "Halley M. Pontes, Ph.D. & Mark D. Griffiths, Ph.D.",
  tahun: "2015",
  tujuan:
    "Mengevaluasi tingkat keparahan kecanduan game (Internet Gaming Disorder) dan dampak negatifnya terhadap aktivitas kehidupan sehari-hari.",
  targetResponden: "Gamer dari usia anak-anak hingga dewasa (≥ 11 tahun)",
  referensi:
    "Pontes, H. M., & Griffiths, M. D. (2015). Measuring DSM-5 internet gaming disorder: Development and validation of a short psychometric scale. Computers in Human Behavior, 45, 137-143.",
  rentangSkorTotal: "9 – 45",
  cutoff: "36–45 (Kemungkinan Internet Gaming Disorder / IGD)",
  dimensiList: [
    {
      nama: "9 Kriteria Diagnostik IGD (DSM-5)",
      deskripsi: "Mengukur preokupasi, penarikan diri (withdrawal), toleransi, hilangnya kendali, hilangnya minat lain, terus bermain meski ada masalah, menipu orang lain, pelarian (escape), dan mengorbankan hubungan/peluang karir/akademik.",
      nomorSoal: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      jumlahSoal: 9,
      skorMin: 9,
      skorMax: 45,
    },
  ],
  aturanSkoring: [
    {
      kelompok: "Skala Likert 5 Poin (9 Butir)",
      nomorSoal: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      pembobotan: "1 = Tidak pernah, 2 = Jarang, 3 = Kadang-kadang, 4 = Sering, 5 = Sangat sering",
    },
  ],
};

