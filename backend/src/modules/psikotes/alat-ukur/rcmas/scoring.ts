// ============================================================================
// MODUL SKORING RCMAS (Revised Children's Manifest Anxiety Scale)
// Dikembangkan oleh Reynolds & Richmond (1978) berdasarkan CMAS (1956)
// ============================================================================

// 1. Pemetaan 37 Item ke dalam Subskala sesuai Handout Resmi
export const RCMAS_PHYSIOLOGICAL_ITEMS = [1, 5, 9, 13, 17, 19, 21, 25, 29, 33]; // 10 butir
export const RCMAS_WORRY_ITEMS = [2, 6, 7, 10, 14, 18, 22, 26, 30, 34, 37];     // 11 butir
export const RCMAS_CONCENTRATION_ITEMS = [3, 11, 15, 23, 27, 31, 35];            // 7 butir
export const RCMAS_LIE_ITEMS = [4, 8, 12, 16, 20, 24, 28, 32, 36];               // 9 butir

export interface RCMASSubscaleResult {
  skor: number;
  total_item: number;
  nama: string;
  deskripsi: string;
}

export interface RCMASCalculationResult {
  totalSkor: number; // Total Anxiety Scale: 0–28 (Hanya akumulasi dari 28 item kecemasan)
  maxSkorAnxiety: number; // 28
  kategori: string;
  grade: "Kecemasan Normal" | "Kecemasan Signifikan Secara Klinis";
  isKlinisSignifikan: boolean; // Cut-off >= 19

  subscales: {
    physiological: RCMASSubscaleResult;
    worry: RCMASSubscaleResult;
    concentration: RCMASSubscaleResult;
  };

  lieScale: {
    skor: number; // 0–9
    total_item: number; // 9
    nama: string;
    deskripsi: string;
    catatan: string;
  };

  catatanKlinis: string[];
}

export const RCMAS_CLINICAL_CUTOFF = 19; // Cut-off score >= 19 dari 28

export function calculateRCMAS(
  answers: Record<string | number, any>
): RCMASCalculationResult {
  let skorPhysiological = 0;
  let skorWorry = 0;
  let skorConcentration = 0;
  let skorLie = 0;

  const physSet = new Set(RCMAS_PHYSIOLOGICAL_ITEMS);
  const worrySet = new Set(RCMAS_WORRY_ITEMS);
  const concSet = new Set(RCMAS_CONCENTRATION_ITEMS);
  const lieSet = new Set(RCMAS_LIE_ITEMS);

  // Deteksi toleransi index: 1-based (1..37) atau 0-based (0..36)
  const numKeys = Object.keys(answers).map(Number);
  const isZeroBased = numKeys.includes(0) && !numKeys.includes(37);

  for (let no = 1; no <= 37; no++) {
    const key = isZeroBased ? no - 1 : no;
    const rawVal = answers[key] ?? answers[String(key)];
    const val = typeof rawVal === "number" ? rawVal : Number(rawVal?.bobot ?? rawVal?.value ?? 0) || 0;
    // Opsi RCMAS: Ya = 1, Tidak = 0
    const point = val === 1 ? 1 : 0;

    if (physSet.has(no)) {
      skorPhysiological += point;
    } else if (worrySet.has(no)) {
      skorWorry += point;
    } else if (concSet.has(no)) {
      skorConcentration += point;
    } else if (lieSet.has(no)) {
      skorLie += point;
    }
  }

  // Total Skor Kecemasan (Anxiety Scale) MURNI dari 28 butir (skor 0–28)
  const totalAnxietyScore = skorPhysiological + skorWorry + skorConcentration;
  const isKlinisSignifikan = totalAnxietyScore >= RCMAS_CLINICAL_CUTOFF;

  const grade = isKlinisSignifikan
    ? ("Kecemasan Signifikan Secara Klinis" as const)
    : ("Kecemasan Normal" as const);

  const kategori = isKlinisSignifikan
    ? "Tingkat Kecemasan Signifikan Secara Klinis (Perlu Perhatian)"
    : "Tingkat Kecemasan Berada dalam Rentang Wajar/Normal";

  const catatanKlinis: string[] = [];
  if (isKlinisSignifikan) {
    catatanKlinis.push(
      `Skor kecemasan (${totalAnxietyScore}/28) mencapai cut-off klinis ≥19, mengindikasikan kecemasan yang signifikan dan disarankan untuk evaluasi lebih lanjut oleh profesional psikolog.`
    );
  } else {
    catatanKlinis.push(
      `Skor kecemasan (${totalAnxietyScore}/28) berada di bawah cut-off klinis (<19), menunjukkan tingkat kecemasan yang relatif terkendali.`
    );
  }

  return {
    totalSkor: totalAnxietyScore,
    maxSkorAnxiety: 28,
    kategori,
    grade,
    isKlinisSignifikan,
    subscales: {
      physiological: {
        skor: skorPhysiological,
        total_item: 10,
        nama: "The Physiological Factor",
        deskripsi:
          "Menunjukkan tanda-tanda fisiologis kecemasan pada individu (misalnya tangan berkeringat, sakit perut, kesulitan tidur).",
      },
      worry: {
        skor: skorWorry,
        total_item: 11,
        nama: "The Worry/Oversensitivity Factor",
        deskripsi:
          "Menunjukkan kecenderungan menginternalisasi pengalaman kecemasan, mudah merasa kewalahan, tersinggung, dan menarik diri.",
      },
      concentration: {
        skor: skorConcentration,
        total_item: 7,
        nama: "The Concentration Anxiety Factor",
        deskripsi:
          "Menunjukkan perasaan tidak mampu memenuhi harapan orang lain, merasa tidak cukup, dan kesulitan memusatkan konsentrasi.",
      },
    },
    lieScale: {
      skor: skorLie,
      total_item: 9,
      nama: "Lie Scale (Social Desirability Scale)",
      deskripsi:
        "Skor pada Lie Scale dianggap sebagai skala keinginan sosial (social desirability), bukan untuk mendeteksi kebohongan secara langsung.",
      catatan:
        "Skor mentah Lie Scale disimpan apa adanya untuk referensi profesional psikolog tanpa pembagian kategori bertingkat.",
    },
    catatanKlinis,
  };
}

