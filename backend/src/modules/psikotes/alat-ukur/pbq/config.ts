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

export const PBQ_CONFIG: AlatUkurConfig = {
  kode: "PBQ",
  nama: "Personality Belief Questionnaire (PBQ)",
  kategori: "Pola Keyakinan & Kepribadian",
  targetUsia: "Tidak dicantumkan dalam handout",
  periode: "Keyakinan saat ini",
  instruksi:
    "Bacalah setiap pernyataan di bawah ini dan pilih kolom sesuai dengan tingkat keyakinan Anda terhadap pernyataan tersebut:",
  instruksiSingkat: "Seberapa yakin Anda terhadap pernyataan berikut:",
  deskripsi:
    "Personality Belief Questionnaire (PBQ) dikembangkan oleh Aaron T. Beck dan rekan-rekannya untuk mengidentifikasi pola keyakinan inti yang berkaitan dengan 9 pola kepribadian melalui 126 pernyataan.",
  pengembang: "Aaron T. Beck, M.D. & Judith S. Beck, Ph.D.",
  tahun: "1991 / 2001",
  tujuan:
    "Mengidentifikasi keyakinan inti (core beliefs) disfungsional yang berkaitan dengan sembilan gangguan kepribadian Axis II DSM.",
  targetResponden: "Tidak dicantumkan dalam handout",
  referensi:
    "Beck, A. T., & Beck, J. S. (1991). The Personality Belief Questionnaire. Bala Cynwyd, PA: The Beck Institute for Cognitive Therapy and Research.",
  rentangSkorTotal: "Profil 9 Skala Kepribadian (Masing-masing 0 – 56)",
  cutoff: "Skor persentil ≥ 80 pada masing-masing skala mengindikasikan pola keyakinan yang menonjol dan relevan secara klinis.",
  dimensiList: [
    {
      nama: "Avoidant (Penghindaran)",
      deskripsi: "Keyakinan inti bahwa diri rentan ditolak dan dihina, sehingga memilih menjauhi kedekatan personal.",
      nomorSoal: Array.from({ length: 14 }, (_, i) => i + 1),
      jumlahSoal: 14,
      skorMin: 0,
      skorMax: 56,
    },
    {
      nama: "Dependent (Ketergantungan)",
      deskripsi: "Keyakinan diri tidak berdaya, tidak mampu mengambil keputusan sendiri, dan butuh orang lain untuk menopang.",
      nomorSoal: Array.from({ length: 14 }, (_, i) => i + 15),
      jumlahSoal: 14,
      skorMin: 0,
      skorMax: 56,
    },
    {
      nama: "Passive-Aggressive (Pasif-Agresif)",
      deskripsi: "Keyakinan bahwa otoritas mengekang kemandirian, merespon tuntutan dengan penundaan dan perlawanan pasif.",
      nomorSoal: Array.from({ length: 14 }, (_, i) => i + 29),
      jumlahSoal: 14,
      skorMin: 0,
      skorMax: 56,
    },
    {
      nama: "Obsessive-Compulsive (Obsesif-Kompulsif)",
      deskripsi: "Keyakinan standar kaku, ketertiban mutlak, dan keharusan mengontrol segala detail agar tidak terjadi bencana.",
      nomorSoal: Array.from({ length: 14 }, (_, i) => i + 43),
      jumlahSoal: 14,
      skorMin: 0,
      skorMax: 56,
    },
    {
      nama: "Antisocial (Antisosial)",
      deskripsi: "Keyakinan dunia keras (hukum rimba), aturan dibuat untuk dilanggar, dan hak memanfaatkan orang lain.",
      nomorSoal: Array.from({ length: 14 }, (_, i) => i + 57),
      jumlahSoal: 14,
      skorMin: 0,
      skorMax: 56,
    },
    {
      nama: "Narcissistic (Narsisistik)",
      deskripsi: "Keyakinan diri istimewa, berhak atas perlakuan khusus, dan berada di atas standar orang kebanyakan.",
      nomorSoal: Array.from({ length: 14 }, (_, i) => i + 71),
      jumlahSoal: 14,
      skorMin: 0,
      skorMax: 56,
    },
    {
      nama: "Histrionic (Histrionik)",
      deskripsi: "Keyakinan diri harus menjadi pusat perhatian dan dikagumi agar merasa berharga.",
      nomorSoal: Array.from({ length: 14 }, (_, i) => i + 85),
      jumlahSoal: 14,
      skorMin: 0,
      skorMax: 56,
    },
    {
      nama: "Schizoid (Skizoid)",
      deskripsi: "Keyakinan relasi intim merepotkan dan tidak menyenangkan, lebih nyaman menyendiri tanpa keterikatan emosi.",
      nomorSoal: Array.from({ length: 14 }, (_, i) => i + 99),
      jumlahSoal: 14,
      skorMin: 0,
      skorMax: 56,
    },
    {
      nama: "Paranoid (Paranoid)",
      deskripsi: "Keyakinan bahwa orang lain berniat buruk, tidak dapat dipercaya, dan selalu memiliki motif tersembunyi.",
      nomorSoal: Array.from({ length: 14 }, (_, i) => i + 113),
      jumlahSoal: 14,
      skorMin: 0,
      skorMax: 56,
    },
  ],
  aturanSkoring: [
    {
      kelompok: "Skala Keyakinan 5 Poin (126 Butir)",
      nomorSoal: Array.from({ length: 126 }, (_, i) => i + 1),
      pembobotan: "0 = Sama sekali tidak percaya, 1 = Sedikit percaya, 2 = Cukup percaya, 3 = Sangat percaya, 4 = Percaya sepenuhnya",
    },
  ],
};

