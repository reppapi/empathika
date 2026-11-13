/** Konfigurasi metadata dan instruksi alat ukur Child and Adolescent Trauma Screen (CATS). */
export const CATS_CONFIG = {
  kode: "CATS",
  nama: "Child and Adolescent Trauma Screen (CATS)",
  kategori: "Trauma & Gejala Stres Pascatrauma (PTSS/PTSD)",
  targetUsia: "7–17 tahun",
  periode: "2 minggu terakhir",
  instruksi:
    "Peristiwa stres atau menakutkan terjadi pada banyak anak. Asesmen ini terdiri dari daftar peristiwa berpotensi traumatis, tingkat keparahan gejala yang dirasakan dalam 2 minggu terakhir, dan dampaknya terhadap fungsi kehidupan sehari-hari.",
  instruksiSingkat:
    "Dalam 2 minggu terakhir, seberapa sering hal-hal berikut mengganggu anak (sejauh pengetahuan anda):",
  deskripsi:
    "Child and Adolescent Trauma Screen (CATS) dikembangkan oleh Cedric Sachser, Lucy Berliner, Tonje Holt, Tine K. Jensen, Nathaniel Jungbluth, Elizabeth Thoresen, Rita Kosner, dan Lutz Goldbeck pada tahun 2017 sebagai instrumen skrining gejala stres pascatrauma (PTSS) pada anak dan remaja usia 7–17 tahun berdasarkan kriteria DSM-5.",
  pengembang:
    "Cedric Sachser, Lucy Berliner, Tonje Holt, Tine K. Jensen, Nathaniel Jungbluth, Elizabeth Thoresen, Rita Rosner, dan Lutz Goldbeck",
  tahun: "2017",
  tujuan:
    "Mengidentifikasi paparan peristiwa berpotensi traumatis (PTE), mengukur tingkat keparahan gejala PTSD kriteria DSM-5, serta mengevaluasi dampaknya terhadap fungsi psikososial anak dan remaja.",
  targetResponden: "Anak-anak dan remaja usia 7–17 tahun (dapat diisi secara mandiri atau didampingi caregiver/wawancara)",
  referensi:
    "Sachser, C., Berliner, L., Holt, T., Jensen, T. K., Jungbluth, N., Risch, E., Rosner, R., & Goldbeck, L. (2017). International development and psychometric properties of the Child and Adolescent Trauma Screen (CATS). Journal of Affective Disorders, 210, 189–195.",
  rentangSkorTotal: "0 – 60",
  cutoff: "Skor gejala total ≥ 21 mengindikasikan Kemungkinan PTSD (15–20 Distres Menengah)",
  dimensiList: [
    {
      nama: "Kriteria A: Paparan Peristiwa Berpotensi Traumatis (PTE)",
      deskripsi:
        "Mengevaluasi keberadaan paparan terhadap 15 peristiwa yang mengancam keselamatan fisik, psikis, atau integritas diri.",
      nomorSoal: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      jumlahSoal: 15,
      skorMin: 0,
      skorMax: 15,
    },
    {
      nama: "Kriteria B: Gejala Intrusi / Gangguan (Intrusion Symptoms)",
      deskripsi:
        "Ingatan atau gambaran mengganggu yang berulang, mimpi buruk, kilas balik (flashback), serta distres emosional dan reaktivitas fisiologis terhadap pemicu trauma.",
      nomorSoal: [16, 17, 18, 19, 20], // Gejala 1..5
      jumlahSoal: 5,
      skorMin: 0,
      skorMax: 15,
    },
    {
      nama: "Kriteria C: Gejala Penghindaran (Avoidance)",
      deskripsi:
        "Upaya aktif menghindari ingatan, pikiran, perasaan, tempat, aktivitas, atau orang yang mengingatkan pada peristiwa traumatis.",
      nomorSoal: [21, 22], // Gejala 6..7
      jumlahSoal: 2,
      skorMin: 0,
      skorMax: 6,
    },
    {
      nama: "Kriteria D: Perubahan Negatif dalam Kognisi dan Suasana Hati",
      deskripsi:
        "Amnesia disosiatif, keyakinan negatif berlebihan tentang diri/dunia, menyalahkan diri atau orang lain, emosi negatif menetap, anhedonia, merasa terputus dari orang lain, dan ketidakmampuan merasakan emosi positif.",
      nomorSoal: [23, 24, 25, 26, 27, 28, 29], // Gejala 8..14
      jumlahSoal: 7,
      skorMin: 0,
      skorMax: 21,
    },
    {
      nama: "Kriteria E: Hyperarousal & Perubahan Reaktivitas",
      deskripsi:
        "Iritabilitas atau luapan amarah, perilaku ceroboh/berisiko, hiperkewaspadaan, respon terkejut berlebih, kesulitan berkonsentrasi, dan gangguan tidur.",
      nomorSoal: [30, 31, 32, 33, 34, 35], // Gejala 15..20
      jumlahSoal: 6,
      skorMin: 0,
      skorMax: 18,
    },
    {
      nama: "Dampak terhadap Fungsi Psikososial",
      deskripsi:
        "Menilai dampak masalah atau gejala terhadap 5 aspek fungsi: pergaulan dengan orang lain, hobi/kesenangan, sekolah, hubungan dengan keluarga, dan kebahagiaan secara umum (tidak dijumlahkan ke skor gejala total).",
      nomorSoal: [36, 37, 38, 39, 40], // Psikososial 1..5
      jumlahSoal: 5,
      skorMin: 0,
      skorMax: 5,
    },
  ],
  aturanSkoring: [
    {
      kelompok: "Bagian 1: Peristiwa Traumatis (PTE 1–15)",
      nomorSoal: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      pembobotan: "Tidak = 0, Ya = 1 (Verifikasi Kriteria A; jika 0 PTE maka asesmen selesai)",
    },
    {
      kelompok: "Bagian 2: Skor Gejala PTSD DSM-5 (Gejala 1–20)",
      nomorSoal: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
      pembobotan: "0 = Tidak pernah, 1 = Sesekali, 2 = Separuh waktu, 3 = Hampir selalu (Total rentang 0–60)",
    },
    {
      kelompok: "Bagian 3: Dampak Fungsi Psikososial (Aspek 1–5)",
      nomorSoal: [36, 37, 38, 39, 40],
      pembobotan: "Tidak = 0, Ya = 1 (Disimpan terpisah sebagai indikator dampak fungsional, tidak dijumlahkan ke skor gejala)",
    },
  ],
};

