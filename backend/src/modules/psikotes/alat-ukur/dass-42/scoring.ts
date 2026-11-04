import {
  DEPRESSION_ITEM_IDS,
  ANXIETY_ITEM_IDS,
  STRESS_ITEM_IDS,
} from "./questions";

export interface SubscaleResult {
  skor: number;
  kategori: string;
  grade: string;
  deskripsi: string;
}

export interface DASS42CalculationResult {
  totalSkor: number; // General Psychological Distress (GPD)
  kategori: string;
  grade: string;
  deskripsi: string;
  subscales: {
    depression: SubscaleResult;
    anxiety: SubscaleResult;
    stress: SubscaleResult;
  };
  saran: string[];
}

// ── Kategori Subskala Depresi ────────────────────────────────────────────────
export const DASS42_DEPRESSION_LEVELS = [
  {
    min: 0,
    max: 9,
    grade: "Normal",
    kategori: "Normal",
    deskripsi: "Suasana hati dan tingkat antusiasme berada dalam rentang normal dan stabil.",
  },
  {
    min: 10,
    max: 13,
    grade: "Ringan",
    kategori: "Depresi Ringan",
    deskripsi: "Mengalami penurunan suasana hati dan kehilangan minat ringan pada beberapa aktivitas harian.",
  },
  {
    min: 14,
    max: 20,
    grade: "Sedang",
    kategori: "Depresi Sedang",
    deskripsi: "Mengalami gejala depresi tingkat sedang, seperti merasa kurang berharga, sedih, dan sulit berinisiatif.",
  },
  {
    min: 21,
    max: 27,
    grade: "Berat",
    kategori: "Depresi Berat",
    deskripsi: "Gejala depresi berat terdeteksi; perasaan putus asa, kehilangan motivasi, dan kesedihan mendalam mulai mengganggu fungsi harian secara signifikan.",
  },
  {
    min: 28,
    max: 42,
    grade: "Sangat Berat",
    kategori: "Depresi Sangat Berat",
    deskripsi: "Gejala depresi sangat intens dan membutuhkan pendampingan serta evaluasi klinis profesional sesegera mungkin.",
  },
];

// ── Kategori Subskala Kecemasan ───────────────────────────────────────────────
export const DASS42_ANXIETY_LEVELS = [
  {
    min: 0,
    max: 7,
    grade: "Normal",
    kategori: "Normal",
    deskripsi: "Tingkat reaksi fisiologis dan kecemasan berada dalam batas wajar.",
  },
  {
    min: 8,
    max: 9,
    grade: "Ringan",
    kategori: "Kecemasan Ringan",
    deskripsi: "Merasakan sedikit ketegangan fisik atau kekhawatiran sesaat pada situasi tertentu.",
  },
  {
    min: 10,
    max: 14,
    grade: "Sedang",
    kategori: "Kecemasan Sedang",
    deskripsi: "Muncul gejala kecemasan seperti detak jantung meningkat, gemetar ringan, atau rasa cemas berlebih.",
  },
  {
    min: 15,
    max: 19,
    grade: "Berat",
    kategori: "Kecemasan Berat",
    deskripsi: "Mengalami reaksi kecemasan fisik dan kepanikan yang intens serta sulit dikendalikan.",
  },
  {
    min: 20,
    max: 42,
    grade: "Sangat Berat",
    kategori: "Kecemasan Sangat Berat",
    deskripsi: "Reaksi kecemasan ekstrem dan kepanikan akut yang sangat membebani aktivitas dan membutuhkan intervensi profesional.",
  },
];

// ── Kategori Subskala Stres ──────────────────────────────────────────────────
export const DASS42_STRESS_LEVELS = [
  {
    min: 0,
    max: 14,
    grade: "Normal",
    kategori: "Normal",
    deskripsi: "Kemampuan mentoleransi tekanan dan menjaga ketenangan berada dalam rentang baik.",
  },
  {
    min: 15,
    max: 18,
    grade: "Ringan",
    kategori: "Stres Ringan",
    deskripsi: "Mengalami sedikit ketegangan dan rasa tidak sabar terhadap beberapa pemicu harian.",
  },
  {
    min: 19,
    max: 25,
    grade: "Sedang",
    kategori: "Stres Sedang",
    deskripsi: "Tingkat stres sedang; cenderung mudah tersinggung, tegang, dan sulit untuk relaks.",
  },
  {
    min: 26,
    max: 33,
    grade: "Berat",
    kategori: "Stres Berat",
    deskripsi: "Tingkat stres tinggi dengan kelelahan mental, mudah marah, dan reaksi berlebih yang menguras energi.",
  },
  {
    min: 34,
    max: 42,
    grade: "Sangat Berat",
    kategori: "Stres Sangat Berat",
    deskripsi: "Kondisi stres ekstrem yang berisiko memicu kelelahan mental menyeluruh (burnout kronis).",
  },
];

