/** Modul kalkulasi dan evaluasi skor Children’s Obsessive-Compulsive Inventory – Revised (CHOCI-R). */

export interface CHOCISubscaleItem {
  key: string;
  nama: string;
  rentangButir: string;
  total_item: number;
  max_skor: number;
  skor: number;
  deskripsi: string;
}

export interface CHOCIScores {
  compulsionSymptoms: number; // 0–20 (butir 1–10)
  compulsionSeverity: number; // 0–24 (butir 14–19)
  obsessionSymptoms: number; // 0–20 (butir 20–29)
  obsessionSeverity: number; // 0–24 (butir 33–38)
  totalSymptoms: number; // 0–40 (compulsionSymptoms + obsessionSymptoms)
  totalImpairment: number; // 0–48 (compulsionSeverity + obsessionSeverity)
}

export interface CHOCICalculationResult {
  totalSkor: number; // Menggunakan totalSymptoms untuk kompatibilitas DB (versi Anak)
  tanpaSkorTotal: true; // Menandai penyajian dalam bentuk profil multi-skor (Symptoms & Impairment)
  hasInterpretation: false; // Tidak membuat kategori artifisial ringan/sedang/berat
  grade: string;
  kategori: string;
  deskripsi: string;
  saran: string[];
  scores: CHOCIScores;
  subscalesList: CHOCISubscaleItem[];
  catatanKlinis: string[];
  kualitatif: {
    kebiasaanKompulsi: string[];
    pikiranObsesi: string[];
  };
  // Skoring terpisah untuk Kuesioner Orang Tua (Butir 39–76), tidak digabung dengan skor Anak
  parentScores?: CHOCIScores;
  parentSubscalesList?: CHOCISubscaleItem[];
  parentKualitatif?: {
    kebiasaanKompulsi: string[];
    pikiranObsesi: string[];
  };
}

function clampScore(val: unknown, maxScore: number): number {
  const num =
    typeof val === "number" || typeof val === "string"
      ? Number(val)
      : Number((val as any)?.bobot ?? (val as any)?.value ?? 0);

  if (!Number.isFinite(num)) return 0;
  if (num < 0) return 0;
  if (num > maxScore) return maxScore;
  return Math.round(num);
}

function extractText(val: unknown): string {
  if (typeof val === "string") return val.trim();
  if (val && typeof val === "object") {
    return String((val as any).teks || (val as any).jawaban || (val as any).value || "").trim();
  }
  return "";
}

function computeCHOCISet(
  answers: Record<string | number, any>,
  offset: number
): {
  scores: CHOCIScores;
  subscalesList: CHOCISubscaleItem[];
  kualitatif: { kebiasaanKompulsi: string[]; pikiranObsesi: string[] };
} {
  const rawChociIsian = (answers as any)?.choci_isian || (answers as any)?.chociIsian;
  const r = (start: number, end: number) => `${start + offset}–${end + offset}`;

  // 1. Compulsion Symptoms Score (1–10 + offset, skala 0–2)
  let compulsionSymptoms = 0;
  for (let i = 1 + offset; i <= 10 + offset; i++) {
    const raw = answers[i] ?? answers[String(i)];
    compulsionSymptoms += clampScore(raw, 2);
  }

  // 2. Isian Kualitatif Kebiasaan Kompulsi (11–13 + offset)
  const kebiasaanKompulsi: string[] = [];
  if (rawChociIsian && typeof rawChociIsian === "object") {
    for (let idx = 11 + offset; idx <= 13 + offset; idx++) {
      const text = extractText(
        rawChociIsian[idx - 1] ?? rawChociIsian[String(idx - 1)] ?? rawChociIsian[idx] ?? rawChociIsian[String(idx)]
      );
      if (text && !kebiasaanKompulsi.includes(text)) kebiasaanKompulsi.push(text);
    }
  }
  if (kebiasaanKompulsi.length === 0) {
    for (let i = 11 + offset; i <= 13 + offset; i++) {
      const text = extractText(answers[i] ?? answers[String(i)]);
      if (text) kebiasaanKompulsi.push(text);
    }
  }

  // 3. Compulsion Severity Score (14–19 + offset, skala 0–4)
  let compulsionSeverity = 0;
  for (let i = 14 + offset; i <= 19 + offset; i++) {
    const raw = answers[i] ?? answers[String(i)];
    compulsionSeverity += clampScore(raw, 4);
  }

  // 4. Obsession Symptoms Score (20–29 + offset, skala 0–2)
  let obsessionSymptoms = 0;
  for (let i = 20 + offset; i <= 29 + offset; i++) {
    const raw = answers[i] ?? answers[String(i)];
    obsessionSymptoms += clampScore(raw, 2);
  }

  // 5. Isian Kualitatif Pikiran Obsesi (30–32 + offset)
  const pikiranObsesi: string[] = [];
  if (rawChociIsian && typeof rawChociIsian === "object") {
    for (let idx = 30 + offset; idx <= 32 + offset; idx++) {
      const text = extractText(
        rawChociIsian[idx - 1] ?? rawChociIsian[String(idx - 1)] ?? rawChociIsian[idx] ?? rawChociIsian[String(idx)]
      );
      if (text && !pikiranObsesi.includes(text)) pikiranObsesi.push(text);
    }
  }
  if (pikiranObsesi.length === 0) {
    for (let i = 30 + offset; i <= 32 + offset; i++) {
      const text = extractText(answers[i] ?? answers[String(i)]);
      if (text) pikiranObsesi.push(text);
    }
  }

  // 6. Obsession Severity Score (33–38 + offset, skala 0–4)
  let obsessionSeverity = 0;
  for (let i = 33 + offset; i <= 38 + offset; i++) {
    const raw = answers[i] ?? answers[String(i)];
    obsessionSeverity += clampScore(raw, 4);
  }

  const totalSymptoms = compulsionSymptoms + obsessionSymptoms;
  const totalImpairment = compulsionSeverity + obsessionSeverity;

  const scores: CHOCIScores = {
    compulsionSymptoms,
    compulsionSeverity,
    obsessionSymptoms,
    obsessionSeverity,
    totalSymptoms,
    totalImpairment,
  };

  const subscalesList: CHOCISubscaleItem[] = [
    {
      key: "totalSymptoms",
      nama: "Total Symptoms Score (Gejala OCD)",
      rentangButir: `${r(1, 10)} & ${r(20, 29)}`,
      total_item: 20,
      max_skor: 40,
      skor: totalSymptoms,
      deskripsi:
        "Semakin tinggi skor, semakin besar kompleksitas dan luasnya gejala OCD yang dialami.",
    },
    {
      key: "totalImpairment",
      nama: "Total Impairment Score (Keparahan & Distres)",
      rentangButir: `${r(14, 19)} & ${r(33, 38)}`,
      total_item: 12,
      max_skor: 48,
      skor: totalImpairment,
      deskripsi:
        "Semakin tinggi skor, semakin tinggi tingkat keparahan atau distres yang berkaitan dengan gejala OCD.",
    },
    {
      key: "compulsionSymptoms",
      nama: "Compulsion Symptoms (Gejala Kompulsi)",
      rentangButir: r(1, 10),
      total_item: 10,
      max_skor: 20,
      skor: compulsionSymptoms,
      deskripsi: "Keberadaan dan frekuensi perilaku atau tindakan berulang (kompulsi).",
    },
    {
      key: "compulsionSeverity",
      nama: "Compulsion Severity (Keparahan Kompulsi)",
      rentangButir: r(14, 19),
      total_item: 6,
      max_skor: 24,
      skor: compulsionSeverity,
      deskripsi: "Waktu, gangguan, distres, dan penghindaran akibat perilaku kompulsi.",
    },
    {
      key: "obsessionSymptoms",
      nama: "Obsession Symptoms (Gejala Obsesi)",
      rentangButir: r(20, 29),
      total_item: 10,
      max_skor: 20,
      skor: obsessionSymptoms,
      deskripsi: "Keberadaan dan frekuensi pikiran, gambaran, atau desakan mengganggu (obsesi).",
    },
    {
      key: "obsessionSeverity",
      nama: "Obsession Severity (Keparahan Obsesi)",
      rentangButir: r(33, 38),
      total_item: 6,
      max_skor: 24,
      skor: obsessionSeverity,
      deskripsi: "Waktu, gangguan, distres, kendali, dan penghindaran akibat pikiran obsesi.",
    },
  ];

  return {
    scores,
    subscalesList,
    kualitatif: {
      kebiasaanKompulsi,
      pikiranObsesi,
    },
  };
}

