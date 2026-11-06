export interface GAD7CalculationResult {
  totalSkor: number;
  kategori: string;
  grade: string;
  catatanKlinis: string[];
  dampakAktivitas?: string;
}

export const GAD7_LEVELS = [
  {
    min: 0,
    max: 4,
    grade: "Minimal",
    kategori: "Kecemasan Minimal",
  },
  {
    min: 5,
    max: 9,
    grade: "Ringan",
    kategori: "Kecemasan Ringan",
  },
  {
    min: 10,
    max: 14,
    grade: "Sedang",
    kategori: "Kecemasan Sedang",
  },
  {
    min: 15,
    max: 21,
    grade: "Berat",
    kategori: "Kecemasan Berat",
  },
];

const DIFFICULTY_MAP: Record<number, string> = {
  0: "Tidak menyulitkan sama sekali",
  1: "Sedikit menyulitkan",
  2: "Sangat menyulitkan",
  3: "Luar biasa menyulitkan",
};

export function calculateGAD7(jawabanPeserta: Record<number | string, number | string>): GAD7CalculationResult {
  // 1. Hitung total skor dari 7 butir pertanyaan pokok (nilai 0 - 3 per butir)
  let totalSkor = 0;
  for (let no = 1; no <= 7; no++) {
    const rawVal = jawabanPeserta[no] ?? jawabanPeserta[String(no)];
    const val = Number(rawVal);
    if (!isNaN(val)) {
      totalSkor += Math.max(0, Math.min(3, val));
    }
  }

  // 2. Tentukan kategori berdasarkan rentang skor 0-21
  const level =
    GAD7_LEVELS.find((lvl) => totalSkor >= lvl.min && totalSkor <= lvl.max) ||
    GAD7_LEVELS[GAD7_LEVELS.length - 1];

  // 3. Evaluasi catatan klinis berdasarkan standar Spitzer & Kroenke
  const catatanKlinis: string[] = [];
  if (totalSkor >= 8) {
    catatanKlinis.push(
      "Skor mencapai atau melebihi ambang cut-off 8: Mengindikasikan perlunya skrining lanjutan terhadap kemungkinan gejala Panic Disorder, Social Anxiety Disorder, atau PTSD."
    );
  }
  if (totalSkor >= 10) {
    catatanKlinis.push(
      "Skor berada pada kategori kecemasan sedang/berat (skor >= 10): Mengindikasikan kemungkinan Generalized Anxiety Disorder (GAD)."
    );
  }

  // 4. Evaluasi pertanyaan dampak fungsional (butir 8 opsional jika ada)
  let dampakAktivitas: string | undefined;
  const rawDifficulty = jawabanPeserta[8] ?? jawabanPeserta["8"] ?? jawabanPeserta["difficulty"];
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
    catatanKlinis,
    dampakAktivitas,
  };
}