// ── Kategori Tingkat Kesehatan Emosional DASS-42 (Total Skor 0–126) ────────────
export const DASS42_LEVELS = [
  {
    min: 0,
    max: 30,
    grade: "Normal",
    kategori: "Kondisi Emosional Normal",
    deskripsi:
      "Kondisi kesehatan emosional secara umum berada dalam batas normal. Keseimbangan suasana hati dan daya lenting (resiliensi) terhadap tekanan sehari-hari terjaga dengan baik.",
    saran: [
      "Pertahankan rutinitas istirahat, olahraga, dan nutrisi seimbang.",
      "Lakukan aktivitas rekreasional yang menyenangkan secara teratur.",
      "Jaga koneksi sosial yang hangat bersama sahabat dan keluarga.",
    ],
  },
  {
    min: 31,
    max: 40,
    grade: "Ringan",
    kategori: "Kondisi Emosional Ringan",
    deskripsi:
      "Terdeteksi adanya ketegangan emosional tingkat ringan. Kamu mungkin sedang mengalami beban pikiran atau kelelahan situasional yang memicu sedikit rasa lelah secara mental.",
    saran: [
      "Ambil jeda istirahat sejenak dari rutinitas yang menguras energi mental.",
      "Praktikkan latihan pernapasan dalam, relaksasi otot, atau journaling emosi.",
      "Ceritakan hal yang membebanimu kepada teman atau keluarga terpercaya.",
    ],
  },
  {
    min: 41,
    max: 60,
    grade: "Sedang",
    kategori: "Kondisi Emosional Sedang",
    deskripsi:
      "Kondisi emosional berada pada tingkat sedang. Kombinasi perubahan suasana hati, kecemasan, atau ketegangan mulai mempengaruhi kenyamanan aktivitas harian.",
    saran: [
      "Prioritaskan manajemen stres dan atur batasan beban kerja yang realistis.",
      "Hindari memendam beban sendirian dan kurangi overthinking dengan aktivitas terarah.",
      "Sangat disarankan berkonsultasi dengan psikolog profesional Empathika untuk memetakan pemicunya.",
    ],
  },
  {
    min: 61,
    max: 70,
    grade: "Berat",
    kategori: "Kondisi Emosional Berat",
    deskripsi:
      "Terdeteksi beban emosional yang cukup berat. Tekanan yang dialami cukup intens dan dapat mengganggu konsentrasi, produktivitas, maupun kenyamanan relasi sosial.",
    saran: [
      "Jadwalkan sesi konsultasi dan konseling komprehensif bersama psikolog profesional.",
      "Kurangi tuntutan tinggi dan mintalah dukungan dari support system terdekat.",
      "Fokus pada perawatan diri mendasar (pola tidur, makan teratur, dan lingkungan tenang).",
    ],
  },
  {
    min: 71,
    max: 126,
    grade: "Sangat Berat",
    kategori: "Kondisi Emosional Sangat Berat",
    deskripsi:
      "Kondisi emosional berada pada tingkat sangat intens. Kondisi ini memerlukan perhatian dan pendampingan psikologis profesional demi memulihkan kestabilan mental dan kenyamanan diri.",
    saran: [
      "Segera hubungi psikolog profesional atau layanan kesehatan mental terdekat untuk mendapatkan pendampingan klinis yang tepat.",
      "Jangan ragu meminta bantuan orang terdekat untuk mendampingimu dalam menjalani masa sulit ini.",
      "Empathika menyediakan ruang konsultasi privat dan aman bersama psikolog terpercaya.",
    ],
  },
];

function resolveSubscale(score: number, levels: Array<{ min: number; max: number; grade: string; kategori: string; deskripsi: string }>): SubscaleResult {
  const match = levels.find((lvl) => score >= lvl.min && score <= lvl.max);
  if (match) {
    return {
      skor: score,
      kategori: match.kategori,
      grade: match.grade,
      deskripsi: match.deskripsi,
    };
  }
  const last = levels[levels.length - 1];
  return {
    skor: score,
    kategori: last.kategori,
    grade: last.grade,
    deskripsi: last.deskripsi,
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
    deskripsi: matchedGPD.deskripsi,
    subscales: {
      depression: depResult,
      anxiety: anxResult,
      stress: strResult,
    },
    saran: matchedGPD.saran,
  };
}

