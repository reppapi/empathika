/** Modul kalkulasi skor total dan evaluasi kriteria DSM-5 untuk alat ukur IGDS9-SF. */
export interface IGDS9SFCalculationResult {
  totalSkor: number; // Skor total 9–45
  kategori: string;
  grade: "Normal" | "Kemungkinan IGD";
  
  // Detail evaluasi Kriteria DSM-5
  dsmEvaluation: {
    kriteriaSangatSering: number; // Jumlah butir dijawab "Sangat sering" (skor 5)
    kriteriaSering: number;       // Jumlah butir dijawab "Sering" (skor 4)
    totalKriteriaTerpenuhi: number; // Skor >= 4
    isIndikasiEvaluasi: boolean;  // Minimal 5 kriteria terpenuhi atau skor >= 36
    statusEvaluasi: string;
    catatanKlinis: string;
  };
  
  catatanKlinis: string[];
}

export const IGDS9SF_LEVELS = [
  {
    min: 9,
    max: 35,
    grade: "Normal" as const,
    kategori: "Normal",
  },
  {
    min: 36,
    max: 45,
    grade: "Kemungkinan Internet Gaming Disorder (IGD)" as any,
    kategori: "Kemungkinan Internet Gaming Disorder (IGD)",
  },
];

export function calculateIGDS9SF(
  jawabanPeserta: Record<number | string, number | string>
): IGDS9SFCalculationResult {
  let totalSkor = 0;
  let kriteriaSangatSering = 0; // Skor 5
  let kriteriaSering = 0;       // Skor 4

  // Toleransi format index: 1-based (1..9) maupun 0-based (0..8)
  const numKeys = Object.keys(jawabanPeserta).map(Number);
  const isZeroBased = numKeys.includes(0) && !numKeys.includes(9);

  for (let no = 1; no <= 9; no++) {
    const key = isZeroBased ? no - 1 : no;
    const rawVal = jawabanPeserta[key] ?? jawabanPeserta[String(key)];
    if (rawVal === undefined || rawVal === null || String(rawVal).trim() === "") {
      throw Object.assign(
        new Error(`Jawaban IGDS9-SF butir ke-${no} wajib diisi (nilai 1–5).`),
        { statusCode: 400 }
      );
    }
    const val = Number(rawVal);
    if (!Number.isInteger(val) || val < 1 || val > 5) {
      throw Object.assign(
        new Error(`Jawaban IGDS9-SF butir ke-${no} tidak valid (harus bilangan bulat 1–5).`),
        { statusCode: 400 }
      );
    }
    totalSkor += val;

    if (val === 5) {
      kriteriaSangatSering += 1;
    } else if (val === 4) {
      kriteriaSering += 1;
    }
  }

  // Rentang skor minimum 9, maksimum 45
  totalSkor = Math.max(9, Math.min(45, totalSkor));

  // Kategori Cutoff Resmi Handout: 9–35 Normal, 36–45 Kemungkinan IGD
  const level =
    IGDS9SF_LEVELS.find((lvl) => totalSkor >= lvl.min && totalSkor <= lvl.max) ||
    (totalSkor >= 36 ? IGDS9SF_LEVELS[1] : IGDS9SF_LEVELS[0]);

  // Evaluasi Kriteria DSM-5
  const totalKriteriaTerpenuhi = kriteriaSangatSering + kriteriaSering;
  const isIndikasiEvaluasi = totalSkor >= 36 || kriteriaSangatSering >= 5;

  let statusEvaluasi = "Pola Normal / Adaptif";
  let catatanKlinisDetail = `Skor total ${totalSkor}/45 berada dalam rentang Normal (9–35) dengan ${kriteriaSangatSering} kriteria dijawab 'Sangat Sering' (skor 5). Hasil ini merupakan skrining awal dan bukan diagnosis klinis.`;

  if (totalSkor >= 36) {
    statusEvaluasi = "Indikasi Skor Tinggi (≥ 36/45) — Disarankan Evaluasi Lanjutan dengan Psikolog";
    catatanKlinisDetail = `Skor total ${totalSkor}/45 berada pada kategori Kemungkinan IGD (rentang 36–45) dengan ${kriteriaSangatSering} dari 9 kriteria dijawab 'Sangat Sering' (skor 5). Hasil ini bersifat evaluatif awal (bukan diagnosis pasti); disarankan berkonsultasi dengan psikolog profesional.`;
  } else if (kriteriaSangatSering >= 5) {
    statusEvaluasi = "Perlu Evaluasi Lanjutan Berbasis Kriteria DSM-5 (≥ 5 Kriteria Sangat Sering)";
    catatanKlinisDetail = `Meskipun skor total (${totalSkor}/45) berada dalam rentang Normal (9–35), terdapat ${kriteriaSangatSering} dari 9 kriteria DSM-5 yang dijawab 'Sangat Sering' (skor 5). Kedua indikator ini mengukur aspek yang berbeda (akumulasi skor total vs. jumlah kriteria yang sering muncul), sehingga tetap disarankan berdiskusi dengan psikolog untuk evaluasi menyeluruh.`;
  }

  const catatanKlinis = [
    `Skor Total: ${totalSkor} / 45 (${level.kategori})`,
    `Kriteria DSM-5 Terpenuhi: ${kriteriaSangatSering} Sangat Sering (Skor 5), ${kriteriaSering} Sering (Skor 4).`,
    catatanKlinisDetail,
  ];

  return {
    totalSkor,
    kategori: level.kategori,
    grade: level.grade,
    dsmEvaluation: {
      kriteriaSangatSering,
      kriteriaSering,
      totalKriteriaTerpenuhi,
      isIndikasiEvaluasi,
      statusEvaluasi,
      catatanKlinis: catatanKlinisDetail,
    },
    catatanKlinis,
  };
}
