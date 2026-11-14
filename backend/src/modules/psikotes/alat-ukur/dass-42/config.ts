/** Konfigurasi metadata dan instruksi alat ukur DASS-42 (Depresi, Kecemasan, dan Stres). */
export interface AlatUkurConfig {
  kode: string;
  nama: string;
  kategori: string;
  targetUsia: string;
  instruksi: string;
  instruksiSingkat?: string;
  deskripsi: string;
  pengembang?: string;
  tahun?: string;
  tujuan?: string;
  targetResponden?: string;
  referensi?: string;
  rentangSkorTotal?: string;
  cutoff?: string;
  dimensiList?: Array<{
    nama: string;
    deskripsi: string;
    nomorSoal: number[];
    jumlahSoal: number;
    skorMin: number;
    skorMax: number;
  }>;
  aturanSkoring?: Array<{
    kelompok: string;
    nomorSoal: number[];
    pembobotan: string;
  }>;
}

export const DASS42_CONFIG: AlatUkurConfig = {
  kode: "DASS-42",
  nama: "Depression Anxiety Stress Scale (DASS-42)",
  kategori: "Kesehatan Mental",
  targetUsia: "13 tahun ke atas",
  instruksi:
    "Nilailah pada tingkat manakah kamu mengalami setiap kondisi yang disebutkan berikut ini dalam satu minggu terakhir:",
  instruksiSingkat: "Dalam 1 minggu terakhir, seberapa sering kamu:",
  deskripsi:
    "Depression Anxiety Stress Scale (DASS-42) dikembangkan oleh Peter Lovibond & Harold Lovibond pada tahun 1995. Instrumen ini terdiri dari 42 item yang mengukur general psychological distress, mencakup tiga dimensi utama: depresi, kecemasan, dan stres.",
  pengembang: "Peter F. Lovibond & Syd H. Lovibond",
  tahun: "1995",
  tujuan:
    "Mengukur tingkat keparahan tiga dimensi emosional negatif terkait: depresi (disforia/anhedonia), kecemasan (arousal otonom), dan stres (ketegangan psikologis/irritabilitas).",
  targetResponden: "Remaja dan dewasa usia 13 tahun ke atas",
  referensi:
    "Lovibond, S. H., & Lovibond, P. F. (1995). Manual for the Depression Anxiety Stress Scales (2nd ed.). Sydney: Psychology Foundation.",
  rentangSkorTotal: "0 – 126",
  cutoff: "Kategori interpretasi terpisah per subskala: Normal, Ringan, Sedang, Berat, dan Sangat Berat.",
  dimensiList: [
    {
      nama: "Subskala Depresi",
      deskripsi: "Mengukur hilangnya motivasi, disforia, devaluasi hidup, keputusasaan, dan anhedonia.",
      nomorSoal: [3, 5, 10, 13, 16, 17, 21, 24, 26, 31, 34, 37, 38, 42],
      jumlahSoal: 14,
      skorMin: 0,
      skorMax: 42,
    },
    {
      nama: "Subskala Kecemasan",
      deskripsi: "Mengukur eksitasi sistem saraf otonom, efek muskuloskeletal, dan ketakutan situasional.",
      nomorSoal: [2, 4, 7, 9, 15, 19, 20, 23, 25, 28, 30, 36, 40, 41],
      jumlahSoal: 14,
      skorMin: 0,
      skorMax: 42,
    },
    {
      nama: "Subskala Stres",
      deskripsi: "Mengukur kesulitan relaksasi, gairah gugup kronis, mudah marah, gelisah, dan tidak sabar.",
      nomorSoal: [1, 6, 8, 11, 12, 14, 18, 22, 27, 29, 32, 33, 35, 39],
      jumlahSoal: 14,
      skorMin: 0,
      skorMax: 42,
    },
  ],
  aturanSkoring: [
    {
      kelompok: "Skala Likert 4 Poin (42 Butir)",
      nomorSoal: Array.from({ length: 42 }, (_, i) => i + 1),
      pembobotan: "0 = Tidak pernah, 1 = Kadang-kadang, 2 = Sering, 3 = Sangat sering / hampir selalu",
    },
  ],
};

