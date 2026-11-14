/** Konfigurasi metadata dan instruksi alat ukur skrining depresi PHQ-9. */
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

export const PHQ9_CONFIG: AlatUkurConfig = {
  kode: "PHQ-9",
  nama: "Patient Health Questionnaire-9 (PHQ-9)",
  kategori: "Kesehatan Mental",
  targetUsia: "18 tahun ke atas",
  instruksi:
    "Selama 2 minggu terakhir, seberapa sering anda terganggu oleh masalah-masalah berikut:",
  instruksiSingkat: "Dalam 2 minggu terakhir, seberapa sering kamu:",
  deskripsi:
    "Patient Health Questionnaire (PHQ-9) dikembangkan oleh Spitzer, Kroenke & Williams pada tahun 1999, berisi 9 item yang mengukur tingkat keparahan gejala depresi berdasarkan kriteria DSM-IV untuk individu usia 18 tahun ke atas.",
  pengembang: "Robert L. Spitzer, M.D., Kurt Kroenke, M.D., Janet B.W. Williams, D.S.W.",
  tahun: "1999",
  tujuan:
    "Skrining cepat dan penilaian keparahan gejala depresi berdasarkan 9 kriteria diagnostik DSM-IV/DSM-5.",
  targetResponden: "18 tahun ke atas",
  referensi:
    "Kroenke, K., Spitzer, R. L., & Williams, J. B. (2001). The PHQ-9: validity of a brief depression severity measure. Journal of General Internal Medicine, 16(9), 606-613.",
  rentangSkorTotal: "0 – 27",
  cutoff: "Skor ≥ 10 mengindikasikan kemungkinan depresi sedang hingga berat bermakna secara klinis.",
  dimensiList: [
    {
      nama: "Skala Tunggal (9 Kriteria Diagnostik DSM)",
      deskripsi: "Mengukur 9 kriteria utama depresi: anhedonia, suasana hati murung, gangguan tidur, kelelahan, nafsu makan, rasa bersalah, konsentrasi, retardasi/agitasi motorik, dan pikiran menyakiti diri.",
      nomorSoal: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      jumlahSoal: 9,
      skorMin: 0,
      skorMax: 27,
    },
  ],
  aturanSkoring: [
    {
      kelompok: "Skala Likert 4 Poin (9 Butir)",
      nomorSoal: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      pembobotan: "0 = Tidak pernah, 1 = Beberapa hari, 2 = Lebih dari separuh waktu, 3 = Hampir setiap hari",
    },
  ],
};

