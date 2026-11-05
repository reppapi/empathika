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
  headline: string;
  introText: string;
  prominentDimension: "depression" | "anxiety" | "stress" | "balanced" | "all_normal";
  depression: DASSSubscaleItem;
  anxiety: DASSSubscaleItem;
  stress: DASSSubscaleItem;
  subscalesList: DASSSubscaleItem[];
  tips: Array<{ title: string; desc: string }>;
}

/**
 * Menghitung persentase visual bar proporsional berbasis 5 zona keparahan klinis.
 * Membagi panjang bar menjadi 5 segmen setara (masing-masing 20%):
 * - Zona 1: Normal       (0% - 20%)
 * - Zona 2: Ringan       (20% - 40%)
 * - Zona 3: Sedang       (40% - 60%)
 * - Zona 4: Berat        (60% - 80%)
 * - Zona 5: Sangat Berat (80% - 100%)
 */
function getClinicalSeverityPercentage(
  score: number,
  levels: { normalMax: number; ringanMax: number; sedangMax: number; beratMax: number }
): number {
  if (score <= 0) return 0;

  if (score <= levels.normalMax) {
    // Zona 1: Normal (0% - 20%)
    return Math.round((score / levels.normalMax) * 20);
  } else if (score <= levels.ringanMax) {
    // Zona 2: Ringan (20% - 40%)
    const span = levels.ringanMax - levels.normalMax;
    const ratio = span > 0 ? (score - levels.normalMax) / span : 0;
    return Math.round(20 + ratio * 20);
  } else if (score <= levels.sedangMax) {
    // Zona 3: Sedang (40% - 60%)
    const span = levels.sedangMax - levels.ringanMax;
    const ratio = span > 0 ? (score - levels.ringanMax) / span : 0;
    return Math.round(40 + ratio * 20);
  } else if (score <= levels.beratMax) {
    // Zona 4: Berat (60% - 80%)
    const span = levels.beratMax - levels.sedangMax;
    const ratio = span > 0 ? (score - levels.sedangMax) / span : 0;
    return Math.round(60 + ratio * 20);
  } else {
    // Zona 5: Sangat Berat (80% - 100%)
    const span = 42 - levels.beratMax;
    const ratio = span > 0 ? Math.min(1, (score - levels.beratMax) / span) : 1;
    return Math.round(80 + ratio * 20);
  }
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

  const calculatedTotal = depScore + anxScore + strScore;
  const totalGPD =
    calculatedTotal > 0
      ? calculatedTotal
      : Math.max(0, Math.min(126, Number(rawTotalGPD) || 0));

  // 1. Depresi (0–42)
  let depGrade: DASSSubscaleItem["grade"] = "Normal";
  let depKategori = "Normal";
  let depDeskripsi = "Tingkat depresi kamu berada dalam batas normal. Suasana hati, motivasi, dan antusiasme kamu berada dalam rentang wajar dan stabil.";

  if (depScore <= 9) {
    depGrade = "Normal";
    depKategori = "Normal";
    depDeskripsi = "Tingkat depresi kamu berada dalam batas normal. Suasana hati, motivasi, dan antusiasme kamu berada dalam rentang wajar dan stabil.";
  } else if (depScore <= 13) {
    depGrade = "Ringan";
    depKategori = "Depresi Ringan";
    depDeskripsi = "Tingkat depresi kamu berada pada level ringan. Mengalami sedikit penurunan suasana hati dan kehilangan minat ringan pada beberapa aktivitas harian.";
  } else if (depScore <= 20) {
    depGrade = "Sedang";
    depKategori = "Depresi Sedang";
    depDeskripsi = "Tingkat depresi kamu berada pada level sedang. Merasakan kesedihan yang cukup membebani, penurunan inisiatif, dan rasa kurang bersemangat menjalani rutinitas.";
  } else if (depScore <= 27) {
    depGrade = "Berat";
    depKategori = "Depresi Berat";
    depDeskripsi = "Tingkat depresi kamu tergolong berat. Perasaan hampa, putus asa, dan kehilangan minat yang mendalam mulai mengganggu fungsi aktivitas sehari-hari.";
  } else {
    depGrade = "Sangat Berat";
    depKategori = "Depresi Sangat Berat";
    depDeskripsi = "Tingkat depresi kamu tergolong sangat berat. Beban suasana hati sangat intens dan memerlukan pendampingan profesional dari psikolog sesegera mungkin.";
  }

  // 2. Kecemasan (0–42)
  let anxGrade: DASSSubscaleItem["grade"] = "Normal";
  let anxKategori = "Normal";
  let anxDeskripsi = "Tingkat kecemasan kamu berada dalam batas normal. Respon kewaspadaan dan ketenangan tubuhmu berada dalam batas wajar dan terkendali.";

  if (anxScore <= 7) {
    anxGrade = "Normal";
    anxKategori = "Normal";
    anxDeskripsi = "Tingkat kecemasan kamu berada dalam batas normal. Respon kewaspadaan dan ketenangan tubuhmu berada dalam batas wajar dan terkendali.";
  } else if (anxScore <= 9) {
    anxGrade = "Ringan";
    anxKategori = "Kecemasan Ringan";
    anxDeskripsi = "Tingkat kecemasan kamu berada pada level ringan. Terkadang muncul sedikit rasa was-was atau ketegangan fisik sesaat pada situasi tertentu.";
  } else if (anxScore <= 14) {
    anxGrade = "Sedang";
    anxKategori = "Kecemasan Sedang";
    anxDeskripsi = "Tingkat kecemasan kamu berada pada level sedang. Muncul reaksi kecemasan seperti detak jantung meningkat, gemetar ringan, atau kekhawatiran yang sulit dialihkan.";
  } else if (anxScore <= 19) {
    anxGrade = "Berat";
    anxKategori = "Kecemasan Berat";
    anxDeskripsi = "Tingkat kecemasan kamu tergolong berat. Reaksi cemas fisik dan perasaan hampir panik cukup intens serta mulai membatasi kenyamanan beraktivitas.";
  } else {
    anxGrade = "Sangat Berat";
    anxKategori = "Kecemasan Sangat Berat";
    anxDeskripsi = "Tingkat kecemasan kamu tergolong sangat berat. Reaksi kepanikan akut dan ketakutan intens yang memerlukan evaluasi serta pendampingan psikologis klinis.";
  }

  // 3. Stres (0–42)
  let strGrade: DASSSubscaleItem["grade"] = "Normal";
  let strKategori = "Normal";
  let strDeskripsi = "Tingkat stres kamu berada dalam batas normal. Kemampuan mengelola tekanan, menjaga ketenangan, dan kesabaran berada dalam kondisi baik.";

  if (strScore <= 14) {
    strGrade = "Normal";
    strKategori = "Normal";
    strDeskripsi = "Tingkat stres kamu berada dalam batas normal. Kemampuan mengelola tekanan, menjaga ketenangan, dan kesabaran berada dalam kondisi baik.";
  } else if (strScore <= 18) {
    strGrade = "Ringan";
    strKategori = "Stres Ringan";
    strDeskripsi = "Tingkat stres kamu berada pada level ringan. Mengalami sedikit ketegangan dan rasa tidak sabar terhadap beberapa pemicu aktivitas sehari-hari.";
  } else if (strScore <= 25) {
    strGrade = "Sedang";
    strKategori = "Stres Sedang";
    strDeskripsi = "Tingkat stres kamu berada pada level sedang. Cenderung mudah tersinggung, tegang, dan membutuhkan waktu lebih lama untuk relaks.";
  } else if (strScore <= 33) {
    strGrade = "Berat";
    strKategori = "Stres Berat";
    strDeskripsi = "Tingkat stres kamu tergolong berat. Tingkat ketegangan tinggi dengan kelelahan mental, mudah marah, dan reaksi berlebih yang menguras energi.";
  } else {
    strGrade = "Sangat Berat";
    strKategori = "Stres Sangat Berat";
    strDeskripsi = "Tingkat stres kamu tergolong sangat berat. Ketegangan stres sangat tinggi dan berisiko memicu kelelahan mental menyeluruh (burnout kronis).";
  }

  // Hitung persentase visual bar yang proporsional sesuai rentang klinis masing-masing
  const depPercentage = getClinicalSeverityPercentage(depScore, {
    normalMax: 9,
    ringanMax: 13,
    sedangMax: 20,
    beratMax: 27,
  });

  const anxPercentage = getClinicalSeverityPercentage(anxScore, {
    normalMax: 7,
    ringanMax: 9,
    sedangMax: 14,
    beratMax: 19,
  });

  const strPercentage = getClinicalSeverityPercentage(strScore, {
    normalMax: 14,
    ringanMax: 18,
    sedangMax: 25,
    beratMax: 33,
  });

  const depressionItem: DASSSubscaleItem = {
    name: "Depresi",
    score: depScore,
    maxScore: 42,
    percentage: depPercentage,
    grade: depGrade,
    kategori: depKategori,
    deskripsi: depDeskripsi,
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
    barColor: "bg-blue-500",
  };

  const anxietyItem: DASSSubscaleItem = {
    name: "Kecemasan",
    score: anxScore,
    maxScore: 42,
    percentage: anxPercentage,
    grade: anxGrade,
    kategori: anxKategori,
    deskripsi: anxDeskripsi,
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    barColor: "bg-amber-500",
  };

  const stressItem: DASSSubscaleItem = {
    name: "Stres",
    score: strScore,
    maxScore: 42,
    percentage: strPercentage,
    grade: strGrade,
    kategori: strKategori,
    deskripsi: strDeskripsi,
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-700",
    barColor: "bg-rose-500",
  };

  // 4. Tentukan Dimensi Paling Menonjol & Susun Tips yang Relevan (Industry Standard)
  const gradeWeight: Record<DASSSubscaleItem["grade"], number> = {
    Normal: 0,
    Ringan: 1,
    Sedang: 2,
    Berat: 3,
    "Sangat Berat": 4,
  };

  const depWeight = gradeWeight[depGrade];
  const anxWeight = gradeWeight[anxGrade];
  const strWeight = gradeWeight[strGrade];
  const maxWeight = Math.max(depWeight, anxWeight, strWeight);

  let prominentDimension: DASSEvaluationResult["prominentDimension"] = "all_normal";
  const tailoredTips: Array<{ title: string; desc: string }> = [];

  if (maxWeight === 0) {
    prominentDimension = "all_normal";
    tailoredTips.push(
      {
        title: "Pertahankan Pola Hidup Seimbang",
        desc: "Jaga rutinitas tidur 7-8 jam, konsumsi makanan bernutrisi, dan luangkan waktu olahraga teratur untuk menjaga kestabilan energi harian.",
      },
      {
        title: "Alokasikan Waktu Berkualitas untuk Rekreasi",
        desc: "Lakukan aktivitas atau hobi yang kamu nikmati setiap minggunya untuk mengisi ulang energi positif batin.",
      },
      {
        title: "Pelihara Hubungan Sosial yang Hangat",
        desc: "Jalin komunikasi rutin bersama sahabat atau keluarga terdekat yang menjadi support system suportifmu.",
      }
    );
  } else {
    // Prioritaskan tips sesuai dimensi dengan tingkat keparahan tertinggi
    if (anxWeight === maxWeight) {
      prominentDimension = "anxiety";
      tailoredTips.push(
        {
          title: "Praktikkan Latihan Pernapasan Dalam (Teknik 4-7-8)",
          desc: "Tarik napas perlahan lewat hidung selama 4 hitungan, tahan 7 hitungan, lalu hembuskan lewat mulut selama 8 hitungan untuk menenangkan sistem saraf.",
        },
        {
          title: "Gunakan Teknik Grounding 5-4-3-2-1",
          desc: "Saat merasa cemas atau kewalahan, sebutkan 5 benda yang kamu lihat, 4 hal yang bisa disentuh, 3 suara yang didengar, 2 aroma yang dicium, dan 1 rasa yang dikecap.",
        },
        {
          title: "Batasi Stimulan & Buat Transisi Tenang",
          desc: "Kurangi konsumsi kafein berlebih dan beri jeda 30 menit sebelum tidur tanpa paparan layar gadget.",
        }
      );
    } else if (depWeight === maxWeight) {
      prominentDimension = "depression";
      tailoredTips.push(
        {
          title: "Mulai dari Langkah-Langkah Kecil (Micro-Steps)",
          desc: "Pecah tugas besar menjadi hal kecil berdurasi 5-10 menit. Menyelesaikan satu hal sederhana dapat membantu memicu kembali rasa percaya diri dan motivasi.",
        },
        {
          title: "Dapatkan Sinar Matahari Pagi & Gerak Tubuh Ringan",
          desc: "Berjalan santai 10-15 menit di pagi hari membantu merangsang pelepasan endorfin dan serotonin alami di otak.",
        },
        {
          title: "Ceritakan Apa yang Kamu Rasakan",
          desc: "Jangan memendam perasaan sendirian. Berbagi cerita dengan orang terpercaya atau psikolog dapat meringankan beban pikiranmu secara signifikan.",
        }
      );
    } else {
      prominentDimension = "stress";
      tailoredTips.push(
        {
          title: "Atur Batasan & Fokus pada Hal yang Bisa Dikendalikan",
          desc: "Petakan hal-hal yang membuatmu tertekan. Fokuskan energi pada apa yang berada di dalam kendalimu dan beranilah berkata tidak pada tuntutan yang berlebih.",
        },
        {
          title: "Ambil Jeda Istirahat Berkala (Metode Pomodoro)",
          desc: "Bekerja atau belajarlah selama 25 menit lalu ambil istirahat 5 menit untuk peregangan otot dan minum air putih agar pikiran tetap segar.",
        },
        {
          title: "Tuangkan Beban Pikiran Lewat Jurnal (Brain Dump)",
          desc: "Tuliskan semua hal yang sedang membebanimu di kertas sebelum tidur untuk membebaskan ruang mental dari overthinking.",
        }
      );
    }
  }

  return {
    isDASS: true,
    totalGPD,
    gpdMaxScore: 126,
    headline: "Profil Kesehatan Emosional",
    introText:
      "Berdasarkan apa yang kamu rasakan dalam satu minggu terakhir, berikut adalah gambaran kondisi emosionalmu pada 3 dimensi utama: Depresi, Kecemasan, dan Stres.",
    prominentDimension,
    depression: depressionItem,
    anxiety: anxietyItem,
    stress: stressItem,
    subscalesList: [depressionItem, anxietyItem, stressItem],
    tips: tailoredTips,
  };
}