/**
 * Menghitung skor instrumen CHOCI-R secara terpisah untuk:
 * - Kuesioner Anak (Self-Report): Butir 1–38
 * - Kuesioner Orang Tua (Parent-Report): Butir 39–76 (jika tersedia)
 */
export function calculateCHOCI(answers: Record<string | number, any>): CHOCICalculationResult {
  if (!answers || typeof answers !== "object") {
    throw new Error("Jawaban kuesioner CHOCI-R tidak valid.");
  }

  const childResult = computeCHOCISet(answers, 0);

  // Cek apakah jawaban Kuesioner Orang Tua (butir 39–76) tersedia
  let hasParentAnswers = false;
  for (let i = 39; i <= 76; i++) {
    if (answers[i] !== undefined || answers[String(i)] !== undefined) {
      hasParentAnswers = true;
      break;
    }
  }
  const parentResult = hasParentAnswers ? computeCHOCISet(answers, 38) : null;

  const catatanKlinis = [
    "Total Symptoms Score: Semakin tinggi skor, semakin besar kompleksitas dan luasnya gejala OCD.",
    "Total Impairment Score: Semakin tinggi skor, semakin tinggi tingkat keparahan atau stres yang berkaitan dengan gejala OCD.",
    "Persentil 50: Skor persentil 50 merupakan skor rata-rata untuk anak/remaja dengan OCD, yang menunjukkan gejala khas dan signifikan secara klinis.",
    "Instrumen CHOCI-R tidak menggunakan kategori buatan (ringan/sedang/berat), melainkan menyajikan profil skor gejala dan keparahan untuk melacak perubahan gejala dari waktu ke waktu.",
  ];

  return {
    totalSkor: childResult.scores.totalSymptoms,
    tanpaSkorTotal: true,
    hasInterpretation: false,
    grade: "Profil Gejala & Keparahan CHOCI-R",
    kategori: "Profil Skor Gejala & Keparahan OCD (CHOCI-R)",
    deskripsi:
      "Hasil CHOCI-R menyajikan profil Total Symptoms Score (rentang 0–40) dan Total Impairment Score (rentang 0–48) secara terpisah untuk Kuesioner Anak dan Kuesioner Orang Tua tanpa pengelompokan kategori artifisial.",
    saran: catatanKlinis,
    scores: childResult.scores,
    subscalesList: childResult.subscalesList,
    catatanKlinis,
    kualitatif: childResult.kualitatif,
    ...(parentResult
      ? {
          parentScores: parentResult.scores,
          parentSubscalesList: parentResult.subscalesList,
          parentKualitatif: parentResult.kualitatif,
        }
      : {}),
  };
}

