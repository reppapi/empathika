export interface AlatUkurConfig {
  kode: string;
  nama: string;
  kategori: string;
  targetUsia: string;
  instruksi: string;
  instruksiSingkat?: string;
  deskripsi: string;
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
};

