/** Konfigurasi metadata dan instruksi alat ukur kecemasan umum GAD-7. */
export const GAD7_CONFIG = {
  kode: "GAD-7",
  nama: "Generalized Anxiety Disorder-7 (GAD-7)",
  kategori: "Kesehatan Mental",
  targetUsia: "18 tahun ke atas",
  periode: "2 minggu terakhir",
  instruksi: "Selama 2 minggu terakhir, seberapa sering anda terganggu oleh masalah-masalah berikut :",
  instruksiSingkat: "Dalam 2 minggu terakhir, seberapa sering kamu:",
  deskripsi:
    "Skrining standar klinis untuk mengukur tingkat gejala kecemasan umum, gangguan panik, kecemasan sosial, dan PTSD.",
  pengembang: "Robert L. Spitzer, M.D., Kurt Kroenke, M.D., Janet B.W. Williams, D.S.W., Bernd Löwe, M.D.",
  tahun: "2006",
  tujuan:
    "Skrining efisien dan penilaian keparahan gangguan kecemasan umum (Generalized Anxiety Disorder) pada setting klinis dan populasi umum.",
  targetResponden: "18 tahun ke atas",
  referensi:
    "Spitzer, R. L., Kroenke, K., Williams, J. B., & Löwe, B. (2006). A brief measure for assessing generalized anxiety disorder: the GAD-7. Archives of Internal Medicine, 166(10), 1092-1097.",
  rentangSkorTotal: "0 – 21",
  cutoff: "Skor ≥ 10 mengindikasikan ambang klinis kecemasan sedang yang memerlukan evaluasi lebih lanjut.",
  dimensiList: [
    {
      nama: "Skala Tunggal (7 Indikator Gejala Kecemasan)",
      deskripsi: "Mengukur rasa gugup/gelisah, ketidakmampuan menghentikan cemas, kekhawatiran berlebihan terhadap berbagai hal, kesulitan relaksasi, kegelisahan motorik, mudah jengkel, dan perasaan takut akan terjadi hal buruk.",
      nomorSoal: [1, 2, 3, 4, 5, 6, 7],
      jumlahSoal: 7,
      skorMin: 0,
      skorMax: 21,
    },
  ],
  aturanSkoring: [
    {
      kelompok: "Skala Likert 4 Poin (7 Butir)",
      nomorSoal: [1, 2, 3, 4, 5, 6, 7],
      pembobotan: "0 = Tidak pernah, 1 = Beberapa hari, 2 = Lebih dari separuh waktu, 3 = Hampir setiap hari",
    },
  ],
};

