/** Konfigurasi metadata dan instruksi alat ukur Children's Depression Inventory (CDI). */
export const CDI_CONFIG = {
  kode: "CDI",
  nama: "Children's Depression Inventory (CDI)",
  kategori: "Depresi Anak & Remaja",
  targetUsia: "7–19 tahun",
  periode: "2 minggu terakhir",
  instruksi:
    "Pilihlah kalimat yang menggambarkan pikiran dan perasaan kamu dalam 2 minggu terakhir.",
  instruksiSingkat:
    "Pilihlah kalimat yang menggambarkan pikiran dan perasaan kamu dalam 2 minggu terakhir:",
  deskripsi:
    "Children's Depression Inventory (CDI) dikembangkan oleh Maria Kovacs pada tahun 1992 untuk mengukur tingkat dan gejala depresi pada anak-anak dan remaja usia 7–19 tahun melalui 27 butir pernyataan dalam lima dimensi klinis.",
  pengembang: "Maria Kovacs, Ph.D.",
  tahun: "1992",
  tujuan:
    "Mendeteksi tanda-tanda awal gejala depresi serta mengevaluasi kedalaman lima dimensi sindrom depresi pada anak-anak dan remaja.",
  targetResponden: "Anak-anak dan remaja usia 7–19 tahun",
  referensi:
    "Kovacs, M. (1992). Children's Depression Inventory (CDI) Manual. North Tonawanda, NY: Multi-Health Systems.",
  rentangSkorTotal: "0 – 54",
  cutoff: "Skor total ≥ 19 mengindikasikan sindrom depresi bermakna klinis.",
  dimensiList: [
    {
      nama: "Negative Mood (Suasana Hati Negatif)",
      deskripsi: "Menggambarkan perasaan sedih, khawatir, bersalah, dan kecenderungan menangis.",
      nomorSoal: [1, 3, 6, 10, 11, 26],
      jumlahSoal: 6,
      skorMin: 0,
      skorMax: 12,
    },
    {
      nama: "Interpersonal Problems (Masalah Antarpribadi)",
      deskripsi: "Menggambarkan kesulitan dalam hubungan sosial dan interaksi dengan orang lain.",
      nomorSoal: [5, 8, 12, 27],
      jumlahSoal: 4,
      skorMin: 0,
      skorMax: 8,
    },
    {
      nama: "Ineffectiveness (Ketidakefektifan)",
      deskripsi: "Menggambarkan perasaan tidak mampu, kurang berhasil, atau mengalami kesulitan dalam menyelesaikan tugas.",
      nomorSoal: [2, 15, 23, 24],
      jumlahSoal: 4,
      skorMin: 0,
      skorMax: 8,
    },
    {
      nama: "Anhedonia (Kehilangan Minat/Kesenangan)",
      deskripsi: "Menggambarkan berkurangnya kesenangan, minat, atau ketertarikan terhadap aktivitas sehari-hari.",
      nomorSoal: [4, 16, 17, 18, 19, 20, 21, 22],
      jumlahSoal: 8,
      skorMin: 0,
      skorMax: 16,
    },
    {
      nama: "Negative Self-Esteem (Harga Diri Negatif)",
      deskripsi: "Menggambarkan penilaian negatif terhadap diri sendiri, termasuk perasaan tidak berharga dan kebencian terhadap diri.",
      nomorSoal: [7, 9, 13, 14, 25],
      jumlahSoal: 5,
      skorMin: 0,
      skorMax: 10,
    },
  ],
  aturanSkoring: [
    {
      kelompok: "Soal Normal (14 Butir)",
      nomorSoal: [1, 3, 4, 6, 9, 12, 14, 17, 19, 20, 22, 23, 26, 27],
      pembobotan: "Pilihan 1 = 0, Pilihan 2 = 1, Pilihan 3 = 2",
    },
    {
      kelompok: "Soal Inversi (13 Butir)",
      nomorSoal: [2, 5, 7, 8, 10, 11, 13, 15, 16, 18, 21, 24, 25],
      pembobotan: "Pilihan 1 = 2, Pilihan 2 = 1, Pilihan 3 = 0",
    },
  ],
};

