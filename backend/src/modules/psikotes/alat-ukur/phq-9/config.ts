export interface AlatUkurConfig {
  kode: string;
  nama: string;
  kategori: string;
  targetUsia: string;
  instruksi: string;
  instruksiSingkat?: string;
  deskripsi: string;
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
};

