export interface PHQ9CalculationResult {
  totalSkor: number;
  kategori: string;
  grade: string;
  tindakLanjut: string;
  catatanKlinis: string[];
  ideMelukaiDiri: boolean;
  dampakAktivitas?: string;
}

export const PHQ9_LEVELS = [
  {
    min: 0,
    max: 4,
    grade: "Minimal",
    kategori: "Depresi Minimal",
    tindakLanjut:
      "Tidak ada tindak lanjut klinis khusus yang diperlukan. Pertahankan pola hidup sehat dan keseimbangan aktivitas.",
  },
  {
    min: 5,
    max: 9,
    grade: "Ringan",
    kategori: "Depresi Ringan",
    tindakLanjut:
      "Kemungkinan sindrom depresi lainnya. Menunggu dengan pengawasan suportif; ulangi asesmen PHQ-9 saat evaluasi tindak lanjut.",
  },
  {
    min: 10,
    max: 14,
    grade: "Sedang",
    kategori: "Depresi Sedang",
    tindakLanjut:
      "Kemungkinan MDD. Buat rencana intervensi, pertimbangkan sesi konseling/psikoterapi dengan psikolog profesional, tindak lanjut berkala, dan/atau konsultasi farmakoterapi jika diperlukan.",
  },
  {
    min: 15,
    max: 19,
    grade: "Agak Berat",
    kategori: "Depresi Agak Berat",
    tindakLanjut:
      "Intervensi aktif diperlukan dengan psikoterapi intensif oleh psikolog klinis dan/atau farmakoterapi oleh psikiater.",
  },
  {
    min: 20,
    max: 27,
    grade: "Berat",
    kategori: "Depresi Berat",
    tindakLanjut:
      "Inisiasi farmakoterapi segera oleh psikiater. Jika gangguan parah, lakukan psikoterapi dan/atau manajemen kolaboratif di fasilitas layanan kesehatan mental.",
  },
];

const DIFFICULTY_MAP: Record<number, string> = {
  0: "Tidak menyulitkan sama sekali",
  1: "Sedikit menyulitkan",
  2: "Sangat menyulitkan",
  3: "Luar biasa menyulitkan",
};

export function calculatePHQ9(
  jawabanPeserta: Record<number | string, number | string>
): PHQ9CalculationResult {
  // Toleransi format index: 1-based (1..9) maupun 0-based (0..8)
  const numKeys = Object.keys(jawabanPeserta).map(Number);
  const isZeroBased = numKeys.includes(0) && !numKeys.includes(9);

  // 1. Hitung total skor dari 9 butir pertanyaan pokok (nilai 0 - 3 per butir)
  let totalSkor = 0;
  for (let no = 1; no <= 9; no++) {
    const key = isZeroBased ? no - 1 : no;
    const rawVal = jawabanPeserta[key] ?? jawabanPeserta[String(key)];
    const val = Number(rawVal);
    if (!isNaN(val)) {
      totalSkor += Math.max(0, Math.min(3, val));
    }
  }

  // 2. Tentukan kategori berdasarkan rentang skor 0-27
  const level =
    PHQ9_LEVELS.find((lvl) => totalSkor >= lvl.min && totalSkor <= lvl.max) ||
    PHQ9_LEVELS[PHQ9_LEVELS.length - 1];

  // 3. Evaluasi khusus butir 9: Ide melukai diri sendiri atau bunuh diri (Critical Safety Rule)
  const butir9Key = isZeroBased ? 8 : 9;
  const butir9Val = Number(jawabanPeserta[butir9Key] ?? jawabanPeserta[String(butir9Key)] ?? 0);
  const ideMelukaiDiri = !isNaN(butir9Val) && butir9Val > 0;

  // 4. Catatan klinis
  const catatanKlinis: string[] = [];
  if (ideMelukaiDiri) {
    catatanKlinis.push(
      "PERHATIAN KHUSUS: Peserta mengindikasikan adanya pikiran untuk melukai diri sendiri atau lebih baik mati (Butir 9 > 0). Diperlukan asesmen risiko keselamatan mendalam dan rujukan segera ke profesional kesehatan mental."
    );
  }
  if (totalSkor >= 10) {
    catatanKlinis.push(
      "Skor total berada pada ambang cut-off klinis (skor >= 10): Mengindikasikan sensitivitas dan spesifisitas tinggi terhadap Major Depressive Disorder (MDD)."
    );
  }

  // 5. Evaluasi pertanyaan dampak fungsional (butir 10 opsional jika ada)
  let dampakAktivitas: string | undefined;
  const rawDifficulty = jawabanPeserta[10] ?? jawabanPeserta["10"] ?? jawabanPeserta["difficulty"];
  if (rawDifficulty !== undefined && rawDifficulty !== null) {
    const diffNum = Number(rawDifficulty);
    if (!isNaN(diffNum) && DIFFICULTY_MAP[diffNum]) {
      dampakAktivitas = DIFFICULTY_MAP[diffNum];
    }
  }

  return {
    totalSkor,
    kategori: level.kategori,
    grade: level.grade,
    tindakLanjut: level.tindakLanjut,
    catatanKlinis,
    ideMelukaiDiri,
    dampakAktivitas,
  };
}
