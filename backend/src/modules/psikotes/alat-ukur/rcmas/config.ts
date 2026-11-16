/** Konfigurasi metadata dan instruksi alat ukur kecemasan anak/remaja RCMAS. */
export const RCMAS_CONFIG = {
  kode: "RCMAS",
  nama: "Revised Children's Manifest Anxiety Scale (RCMAS)",
  kategori: "Kecemasan Anak & Remaja",
  targetUsia: "6–19 tahun",
  periode: "Umum / Saat ini",
  instruksi:
    "Berikut adalah pernyataan-pernyataan mengenai apa yang kamu pikirkan dan rasakan. Bacalah setiap pernyataan dengan cermat. Pilih 'Ya' jika pernyataan tersebut menggambarkan perasaan atau tindakanmu. Pilih 'Tidak' jika pernyataan tersebut umumnya tidak mendeskripsikan dirimu. Jawablah dengan jujur sesuai apa yang kamu rasakan sesungguhnya.",
  instruksiSingkat: "Pilih 'Ya' jika sesuai dengan dirimu, atau 'Tidak' jika tidak sesuai:",
  deskripsi:
    "Revised Children's Manifest Anxiety Scale (RCMAS) dikembangkan oleh Reynolds dan Richmond (1978) berdasarkan CMAS (1956) untuk menilai tingkat dan kualitas kecemasan pada anak-anak dan remaja usia 6–19 tahun melalui 37 item.",
  pengembang: "Cecil R. Reynolds, Ph.D. & Bert O. Richmond, Ed.D.",
  tahun: "1978",
  tujuan:
    "Menilai tingkat keparahan dan sifat kecemasan kronis pada anak-anak dan remaja serta mendeteksi kecenderungan social desirability melalui skala kebohongan.",
  targetResponden: "Anak-anak dan remaja usia 6–19 tahun",
  referensi:
    "Reynolds, C. R., & Richmond, B. O. (1978). What I think and feel: A revised measure of children's manifest anxiety. Journal of Abnormal Child Psychology, 6(2), 271-280.",
  rentangSkorTotal: "0 – 28",
  cutoff: "Total Anxiety ≥ 19 mengindikasikan kecemasan signifikan secara klinis; Lie Scale ≥ 5 mengindikasikan potensi ketidakjujuran.",
  dimensiList: [
    {
      nama: "Physiological Anxiety (Kecemasan Fisiologis)",
      deskripsi: "Manifestasi somatik dari kecemasan seperti kesulitan tidur, detak jantung, kelelahan, dan ketegangan tubuh.",
      nomorSoal: [1, 5, 9, 13, 17, 19, 21, 25, 29, 33],
      jumlahSoal: 10,
      skorMin: 0,
      skorMax: 10,
    },
    {
      nama: "Worry / Oversensitivity (Kekhawatiran & Kepekaan Berlebih)",
      deskripsi: "Kecenderungan cemas berlebih, takut dihakimi orang lain, merasa gugup, dan tertekan secara emosional.",
      nomorSoal: [2, 6, 7, 10, 14, 18, 22, 26, 30, 34, 37],
      jumlahSoal: 11,
      skorMin: 0,
      skorMax: 11,
    },
    {
      nama: "Social Concerns / Concentration (Konsentrasi & Masalah Sosial)",
      deskripsi: "Kesulitan mempertahankan konsentrasi, kekhawatiran tidak mampu memenuhi harapan sosial atau keluarga.",
      nomorSoal: [3, 11, 15, 23, 27, 31, 35],
      jumlahSoal: 7,
      skorMin: 0,
      skorMax: 7,
    },
    {
      nama: "Lie Scale (Skala Validitas / Kejujuran)",
      deskripsi: "Mengukur kecenderungan responden memberikan jawaban yang dianggap ideal secara sosial (social desirability).",
      nomorSoal: [4, 8, 12, 16, 20, 24, 28, 32, 36],
      jumlahSoal: 9,
      skorMin: 0,
      skorMax: 9,
    },
  ],
  aturanSkoring: [
    {
      kelompok: "Seluruh Butir Dikotomis (37 Butir)",
      nomorSoal: Array.from({ length: 37 }, (_, i) => i + 1),
      pembobotan: "Pilihan 'Ya' = 1, Pilihan 'Tidak' = 0",
    },
  ],
};

