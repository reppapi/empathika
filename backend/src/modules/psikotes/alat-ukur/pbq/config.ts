/** Konfigurasi metadata dan instruksi alat ukur Personality Belief Questionnaire (PBQ). */
export interface AlatUkurConfig {
  kode: string;
  nama: string;
  kategori: string;
  targetUsia: string;
  periode?: string;
  instruksi: string;
  instruksiSingkat?: string;
  deskripsi: string;
}

export const PBQ_CONFIG: AlatUkurConfig = {
  kode: "PBQ",
  nama: "Personality Belief Questionnaire (PBQ)",
  kategori: "Pola Keyakinan & Kepribadian",
  targetUsia: "18 tahun ke atas",
  periode: "Keyakinan saat ini",
  instruksi:
    "Bacalah setiap pernyataan di bawah ini dan pilih kolom sesuai dengan tingkat keyakinan Anda terhadap pernyataan tersebut:",
  instruksiSingkat: "Seberapa yakin Anda terhadap pernyataan berikut:",
  deskripsi:
    "Personality Belief Questionnaire (PBQ) dikembangkan oleh Aaron T. Beck dan rekan-rekannya untuk mengidentifikasi pola keyakinan inti yang berkaitan dengan 9 pola kepribadian melalui 126 pernyataan.",
};

