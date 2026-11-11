/** Modul kalkulasi skor GPD, subskala (Depresi, Kecemasan, Stres), dan kategori klinis DASS-42. */
export const DEPRESSION_ITEM_IDS = [3, 5, 10, 13, 16, 17, 21, 24, 26, 31, 34, 37, 38, 42];
export const ANXIETY_ITEM_IDS = [2, 4, 7, 9, 15, 19, 20, 23, 25, 28, 30, 36, 40, 41];
export const STRESS_ITEM_IDS = [1, 6, 8, 11, 12, 14, 18, 22, 27, 29, 32, 33, 35, 39];

export interface SubscaleResult {
  skor: number;
  kategori: string;
  grade: string;
}

export interface DASS42CalculationResult {
  totalSkor: number; // General Psychological Distress (GPD)
  kategori: string;
  grade: string;
  subscales: {
    depression: SubscaleResult;
    anxiety: SubscaleResult;
    stress: SubscaleResult;
  };
}

// ── Kategori Subskala Depresi ────────────────────────────────────────────────
export const DASS42_DEPRESSION_LEVELS = [
  { min: 0, max: 9, grade: "Normal", kategori: "Normal" },
  { min: 10, max: 13, grade: "Ringan", kategori: "Depresi Ringan" },
  { min: 14, max: 20, grade: "Sedang", kategori: "Depresi Sedang" },
  { min: 21, max: 27, grade: "Berat", kategori: "Depresi Berat" },
  { min: 28, max: 42, grade: "Sangat Berat", kategori: "Depresi Sangat Berat" },
];

// ── Kategori Subskala Kecemasan ───────────────────────────────────────────────
export const DASS42_ANXIETY_LEVELS = [
  { min: 0, max: 7, grade: "Normal", kategori: "Normal" },
  { min: 8, max: 9, grade: "Ringan", kategori: "Kecemasan Ringan" },
  { min: 10, max: 14, grade: "Sedang", kategori: "Kecemasan Sedang" },
  { min: 15, max: 19, grade: "Berat", kategori: "Kecemasan Berat" },
  { min: 20, max: 42, grade: "Sangat Berat", kategori: "Kecemasan Sangat Berat" },
];

// ── Kategori Subskala Stres ──────────────────────────────────────────────────
export const DASS42_STRESS_LEVELS = [
  { min: 0, max: 14, grade: "Normal", kategori: "Normal" },
  { min: 15, max: 18, grade: "Ringan", kategori: "Stres Ringan" },
  { min: 19, max: 25, grade: "Sedang", kategori: "Stres Sedang" },
  { min: 26, max: 33, grade: "Berat", kategori: "Stres Berat" },
  { min: 34, max: 42, grade: "Sangat Berat", kategori: "Stres Sangat Berat" },
];

// ── Kategori Tingkat Kesehatan Emosional DASS-42 (Total Skor 0–126) ────────────
export const DASS42_LEVELS = [
  { min: 0, max: 30, grade: "Normal", kategori: "Kondisi Emosional Normal" },
  { min: 31, max: 40, grade: "Ringan", kategori: "Kondisi Emosional Ringan" },
  { min: 41, max: 60, grade: "Sedang", kategori: "Kondisi Emosional Sedang" },
  { min: 61, max: 70, grade: "Berat", kategori: "Kondisi Emosional Berat" },
  { min: 71, max: 126, grade: "Sangat Berat", kategori: "Kondisi Emosional Sangat Berat" },
];

function resolveSubscale(score: number, levels: Array<{ min: number; max: number; grade: string; kategori: string }>): SubscaleResult {
  const match = levels.find((lvl) => score >= lvl.min && score <= lvl.max);
  if (match) {
    return {
      skor: score,
      kategori: match.kategori,
      grade: match.grade,
    };
  }
  const last = levels[levels.length - 1];
  return {
    skor: score,
    kategori: last.kategori,
    grade: last.grade,
  };
}

export function calculateDASS42(answers: Record<string | number, any>): DASS42CalculationResult {
  let skorDepresi = 0;
  let skorKecemasan = 0;
  let skorStres = 0;

  // Set lookup untuk efisiensi
  const depSet = new Set(DEPRESSION_ITEM_IDS);
  const anxSet = new Set(ANXIETY_ITEM_IDS);
  const strSet = new Set(STRESS_ITEM_IDS);

  // Deteksi apakah keys menggunakan indeks 0-based (0..41) atau nomor soal 1-based (1..42)
  const numKeys = Object.keys(answers).map(Number);
  const isZeroBased = numKeys.includes(0) && !numKeys.includes(42);

  Object.entries(answers).forEach(([key, val]) => {
    const numKey = Number(key);
    const questionNo = isZeroBased ? numKey + 1 : numKey;

    const bobot = typeof val === "number" ? val : Number(val?.bobot ?? val?.value ?? 0) || 0;

    if (depSet.has(questionNo)) {
      skorDepresi += bobot;
    } else if (anxSet.has(questionNo)) {
      skorKecemasan += bobot;
    } else if (strSet.has(questionNo)) {
      skorStres += bobot;
    }
  });

  const totalGPD = skorDepresi + skorKecemasan + skorStres;

  const depResult = resolveSubscale(skorDepresi, DASS42_DEPRESSION_LEVELS);
  const anxResult = resolveSubscale(skorKecemasan, DASS42_ANXIETY_LEVELS);
  const strResult = resolveSubscale(skorStres, DASS42_STRESS_LEVELS);

  const matchedGPD =
    DASS42_LEVELS.find((l) => totalGPD >= l.min && totalGPD <= l.max) ||
    DASS42_LEVELS[DASS42_LEVELS.length - 1];

  return {
    totalSkor: totalGPD,
    kategori: matchedGPD.kategori,
    grade: matchedGPD.grade,
    subscales: {
      depression: depResult,
      anxiety: anxResult,
      stress: strResult,
    },
  };
}
