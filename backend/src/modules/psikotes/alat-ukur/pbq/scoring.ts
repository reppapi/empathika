/** Modul kalkulasi skor mentah 9 skala kepribadian PBQ (0–56 per skala, tanpa skor total gabungan). */
export const PBQ_TOTAL_ITEMS = 126;
export const PBQ_ITEMS_PER_SCALE = 14;
export const PBQ_MAX_ITEM_SCORE = 4;
export const PBQ_MAX_SCALE_SCORE = PBQ_ITEMS_PER_SCALE * PBQ_MAX_ITEM_SCORE; // 56

export type PBQScaleKey =
  | "avoidant"
  | "dependent"
  | "passiveAggressive"
  | "obsessiveCompulsive"
  | "antisocial"
  | "narcissistic"
  | "histrionic"
  | "schizoid"
  | "paranoid";

export interface PBQScaleDefinition {
  key: PBQScaleKey;
  nama: string;
  startItem: number;
  endItem: number;
}

export const PBQ_SCALE_DEFINITIONS: PBQScaleDefinition[] = [
  { key: "avoidant", nama: "Avoidant", startItem: 1, endItem: 14 },
  { key: "dependent", nama: "Dependent", startItem: 15, endItem: 28 },
  { key: "passiveAggressive", nama: "Passive-Aggressive", startItem: 29, endItem: 42 },
  { key: "obsessiveCompulsive", nama: "Obsessive-Compulsive", startItem: 43, endItem: 56 },
  { key: "antisocial", nama: "Antisocial", startItem: 57, endItem: 70 },
  { key: "narcissistic", nama: "Narcissistic", startItem: 71, endItem: 84 },
  { key: "histrionic", nama: "Histrionic", startItem: 85, endItem: 98 },
  { key: "schizoid", nama: "Schizoid", startItem: 99, endItem: 112 },
  { key: "paranoid", nama: "Paranoid", startItem: 113, endItem: 126 },
];

export interface PBQSubscaleResult {
  key: PBQScaleKey;
  nama: string;
  rentangButir: string;
  total_item: number;
  max_skor: number;
  skor: number;
  zScore: number | null;
}

export interface PBQCalculationResult {
  /** Nilai 0 hanya sebagai placeholder kolom DB; PBQ tidak menjumlahkan 126 butir menjadi skor total. */
  totalSkor: number;
  tanpaSkorTotal: true;
  hasInterpretation: false;
  kategori: string;
  grade: string;
  deskripsi: string;
  subscales: Record<PBQScaleKey, PBQSubscaleResult>;
  subscalesList: PBQSubscaleResult[];
  catatanKlinis: string[];
}

function clampPBQAnswer(rawVal: unknown): number {
  const num =
    typeof rawVal === "number" || typeof rawVal === "string"
      ? Number(rawVal)
      : Number((rawVal as any)?.bobot ?? (rawVal as any)?.value ?? 0);

  if (!Number.isFinite(num)) return 0;
  if (num < 0) return 0;
  if (num > PBQ_MAX_ITEM_SCORE) return PBQ_MAX_ITEM_SCORE;
  return Math.round(num);
}

/**
 * Menghitung skor mentah 9 skala kepribadian PBQ dari 126 jawaban berskala 0–4.
 * Toleran terhadap key 1-based (1..126) maupun 0-based (0..125).
 * Tidak menghasilkan skor total gabungan maupun kategori interpretasi sebelum ada acuan resmi.
 */
export function calculatePBQ(answers: Record<string | number, any>): PBQCalculationResult {
  const numKeys = Object.keys(answers).map(Number);
  const isZeroBased = numKeys.includes(0) && !numKeys.includes(PBQ_TOTAL_ITEMS);

  const rawSums: Record<PBQScaleKey, number> = {
    avoidant: 0,
    dependent: 0,
    passiveAggressive: 0,
    obsessiveCompulsive: 0,
    antisocial: 0,
    narcissistic: 0,
    histrionic: 0,
    schizoid: 0,
    paranoid: 0,
  };

  for (let no = 1; no <= PBQ_TOTAL_ITEMS; no++) {
    const key = isZeroBased ? no - 1 : no;
    const rawVal = answers[key] ?? answers[String(key)];
    const point = clampPBQAnswer(rawVal);

    const scale = PBQ_SCALE_DEFINITIONS.find((s) => no >= s.startItem && no <= s.endItem);
    if (scale) {
      rawSums[scale.key] += point;
    }
  }

  const subscales = {} as Record<PBQScaleKey, PBQSubscaleResult>;
  const subscalesList: PBQSubscaleResult[] = PBQ_SCALE_DEFINITIONS.map((def) => {
    const item: PBQSubscaleResult = {
      key: def.key,
      nama: def.nama,
      rentangButir: `${def.startItem}–${def.endItem}`,
      total_item: PBQ_ITEMS_PER_SCALE,
      max_skor: PBQ_MAX_SCALE_SCORE,
      skor: rawSums[def.key],
      zScore: null,
    };
    subscales[def.key] = item;
    return item;
  });

  return {
    totalSkor: 0,
    tanpaSkorTotal: true,
    hasInterpretation: false,
    grade: "Profil 9 Skala PBQ",
    kategori: "Profil Skor Mentah 9 Skala Kepribadian (PBQ)",
    deskripsi:
      "Skor mentah PBQ dihitung terpisah untuk masing-masing 9 skala (rentang 0–56 per skala) tanpa penjumlahan skor total gabungan. Interpretasi klinis dan Z-score normatif belum tersedia karena menunggu acuan resmi.",
    subscales,
    subscalesList,
    catatanKlinis: [
      "PBQ tidak dijumlahkan menjadi satu skor total dari 126 pernyataan.",
      "Hasil berupa profil skor mentah pada 9 skala kepribadian (masing-masing rentang 0–56 dari 14 butir).",
      "Interpretasi klinis maupun perhitungan Z-score normatif belum dikonfigurasi sampai acuan resmi ditetapkan.",
    ],
  };
}

