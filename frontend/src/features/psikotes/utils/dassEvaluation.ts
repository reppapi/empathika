export interface DASSSubscaleItem {
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  grade: "Normal" | "Ringan" | "Sedang" | "Berat" | "Sangat Berat";
  kategori: string;
  deskripsi: string;
  badgeBg: string;
  badgeText: string;
  barColor: string;
}

export interface DASSEvaluationResult {
  isDASS: boolean;
  totalGPD: number;
  gpdMaxScore: number;
  gpdGrade: string;
  gpdKategori: string;
  depression: DASSSubscaleItem;
  anxiety: DASSSubscaleItem;
  stress: DASSSubscaleItem;
  subscalesList: DASSSubscaleItem[];
}

export function evaluateDASS(
  rawTotalGPD?: number | null,
  rawDep?: number | null,
  rawAnx?: number | null,
  rawStr?: number | null
): DASSEvaluationResult {
  const depScore = Math.max(0, Math.min(42, Number(rawDep) || 0));
  const anxScore = Math.max(0, Math.min(42, Number(rawAnx) || 0));
  const strScore = Math.max(0, Math.min(42, Number(rawStr) || 0));
  
  // Total GPD: jika dep/anx/str tersedia, gunakan penjumlahannya; jika tidak, gunakan rawTotalGPD
  const calculatedTotal = depScore + anxScore + strScore;
  const totalGPD =
    calculatedTotal > 0
      ? calculatedTotal
      : Math.max(0, Math.min(126, Number(rawTotalGPD) || 0));

  // 1. Depresi (0–42) — Tema Warna: Biru / Indigo (Blue)
  let depGrade: DASSSubscaleItem["grade"] = "Normal";
  let depKategori = "Normal";
  let depDeskripsi = "Suasana hati dan tingkat antusiasme berada dalam rentang wajar dan stabil.";
  const depBarColor = "bg-blue-500";
  let depBadgeBg = "bg-blue-50";
  let depBadgeText = "text-blue-700";

  if (depScore <= 9) {
    depGrade = "Normal";
    depKategori = "Normal";
    depDeskripsi = "Suasana hati dan tingkat antusiasme berada dalam rentang wajar dan stabil.";
    depBadgeBg = "bg-blue-50";
    depBadgeText = "text-blue-700";
  } else if (depScore <= 13) {
    depGrade = "Ringan";
    depKategori = "Depresi Ringan";
    depDeskripsi = "Mengalami penurunan suasana hati dan kehilangan minat ringan pada beberapa aktivitas harian.";
    depBadgeBg = "bg-blue-100";
    depBadgeText = "text-blue-800";
  } else if (depScore <= 20) {
    depGrade = "Sedang";
    depKategori = "Depresi Sedang";
    depDeskripsi = "Mengalami gejala depresi tingkat sedang, seperti merasa kurang berharga, sedih, dan sulit berinisiatif.";
    depBadgeBg = "bg-blue-100";
    depBadgeText = "text-blue-900";
  } else if (depScore <= 27) {
    depGrade = "Berat";
    depKategori = "Depresi Berat";
    depDeskripsi = "Gejala depresi berat terdeteksi; perasaan putus asa, kehilangan motivasi, dan kesedihan mendalam mulai mengganggu fungsi harian secara signifikan.";
    depBadgeBg = "bg-blue-200/80";
    depBadgeText = "text-blue-950";
  } else {
    depGrade = "Sangat Berat";
    depKategori = "Depresi Sangat Berat";
    depDeskripsi = "Gejala depresi sangat intens dan memerlukan pendampingan serta evaluasi klinis profesional sesegera mungkin.";
    depBadgeBg = "bg-blue-200";
    depBadgeText = "text-blue-950";
  }

  // 2. Kecemasan (0–42) — Tema Warna: Amber / Kuning-Oranye (Amber)
  let anxGrade: DASSSubscaleItem["grade"] = "Normal";
  let anxKategori = "Normal";
  let anxDeskripsi = "Tingkat reaksi fisiologis dan kecemasan berada dalam batas wajar.";
  const anxBarColor = "bg-amber-500";
  let anxBadgeBg = "bg-amber-50";
  let anxBadgeText = "text-amber-700";

  if (anxScore <= 7) {
    anxGrade = "Normal";
    anxKategori = "Normal";
    anxDeskripsi = "Tingkat reaksi fisiologis dan kecemasan berada dalam batas wajar.";
    anxBadgeBg = "bg-amber-50";
    anxBadgeText = "text-amber-700";
  } else if (anxScore <= 9) {
    anxGrade = "Ringan";
    anxKategori = "Kecemasan Ringan";
    anxDeskripsi = "Merasakan sedikit ketegangan fisik atau kekhawatiran sesaat pada situasi tertentu.";
    anxBadgeBg = "bg-amber-100";
    anxBadgeText = "text-amber-800";
  } else if (anxScore <= 14) {
    anxGrade = "Sedang";
    anxKategori = "Kecemasan Sedang";
    anxDeskripsi = "Muncul gejala kecemasan seperti detak jantung meningkat, gemetar ringan, atau rasa cemas berlebih.";
    anxBadgeBg = "bg-amber-100";
    anxBadgeText = "text-amber-900";
  } else if (anxScore <= 19) {
    anxGrade = "Berat";
    anxKategori = "Kecemasan Berat";
    anxDeskripsi = "Mengalami reaksi kecemasan fisik dan kepanikan yang intens serta sulit dikendalikan.";
    anxBadgeBg = "bg-amber-200/80";
    anxBadgeText = "text-amber-950";
  } else {
    anxGrade = "Sangat Berat";
    anxKategori = "Kecemasan Sangat Berat";
    anxDeskripsi = "Reaksi kecemasan ekstrem dan kepanikan akut yang sangat membebani aktivitas dan membutuhkan intervensi profesional.";
    anxBadgeBg = "bg-amber-200";
    anxBadgeText = "text-amber-950";
  }

  // 3. Stres (0–42) — Tema Warna: Rose / Merah-Muda Kemerahan (Rose)
  let strGrade: DASSSubscaleItem["grade"] = "Normal";
  let strKategori = "Normal";
  let strDeskripsi = "Kemampuan mentoleransi tekanan dan menjaga ketenangan berada dalam rentang baik.";
  const strBarColor = "bg-rose-500";
  let strBadgeBg = "bg-rose-50";
  let strBadgeText = "text-rose-700";

  if (strScore <= 14) {
    strGrade = "Normal";
    strKategori = "Normal";
    strDeskripsi = "Kemampuan mentoleransi tekanan dan menjaga ketenangan berada dalam rentang baik.";
    strBadgeBg = "bg-rose-50";
    strBadgeText = "text-rose-700";
  } else if (strScore <= 18) {
    strGrade = "Ringan";
    strKategori = "Stres Ringan";
    strDeskripsi = "Mengalami sedikit ketegangan dan rasa tidak sabar terhadap beberapa pemicu harian.";
    strBadgeBg = "bg-rose-100";
    strBadgeText = "text-rose-800";
  } else if (strScore <= 25) {
    strGrade = "Sedang";
    strKategori = "Stres Sedang";
    strDeskripsi = "Tingkat stres sedang; cenderung mudah tersinggung, tegang, dan sulit untuk relaks.";
    strBadgeBg = "bg-rose-100";
    strBadgeText = "text-rose-900";
  } else if (strScore <= 33) {
    strGrade = "Berat";
    strKategori = "Stres Berat";
    strDeskripsi = "Tingkat stres tinggi dengan kelelahan mental, mudah marah, dan reaksi berlebih yang menguras energi.";
    strBadgeBg = "bg-rose-200/80";
    strBadgeText = "text-rose-950";
  } else {
    strGrade = "Sangat Berat";
    strKategori = "Stres Sangat Berat";
    strDeskripsi = "Kondisi stres ekstrem yang berisiko memicu kelelahan mental menyeluruh (burnout kronis).";
    strBadgeBg = "bg-rose-200";
    strBadgeText = "text-rose-950";
  }

  // Total Skor DASS-42 (0–126)
  let gpdGrade = "Normal";
  let gpdKategori = "Kondisi Emosional Normal";

  if (totalGPD <= 30) {
    gpdGrade = "Normal";
    gpdKategori = "Kondisi Emosional Normal";
  } else if (totalGPD <= 40) {
    gpdGrade = "Ringan";
    gpdKategori = "Kondisi Emosional Ringan";
  } else if (totalGPD <= 60) {
    gpdGrade = "Sedang";
    gpdKategori = "Kondisi Emosional Sedang";
  } else if (totalGPD <= 70) {
    gpdGrade = "Berat";
    gpdKategori = "Kondisi Emosional Berat";
  } else {
    gpdGrade = "Sangat Berat";
    gpdKategori = "Kondisi Emosional Sangat Berat";
  }

  const depressionItem: DASSSubscaleItem = {
    name: "Depresi",
    score: depScore,
    maxScore: 42,
    percentage: Math.round((depScore / 42) * 100),
    grade: depGrade,
    kategori: depKategori,
    deskripsi: depDeskripsi,
    badgeBg: depBadgeBg,
    badgeText: depBadgeText,
    barColor: depBarColor,
  };

  const anxietyItem: DASSSubscaleItem = {
    name: "Kecemasan",
    score: anxScore,
    maxScore: 42,
    percentage: Math.round((anxScore / 42) * 100),
    grade: anxGrade,
    kategori: anxKategori,
    deskripsi: anxDeskripsi,
    badgeBg: anxBadgeBg,
    badgeText: anxBadgeText,
    barColor: anxBarColor,
  };

  const stressItem: DASSSubscaleItem = {
    name: "Stres",
    score: strScore,
    maxScore: 42,
    percentage: Math.round((strScore / 42) * 100),
    grade: strGrade,
    kategori: strKategori,
    deskripsi: strDeskripsi,
    badgeBg: strBadgeBg,
    badgeText: strBadgeText,
    barColor: strBarColor,
  };

  return {
    isDASS: true,
    totalGPD,
    gpdMaxScore: 126,
    gpdGrade,
    gpdKategori,
    depression: depressionItem,
    anxiety: anxietyItem,
    stress: stressItem,
    subscalesList: [depressionItem, anxietyItem, stressItem],
  };
}

