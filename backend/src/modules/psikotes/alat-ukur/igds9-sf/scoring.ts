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
    grade: "Kemungkinan IGD" as const,
    kategori: "Kemungkinan IGD",
  },
];

export function calculateIGDS9SF(
  jawabanPeserta: Record<number | string, number | string>
): IGDS9SFCalculationResult {
  let totalSkor = 0;
  let kriteriaSangatSering = 0; // Skor 5
  let kriteriaSering = 0;       // Skor 4

  for (let no = 1; no <= 9; no++) {
    const rawVal = jawabanPeserta[no] ?? jawabanPeserta[String(no)];
    const val = Number(rawVal);
    // Skala Likert 1–5 per butir
    const scoreVal = !isNaN(val) && val >= 1 && val <= 5 ? val : 1;
    totalSkor += scoreVal;

    if (scoreVal === 5) {
      kriteriaSangatSering += 1;
    } else if (scoreVal === 4) {
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
  let catatanKlinisDetail = `Skor total ${totalSkor}/45 berada dalam kategori Normal. Terpenuhi ${kriteriaSangatSering} kriteria sangat sering (skor 5).`;

  if (totalSkor >= 36 || kriteriaSangatSering >= 5) {
    statusEvaluasi = "Kemungkinan IGD — Disarankan Diskusi dengan Psikolog";
    catatanKlinisDetail = `Skor total ${totalSkor}/45 mengindikasikan Kemungkinan IGD (${kriteriaSangatSering} dari 9 kriteria dijawab sangat sering). Sangat dianjurkan berkonsultasi dengan psikolog profesional.`;
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
