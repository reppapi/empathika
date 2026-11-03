export interface PHQ9CalculationResult {
  totalSkor: number;
  kategori: string;
  grade: string;
  deskripsi: string;
  tindakLanjut: string;
  catatanKlinis: string[];
  saran: string[];
  ideMelukaiDiri: boolean;
  dampakAktivitas?: string;
}

export const PHQ9_LEVELS = [
  {
    min: 0,
    max: 4,
    grade: "Minimal",
    kategori: "Depresi Minimal",
    deskripsi:
      "Suasana hati dan tingkat fungsional kamu berada dalam rentang normal dan stabil. Gejala depresi tidak terdeteksi secara signifikan dalam dua minggu terakhir.",
    tindakLanjut:
      "Tidak ada tindak lanjut klinis khusus yang diperlukan. Pertahankan pola hidup sehat dan keseimbangan aktivitas.",
    saran: [
      "Pertahankan pola tidur yang cukup dan olahraga teratur.",
      "Lakukan aktivitas yang memberikan kegembiraan dan kepuasan batin.",
      "Jaga komunikasi aktif dengan keluarga dan support system terdekat.",
    ],
  },
  {
    min: 5,
    max: 9,
    grade: "Ringan",
    kategori: "Depresi Ringan",
    deskripsi:
      "Kamu mengalami beberapa gejala depresi ringan yang mungkin dipicu oleh kelelahan, stres sementara, atau perubahan situasi kehidupan.",
    tindakLanjut:
      "Kemungkinan sindrom depresi lainnya. Menunggu dengan pengawasan suportif; ulangi asesmen PHQ-9 saat evaluasi tindak lanjut.",
    saran: [
      "Luangkan waktu jeda berkualitas untuk memulihkan energi fisik dan mental.",
      "Praktikkan teknik relaksasi, journaling emosi, atau aktivitas mindfulness ringan.",
      "Diskusikan perasaanmu dengan orang terdekat yang kamu percayai.",
    ],
  },
  {
    min: 10,
    max: 14,
    grade: "Sedang",
    kategori: "Depresi Sedang",
    deskripsi:
      "Gejala depresi berada pada tingkat sedang dan kemungkinan mengarah pada episode Major Depressive Disorder (MDD). Kondisi ini mulai mempengaruhi produktivitas dan motivasi harian.",
    tindakLanjut:
      "Kemungkinan MDD. Buat rencana intervensi, pertimbangkan sesi konseling/psikoterapi dengan psikolog profesional, tindak lanjut berkala, dan/atau konsultasi farmakoterapi jika diperlukan.",
    saran: [
      "Sangat disarankan menjadwalkan sesi konseling dengan psikolog klinis Empathika.",
      "Bangun rutinitas harian sederhana dan hindari membuat keputusan besar yang membebani saat ini.",
      "Hindari mengisolasi diri; terbukalah kepada orang-orang suportif di sekitarmu.",
    ],
  },
  {
    min: 15,
    max: 19,
    grade: "Agak Berat",
    kategori: "Depresi Agak Berat",
    deskripsi:
      "Tingkat depresi berada pada tahap agak berat. Gejala-gejala yang dirasakan telah menimbulkan gangguan signifikan terhadap fungsi harian, energi tubuh, dan kestabilan pikiran.",
    tindakLanjut:
      "Intervensi aktif diperlukan dengan psikoterapi intensif oleh psikolog klinis dan/atau farmakoterapi oleh psikiater.",
    saran: [
      "Sangat direkomendasikan untuk segera berkonsultasi dengan psikolog klinis atau psikiater.",
      "Mintalah pendampingan dari keluarga atau orang terdekat untuk membantu aktivitas harian.",
      "Fokus pada pemulihan diri dan hindari beban kerja atau tuntutan yang terlalu berat.",
    ],
  },
  {
    min: 20,
    max: 27,
    grade: "Berat",
    kategori: "Depresi Berat",
    deskripsi:
      "Kondisi depresi berada pada tingkat berat yang kritis. Gejala sangat membebani fisik dan mental, serta membutuhkan penanganan medis dan psikologis komprehensif tanpa penundaan.",
    tindakLanjut:
      "Inisiasi farmakoterapi segera oleh psikiater. Jika gangguan parah, lakukan psikoterapi dan/atau manajemen kolaboratif di fasilitas layanan kesehatan mental.",
    saran: [
      "Segera temui psikiater atau psikolog klinis di fasilitas kesehatan terdekat.",
      "Jangan menghadapi kondisi ini sendirian; pastikan kamu selalu berada di lingkungan yang aman dan didampingi keluarga.",
      "Hubungi layanan darurat kesehatan mental terdekat atau hotline dukungan emosional jika merasa kewalahan.",
    ],
  },
];

export function calculatePHQ9(
  jawabanPeserta: Record<number | string, number | string>
): PHQ9CalculationResult {
  // 1. Hitung total skor dari 9 butir pertanyaan pokok (nilai 0 - 3 per butir)
  let totalSkor = 0;
  for (let no = 1; no <= 9; no++) {
    const rawVal = jawabanPeserta[no] ?? jawabanPeserta[String(no)];
    const val = Number(rawVal);
    if (!isNaN(val)) {
      totalSkor += Math.max(0, Math.min(3, val));
    }
  }

  // 2. Tentukan kategori berdasarkan rentang skor 0-27
  const level =
    PHQ9_LEVELS.find((lvl) => totalSkor >= lvl.min && totalSkor <= lvl.max) ||
    PHQ9_LEVELS[PHQ9_LEVELS.length - 1];

  // 3. Evaluasi Khusus Keselamatan: Butir ke-9 (Ide Melukai Diri / Bunuh Diri)
  const rawQ9 = jawabanPeserta[9] ?? jawabanPeserta["9"];
  const valQ9 = Number(rawQ9);
  const ideMelukaiDiri = !isNaN(valQ9) && valQ9 > 0;

  // 4. Catatan klinis & tindak lanjut
  const catatanKlinis: string[] = [];
  catatanKlinis.push(`Rekomendasi Tindak Lanjut Klinis: ${level.tindakLanjut}`);

  if (ideMelukaiDiri) {
    catatanKlinis.unshift(
      "⚠️ PERHATIAN KESELAMATAN: Terdeteksi adanya pemikiran terkait keputusasaan atau melukai diri sendiri (Item 9). Kondisi ini memerlukan prosedur tindak lanjut keselamatan segera dan pendampingan profesional tanpa penundaan."
    );
  }

  return {
    totalSkor,
    kategori: level.kategori,
    grade: level.grade,
    deskripsi: level.deskripsi,
    tindakLanjut: level.tindakLanjut,
    catatanKlinis,
    saran: level.saran,
    ideMelukaiDiri,
  };
}

