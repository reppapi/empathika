/** Konfigurasi metadata dan instruksi alat ukur Children’s Obsessive-Compulsive Inventory – Revised (CHOCI-R). */
export interface AlatUkurConfig {
  kode: string;
  nama: string;
  kategori: string;
  targetUsia: string;
  periode?: string;
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

export const CHOCI_CONFIG: AlatUkurConfig = {
  kode: "CHOCI-R",
  nama: "Children’s Obsessive-Compulsive Inventory – Revised (CHOCI-R)",
  kategori: "Obsesi, Kompulsi & Gejala OCD Anak/Remaja",
  targetUsia: "7–17 tahun",
  periode: "Gejala umum & frekuensi saat ini",
  instruksi:
    "Kuesioner ini terdiri dari dua bagian (Kompulsi dan Obsesi). Jawablah setiap pernyataan sesuai dengan apa yang kamu rasakan atau alami secara jujur. Tidak ada jawaban yang benar atau salah.",
  instruksiSingkat:
    "Pilihlah seberapa sering atau seberapa besar hal-hal berikut menggambarkan kebiasaan atau pikiranmu:",
  deskripsi:
    "Children’s Obsessive-Compulsive Inventory – Revised (CHOCI-R) dikembangkan oleh Roz Shafran, Ian Frampton, Isobel Heyman, Matthew Reynolds, Bethany Teachman, dan Stanley Rachman (2003) sebagai instrumen self-report untuk mendiagnosis dan mengkarakterisasi sifat serta tingkat keparahan gejala obsesi dan kompulsi (OCD) pada anak-anak dan remaja usia 7–17 tahun.",
  pengembang:
    "Roz Shafran, Ian Frampton, Isobel Heyman, Matthew Reynolds, Bethany Teachman, & Stanley Rachman",
  tahun: "2003",
  tujuan:
    "Mengevaluasi keberadaan gejala umum OCD (Total Symptoms Score 0–40) serta mengukur tingkat keparahan dan distres/stres fungsional yang ditimbulkannya (Total Impairment Score 0–48) pada anak dan remaja.",
  targetResponden: "Anak-anak dan remaja usia 7–17 tahun (self-report atau didampingi)",
  referensi:
    "Shafran, R., Frampton, I., Heyman, I., Reynolds, M., Teachman, B., & Rachman, S. (2003). The Children's Obsessive-Compulsive Inventory: A new self-report measure. Behaviour Research and Therapy, 41(9), 1109–1116.",
  rentangSkorTotal: "Total Symptoms (0–40) & Total Impairment (0–48)",
  cutoff:
    "Persentil 50 merupakan skor rata-rata untuk anak/remaja dengan OCD, menunjukkan gejala yang khas dan signifikan secara klinis.",
  dimensiList: [
    {
      nama: "Compulsion Symptoms (Gejala Kompulsi)",
      deskripsi:
        "Mengukur keberadaan dan frekuensi 10 tindakan/kebiasaan kompulsi yang berulang (mencuci tangan, memeriksa, merapikan, mengulang tindakan).",
      nomorSoal: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      jumlahSoal: 10,
      skorMin: 0,
      skorMax: 20,
    },
    {
      nama: "Compulsion Severity & Impairment (Keparahan Kompulsi)",
      deskripsi:
        "Mengukur waktu yang dihabiskan, gangguan terhadap sekolah/relasi, distres emosional jika dicegah, upaya melawan, kuatnya desakan, dan penghindaran terkait kompulsi.",
      nomorSoal: [14, 15, 16, 17, 18, 19],
      jumlahSoal: 6,
      skorMin: 0,
      skorMax: 24,
    },
    {
      nama: "Obsession Symptoms (Gejala Obsesi)",
      deskripsi:
        "Mengukur keberadaan dan frekuensi 10 pikiran, gagasan, atau gambaran mengganggu yang berulang (tentang kecelakaan, kematian, keraguan, kesalahan, hal buruk).",
      nomorSoal: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
      jumlahSoal: 10,
      skorMin: 0,
      skorMax: 20,
    },
    {
      nama: "Obsession Severity & Impairment (Keparahan Obsesi)",
      deskripsi:
        "Mengukur waktu memikirkan, gangguan fungsi, tingkat distres/kesal, upaya melawan, derajat kendali, dan penghindaran terkait obsesi.",
      nomorSoal: [33, 34, 35, 36, 37, 38],
      jumlahSoal: 6,
      skorMin: 0,
      skorMax: 24,
    },
  ],
  aturanSkoring: [
    {
      kelompok: "Gejala Kompulsi (Butir 1–10)",
      nomorSoal: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      pembobotan: "Tidak = 0, Sedikit = 1, Banyak = 2 (Rentang Skor 0–20)",
    },
    {
      kelompok: "Keparahan Kompulsi (Butir 14–19)",
      nomorSoal: [14, 15, 16, 17, 18, 19],
      pembobotan: "Skala Likert 5 Opsi (Skor 0 s/d 4, Rentang Skor 0–24)",
    },
    {
      kelompok: "Gejala Obsesi (Butir 20–29)",
      nomorSoal: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
      pembobotan: "Tidak = 0, Sedikit = 1, Banyak = 2 (Rentang Skor 0–20)",
    },
    {
      kelompok: "Keparahan Obsesi (Butir 33–38)",
      nomorSoal: [33, 34, 35, 36, 37, 38],
      pembobotan: "Skala Likert 5 Opsi (Skor 0 s/d 4, Rentang Skor 0–24)",
    },
  ],
};

