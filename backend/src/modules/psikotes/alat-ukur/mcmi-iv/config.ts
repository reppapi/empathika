/**
 * Konfigurasi metadata dan instruksi alat ukur Millon Clinical Multiaxial Inventory-IV (MCMI-IV).
 * Dikembangkan oleh Theodore Millon, Seth Grossman, dan Carrie Millon (2015).
 */
export interface MCMIScaleConfig {
  kode: string;
  nama: string;
  kategori: "Validitas" | "Pola Kepribadian" | "Patologi Kepribadian Berat" | "Sindroma Klinis" | "Sindroma Klinis Berat";
  deskripsi: string;
  nomorSoal: number[];
  jumlahSoal: number;
}

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

export const MCMI4_CONFIG: AlatUkurConfig = {
  kode: "MCMI-IV",
  nama: "Millon Clinical Multiaxial Inventory-IV (MCMI-IV)",
  kategori: "Kepribadian Klinis & Sindroma Multiaxial",
  targetUsia: "18 tahun ke atas",
  periode: "Kondisi dan kepribadian saat ini",
  instruksi:
    "Bacalah dengan teliti setiap pernyataan dari 195 pernyataan berikut ini dan berusahalah memahami pernyataan tersebut dengan sebaik-baiknya. Jawablah pernyataan-pernyataan itu pada kolom jawaban yang tersedia. Apabila Anda merasa pernyataan itu sesuai dengan keadaan Anda yang sebenarnya, pilih tanda (+) Sesuai/True. Apabila Anda merasa pernyataan itu tidak sesuai dengan keadaan Anda yang sebenarnya, pilih tanda (-) Tidak Sesuai/False. Jawablah apa adanya sesuai dengan keadaan Anda yang sebenarnya.",
  instruksiSingkat:
    "Pilih tanda (+) jika pernyataan sesuai dengan diri Anda, atau tanda (-) jika tidak sesuai.",
  deskripsi:
    "Millon Clinical Multiaxial Inventory-IV (MCMI-IV) adalah instrumen psikometrik klinis yang terdiri dari 195 butir pernyataan Benar-Salah (+/-) untuk mengukur 15 spektrum kepribadian, 10 sindroma klinis, dan 5 skala modifikasi/validitas sesuai acuan DSM-5.",
  pengembang:
    "Theodore Millon, PhD, Seth Grossman, PsyD, & Carrie Millon, PhD",
  tahun: "2015",
  tujuan:
    "Mengevaluasi gangguan kepribadian Axis II dan sindroma klinis Axis I DSM-5 untuk keperluan perencanaan terapi, konseling, evaluasi neuropsikologis, dan evaluasi forensik.",
  targetResponden: "Dewasa usia 18 tahun ke atas",
  referensi:
    "Millon, T., Grossman, S., & Millon, C. (2015). Millon Clinical Multiaxial Inventory-IV (MCMI-IV) Manual. Bloomington, MN: NCS Pearson.",
  rentangSkorTotal: "Base Rate (BR) 0 – 115 per skala",
  cutoff:
    "Gaya Kepribadian (BR 60–74), Tipe Kepribadian / Terindikasi Ringan (BR 75–84), Gangguan Kepribadian / Terindikasi Berat (BR ≥ 85). Invalid bila V > 1, W > 19, X < 7 atau > 114, atau seluruh skala 1–8B < 60.",
  dimensiList: [
    // 15 Spektrum Kepribadian
    { nama: "1: Schizoid", deskripsi: "Kurang mampu membina hubungan akrab, menyendiri, emosi tumpul dan dingin.", nomorSoal: [], jumlahSoal: 14, skorMin: 0, skorMax: 115 },
    { nama: "2A: Avoidant", deskripsi: "Peka terhadap penolakan, takut dinilai negatif, konflik antara ingin sosialisasi vs takut ditolak.", nomorSoal: [], jumlahSoal: 14, skorMin: 0, skorMax: 115 },
    { nama: "2B: Melancholic", deskripsi: "Murung, pesimis, pasif, harga diri rendah, fokus hal negatif dan menyalahkan diri.", nomorSoal: [], jumlahSoal: 14, skorMin: 0, skorMax: 115 },
    { nama: "3: Dependent", deskripsi: "Menggantungkan diri pada orang lain, kurang mandiri, penurut karena takut ditinggal.", nomorSoal: [], jumlahSoal: 14, skorMin: 0, skorMax: 115 },
    { nama: "4A: Histrionic", deskripsi: "Mendramatisasi keadaan, ingin jadi pusat perhatian, seduktif, mencari pujian.", nomorSoal: [], jumlahSoal: 14, skorMin: 0, skorMax: 115 },
    { nama: "4B: Turbulent", deskripsi: "Semangat tinggi berlebihan, gembira meluap-luap, sembrono, rawan meledak atau hipomanik.", nomorSoal: [], jumlahSoal: 14, skorMin: 0, skorMax: 115 },
    { nama: "5: Narcissistic", deskripsi: "Mementingkan diri sendiri, merasa paling hebat/berbakat khusus, butuh dikagumi, sombong.", nomorSoal: [], jumlahSoal: 14, skorMin: 0, skorMax: 115 },
    { nama: "6A: Antisocial", deskripsi: "Mengintimidasi, impulsif, melanggar aturan dan otoritas, tidak bertanggung jawab.", nomorSoal: [], jumlahSoal: 14, skorMin: 0, skorMax: 115 },
    { nama: "6B: Sadistic", deskripsi: "Tindakan agresif/kekerasan, mendominasi, keras kepala, memusuhi dan kejam.", nomorSoal: [], jumlahSoal: 14, skorMin: 0, skorMax: 115 },
    { nama: "7: Compulsive", deskripsi: "Kaku, perfeksionis, sangat teratur, sopan, memegang moral tinggi dan menahan amarah.", nomorSoal: [], jumlahSoal: 14, skorMin: 0, skorMax: 115 },
    { nama: "8A: Negativistic", deskripsi: "Pasif-agresif, cemberut, moody, merasa diperlakukan tidak adil, bermasalah dengan otoritas.", nomorSoal: [], jumlahSoal: 14, skorMin: 0, skorMax: 115 },
    { nama: "8B: Masochistic", deskripsi: "Membiarkan diri dimanfaatkan orang lain, rela berkorban walau dikuasai/disakiti.", nomorSoal: [], jumlahSoal: 14, skorMin: 0, skorMax: 115 },
    { nama: "S: Schizotypal", deskripsi: "Perilaku aneh, menyendiri, pikiran tahyul/gaib, curiga dan emosi datar.", nomorSoal: [], jumlahSoal: 14, skorMin: 0, skorMax: 115 },
    { nama: "C: Borderline", deskripsi: "Emosi sangat labil, impulsif, marah tak wajar, citra diri kabur, tendensi mencederai diri.", nomorSoal: [], jumlahSoal: 14, skorMin: 0, skorMax: 115 },
    { nama: "P: Paranoid", deskripsi: "Curiga tinggi, waspada berlebihan, merasa dikontrol orang lain, pikiran kaku.", nomorSoal: [], jumlahSoal: 14, skorMin: 0, skorMax: 115 },

    // 10 Sindroma Klinis
    { nama: "A: Generalized Anxiety", deskripsi: "Cemas, tegang, gugup, gelisah, insomnia, jantung berdebar, otot kaku.", nomorSoal: [], jumlahSoal: 12, skorMin: 0, skorMax: 115 },
    { nama: "H: Somatic Symptom", deskripsi: "Keluhan fisik berulang tanpa penyebab medis jelas, lelah, khawatir sakit.", nomorSoal: [], jumlahSoal: 12, skorMin: 0, skorMax: 115 },
    { nama: "N: Bipolar Spectrum", deskripsi: "Emosi labil, periode gembira berlebihan, banyak bicara cepat, impulsif.", nomorSoal: [], jumlahSoal: 12, skorMin: 0, skorMax: 115 },
    { nama: "D: Persistent Depression", deskripsi: "Penurunan suasana perasaan, lelah, pesimis, menyalahkan diri berkepanjangan.", nomorSoal: [], jumlahSoal: 12, skorMin: 0, skorMax: 115 },
    { nama: "B: Alcohol Use", deskripsi: "Riwayat konsumsi alkohol berlebihan yang mengganggu kehidupan.", nomorSoal: [25, 45, 94, 130, 161], jumlahSoal: 5, skorMin: 0, skorMax: 115 },
    { nama: "T: Drug Use", deskripsi: "Ketergantungan zat/narkoba, perilaku hedonis, kesulitan di pekerjaan/keluarga.", nomorSoal: [36, 61, 81, 105, 116, 124, 144, 176], jumlahSoal: 8, skorMin: 0, skorMax: 115 },
    { nama: "R: Post-Traumatic Stress", deskripsi: "Mimpi buruk dan kilas balik trauma masa lalu, mudah terkejut, menghindar.", nomorSoal: [47, 62, 76, 91, 125, 143, 150, 157], jumlahSoal: 8, skorMin: 0, skorMax: 115 },
    { nama: "SS: Schizophrenic Spectrum", deskripsi: "Perilaku kacau/regresif, disorientasi, halusinasi atau pikiran tak sistematis.", nomorSoal: [], jumlahSoal: 12, skorMin: 0, skorMax: 115 },
    { nama: "CC: Major Depression", deskripsi: "Depresi berat, putus asa, rasa bersalah intens, nafsu makan/tidur drop, ide bunuh diri.", nomorSoal: [], jumlahSoal: 12, skorMin: 0, skorMax: 115 },
    { nama: "PP: Delusional", deskripsi: "Waspada & curiga ekstrem, keyakinan tidak sesuai kenyataan, permusuhan.", nomorSoal: [], jumlahSoal: 12, skorMin: 0, skorMax: 115 },
  ],
  aturanSkoring: [
    {
      kelompok: "Format Pilihan Biner 195 Butir (+/-)",
      nomorSoal: Array.from({ length: 195 }, (_, i) => i + 1),
      pembobotan: "+ (True / Sesuai) = 1, - (False / Tidak Sesuai) = 0",
    },
  ],
};

