/** Modul kalkulasi dan interpretasi skoring Child and Adolescent Trauma Screen (CATS). */

export interface CATSSubscaleResult {
  kode: string;
  nama: string;
  skor: number;
  skorMax: number;
  persentase: number;
  keterangan: string;
  gejalaTerpenuhi: number; // Jumlah butir dengan skor >= 2
}

export interface CATSPTEResult {
  totalDialami: number;
  daftarPeristiwa: Array<{ no: number; teks: string }>;
  peristiwaPalingMengganggu?: string | null;
  peristiwaLainnya?: string | null;
}

export interface CATSFungsiPsikososialResult {
  totalTerganggu: number;
  aspek: {
    pergaulan: boolean;
    hobi: boolean;
    sekolah: boolean;
    keluarga: boolean;
    kebahagiaanUmum: boolean;
  };
  rincian: Array<{ nama: string; terganggu: boolean }>;
}

export interface CATSDSMCriteriaEvaluation {
  kriteriaA_PTE: boolean; // Minimal 1 PTE dialami
  kriteriaB_Intrusion: boolean; // Minimal 1 gejala Intrusi skor >= 2
  kriteriaC_Avoidance: boolean; // Minimal 1 gejala Penghindaran skor >= 2
  kriteriaD_CognitionMood: boolean; // Minimal 2 gejala Kognisi & Mood skor >= 2
  kriteriaE_Arousal: boolean; // Minimal 2 gejala Hyperarousal skor >= 2
  kriteriaF_Impairment: boolean; // Minimal 1 aspek fungsi terganggu
  memenuhiKriteriaGejalaDSM5: boolean; // B, C, D, dan E terpenuhi
}

export interface CATSCalculationResult {
  totalSkor: number; // 0 – 60 (hanya dari 20 butir gejala PTSD)
  kategori: string;
  grade: string;
  deskripsi: string;
  saran: string[];
  cutoffKlinis: boolean; // totalSkor >= 21
  hasPTE: boolean;
  pte: CATSPTEResult;
  subscales: {
    intrusion: CATSSubscaleResult; // B (1–5)
    avoidance: CATSSubscaleResult; // C (6–7)
    cognitionMood: CATSSubscaleResult; // D (8–14)
    arousal: CATSSubscaleResult; // E (15–20)
  };
  fungsiPsikososial: CATSFungsiPsikososialResult;
  dsmEvaluation: CATSDSMCriteriaEvaluation;
}

export const CATS_PTE_LABELS: Record<number, string> = {
  1: "Bencana alam serius (banjir, puting beliung, gempa bumi, kebakaran)",
  2: "Kecelakaan atau cedera serius (tabrakan, digigit anjing, luka olahraga)",
  3: "Dirampok dengan ancaman, kekuatan, atau senjata",
  4: "Ditampar, ditinju, atau dipukuli oleh anggota keluarga sendiri",
  5: "Ditampar, ditinju, atau dipukuli oleh seseorang di luar keluarga",
  6: "Melihat seseorang di keluarganya ditampar, ditinju, atau dipukuli",
  7: "Melihat seseorang di tempat lain ditampar dan ditinju",
  8: "Seseorang yang lebih tua menyentuh bagian intim anak tanpa izin",
  9: "Seseorang memaksa/menekan untuk kontak intim/seksual saat sulit menolak",
  10: "Seseorang yang dekat meninggal tiba-tiba atau akibat kekerasan",
  11: "Diserang, ditikam, ditembak, atau dilukai secara parah",
  12: "Melihat seseorang diserang, ditembak, terluka parah, atau dibunuh",
  13: "Prosedur medis yang membuat stres berat atau menakutkan",
  14: "Berada dalam situasi peperangan atau konflik bersenjata",
  15: "Peristiwa menegangkan atau menakutkan lainnya",
};

export const CATS_FUNGSI_LABELS: Record<number, string> = {
  1: "Pergaulannya dengan orang lain",
  2: "Hobi / kesenangannya",
  3: "Sekolahnya",
  4: "Hubungan dengan keluarganya",
  5: "Kebahagiaannya secara umum",
};

/**
 * Menghitung skor dan evaluasi instrumen CATS (Child and Adolescent Trauma Screen).
 *
 * Mendukung format input:
 * 1. Flat Map nomor 1..40:
 *    - 1..15: Kriteria A (PTE) -> 0 = Tidak, 1 = Ya
 *    - 16..35: Gejala PTSD (DSM-5 Gejala 1..20) -> 0, 1, 2, atau 3
 *    - 36..40: Fungsi Psikososial (Aspek 1..5) -> 0 = Tidak, 1 = Ya
 * 2. Kunci eksplisit: answers.pte, answers.gejala, answers.psikososial
 * 3. Indeks langsung gejala: answers[1]..answers[20]
 */
export function calculateCATS(answers: Record<string | number, any>): CATSCalculationResult {
  if (!answers || typeof answers !== "object") {
    throw new Error("Jawaban kuesioner CATS tidak valid.");
  }

  // 1. Ekstrak Jawaban Bagian 1: Peristiwa Traumatis (PTE 1–15)
  const pteMap: Record<number, number> = {};
  for (let i = 1; i <= 15; i++) {
    let val: any = undefined;
    if (answers.pte && typeof answers.pte === "object") {
      val = answers.pte[i] ?? answers.pte[String(i)];
    }
    if (val === undefined) {
      val = answers[`pte_${i}`] ?? answers[`pte${i}`] ?? answers[i];
    }
    // Normalisasi nilai ke 0 atau 1
    const num = Number(val);
    pteMap[i] = !isNaN(num) && num > 0 ? 1 : (val === true || val === "true" || val === "Ya" || val === "ya" ? 1 : 0);
  }

  const peristiwaPalingMengganggu =
    answers.peristiwaPalingMengganggu ||
    answers.peristiwa_paling_mengganggu ||
    answers.most_distressing ||
    answers.peristiwa_mengganggu ||
    null;
  const peristiwaLainnya =
    answers.peristiwaLainnya ||
    answers.peristiwa_lainnya ||
    answers.peristiwa_15 ||
    answers.peristiwa_15_teks ||
    null;

  const daftarPTE: Array<{ no: number; teks: string }> = [];
  let totalPTE = 0;
  for (let i = 1; i <= 15; i++) {
    if (pteMap[i] === 1) {
      totalPTE++;
      let teks = CATS_PTE_LABELS[i] || `Peristiwa Traumatis ${i}`;
      if (i === 15 && peristiwaLainnya) {
        teks = `Peristiwa lainnya: "${peristiwaLainnya}"`;
      }
      daftarPTE.push({
        no: i,
        teks,
      });
    }
  }

  const hasPTE = totalPTE > 0;

  // 2. Ekstrak Jawaban Bagian 2: 20 Butir Gejala PTSD (0–3)
  // Di flat array database: nomor 16..35 mewakili gejala 1..20
  const gejalaMap: Record<number, number> = {};
  for (let g = 1; g <= 20; g++) {
    let val: any = undefined;
    // Cek flat nomor 16..35
    const flatNo = g + 15;
    if (answers.gejala && typeof answers.gejala === "object") {
      val = answers.gejala[g] ?? answers.gejala[String(g)];
    }
    if (val === undefined && answers[flatNo] !== undefined) {
      val = answers[flatNo];
    }
    if (val === undefined && answers[`g_${g}`] !== undefined) {
      val = answers[`g_${g}`];
    }
    if (val === undefined && answers[`gejala_${g}`] !== undefined) {
      val = answers[`gejala_${g}`];
    }
    // Fallback: jika flat array dikirim hanya berisi gejala 1..20
    if (val === undefined && answers[g] !== undefined && !hasPTE && answers[16] === undefined) {
      val = answers[g];
    }

    const num = Number(val);
    const clamped = isNaN(num) ? 0 : Math.max(0, Math.min(3, Math.round(num)));
    gejalaMap[g] = clamped;
  }

  // 3. Ekstrak Jawaban Bagian 3: Dampak terhadap 5 Aspek Fungsi Psikososial
  // Di flat array database: nomor 36..40 mewakili aspek 1..5
  const fungsiMap: Record<number, boolean> = {};
  for (let f = 1; f <= 5; f++) {
    const flatNo = f + 35;
    let val: any = undefined;
    if (answers.fungsi && typeof answers.fungsi === "object") {
      val = answers.fungsi[f] ?? answers.fungsi[String(f)];
    }
    if (val === undefined && answers.psikososial && typeof answers.psikososial === "object") {
      val = answers.psikososial[f] ?? answers.psikososial[String(f)];
    }
    if (val === undefined && answers[flatNo] !== undefined) {
      val = answers[flatNo];
    }
    if (val === undefined && answers[`f_${f}`] !== undefined) {
      val = answers[`f_${f}`];
    }
    const num = Number(val);
    fungsiMap[f] = !isNaN(num) && num > 0 ? true : (val === true || val === "true" || val === "Ya" || val === "ya");
  }

  const fungsiRincian = [
    { nama: CATS_FUNGSI_LABELS[1], terganggu: fungsiMap[1] },
    { nama: CATS_FUNGSI_LABELS[2], terganggu: fungsiMap[2] },
    { nama: CATS_FUNGSI_LABELS[3], terganggu: fungsiMap[3] },
    { nama: CATS_FUNGSI_LABELS[4], terganggu: fungsiMap[4] },
    { nama: CATS_FUNGSI_LABELS[5], terganggu: fungsiMap[5] },
  ];
  const totalFungsiTerganggu = fungsiRincian.filter((r) => r.terganggu).length;

  // 4. Hitung Skor Gejala Total (0–60)
  // Aturan Handout: Bagi klien yang tidak melaporkan PTE, asesmen dianggap selesai (skor 0).
  let totalSkorGejala = 0;
  if (hasPTE) {
    for (let g = 1; g <= 20; g++) {
      totalSkorGejala += gejalaMap[g] || 0;
    }
  } else {
    // Jika tidak ada PTE sama sekali, skor gejala adalah 0
    totalSkorGejala = 0;
  }

  // 5. Hitung 4 Subskala DSM-5 (Intrusion, Avoidance, Cognition/Mood, Hyperarousal)
  // B: Intrusi (Gejala 1..5) - Max 15
  let skorB = 0;
  let endorsedB = 0;
  for (let i = 1; i <= 5; i++) {
    const v = hasPTE ? (gejalaMap[i] || 0) : 0;
    skorB += v;
    if (v >= 2) endorsedB++;
  }

  // C: Penghindaran (Gejala 6..7) - Max 6
  let skorC = 0;
  let endorsedC = 0;
  for (let i = 6; i <= 7; i++) {
    const v = hasPTE ? (gejalaMap[i] || 0) : 0;
    skorC += v;
    if (v >= 2) endorsedC++;
  }

  // D: Kognisi & Suasana Hati Negatif (Gejala 8..14) - Max 21
  let skorD = 0;
  let endorsedD = 0;
  for (let i = 8; i <= 14; i++) {
    const v = hasPTE ? (gejalaMap[i] || 0) : 0;
    skorD += v;
    if (v >= 2) endorsedD++;
  }

  // E: Hyperarousal & Reaktivitas (Gejala 15..20) - Max 18
  let skorE = 0;
  let endorsedE = 0;
  for (let i = 15; i <= 20; i++) {
    const v = hasPTE ? (gejalaMap[i] || 0) : 0;
    skorE += v;
    if (v >= 2) endorsedE++;
  }

  // Evaluasi Kriteria DSM-5
  const meetsB = endorsedB >= 1;
  const meetsC = endorsedC >= 1;
  const meetsD = endorsedD >= 2;
  const meetsE = endorsedE >= 2;
  const meetsF = totalFungsiTerganggu >= 1;
  const meetsSymptomCriteria = meetsB && meetsC && meetsD && meetsE;

  const getSubscaleStatus = (skor: number, max: number) => {
    const ratio = skor / max;
    if (ratio >= 0.6) return "Meningkat Signifikan";
    if (ratio >= 0.35) return "Tingkat Menengah";
    return "Dalam Batas Wajar";
  };

  // 6. Tentukan Kategori & Interpretasi Sesuai Handout
  // Rentang Skor:
  // 0 – 14: Normal, tidak meningkat secara klinis
  // 15 – 20: Distres level menengah terkait trauma
  // 21 – 60: Kemungkinan PTSD
  let kategori = "Normal, tidak meningkat secara klinis";
  let grade = "Normal";
  let deskripsi = "";
  let saran: string[] = [];

  if (!hasPTE || totalSkorGejala <= 14) {
    kategori = "Normal, tidak meningkat secara klinis";
    grade = "Normal";
    deskripsi =
      "Tingkat gejala stres pascatrauma berada dalam rentang normal dan tidak menunjukkan peningkatan klinis yang bermakna. Anak atau remaja menunjukkan daya lenting (resiliensi) yang adaptif.";
    saran = [
      "Tinjauan singkat hasilnya dengan klien dan caregiver.",
      "Lakukan validasi emosi anak, normalisasi perasaan, dan berikan rasa aman.",
      "Berikan bimbingan antisipatif dan pertahankan pola komunikasi yang hangat dan terbuka di keluarga.",
    ];
  } else if (totalSkorGejala <= 20) {
    kategori = "Distres level menengah terkait trauma";
    grade = "Distres Menengah";
    deskripsi =
      "Terdeteksi adanya distres tingkat menengah yang berhubungan dengan pengalaman peristiwa traumatis atau menakutkan. Meskipun belum memenuhi kriteria penuh kemungkinan PTSD, gejala yang muncul dapat membebani kenyamanan emosional anak.";
    saran = [
      "Tinjau hasilnya secara hati-hati bersama klien dan caregiver.",
      "Validasi emosi anak, normalisasi perasaan, dan yakinkan bahwa respons stres wajar terjadi setelah peristiwa berat.",
      "Berikan psikoedukasi tentang trauma dan ajarkan tips coping adaptif (seperti teknik relaksasi napas, grounding 5-4-3-2-1, dan jurnal perasaan).",
      "Sampaikan harapan bahwa banyak anak bisa pulih secara alami dengan dukungan lingkungan terdekat.",
      "Tawarkan terapi khusus trauma jika dibutuhkan atau apabila gejala menetap.",
    ];
  } else {
    kategori = "Kemungkinan PTSD";
    grade = "Kemungkinan PTSD";
    deskripsi =
      "Skor gejala mencapai ambang batas klinis (skor ≥ 21), yang mengindikasikan kemungkinan adanya Post-Traumatic Stress Disorder (PTSD) atau reaksi stres pascatrauma yang signifikan pada anak atau remaja. Kondisi ini ditandai dengan ingatan mengganggu yang berulang, kecenderungan menghindar, perubahan negatif suasana hati, serta peningkatan kewaspadaan.";
    saran = [
      "Tinjau hasilnya secara hati-hati bersama klien dan lakukan wawancara diagnostik PTSD klinis lanjutan semi-terstruktur.",
      "Lakukan validasi dan normalisasi perasaan anak tanpa memaksanya menceritakan detail kejadian traumatis sebelum merasa aman.",
      "Sampaikan harapan positif mengenai pemulihan bahwa gejala stres pascatrauma dapat ditangani secara efektif melalui bantuan profesional.",
      "Sangat disarankan untuk mempertimbangkan Trauma-Focused Cognitive Behavioral Therapy (TF-CBT) atau terapi khusus trauma berbasis bukti lainnya bersama psikolog anak/remaja.",
    ];
  }

  return {
    totalSkor: totalSkorGejala,
    kategori,
    grade,
    deskripsi,
    saran,
    cutoffKlinis: totalSkorGejala >= 21,
    hasPTE,
    pte: {
      totalDialami: totalPTE,
      daftarPeristiwa: daftarPTE,
      peristiwaPalingMengganggu,
      peristiwaLainnya,
    },
    subscales: {
      intrusion: {
        kode: "B",
        nama: "Gejala Intrusi / Gangguan (Intrusion)",
        skor: skorB,
        skorMax: 15,
        persentase: Math.round((skorB / 15) * 100),
        keterangan: getSubscaleStatus(skorB, 15),
        gejalaTerpenuhi: endorsedB,
      },
      avoidance: {
        kode: "C",
        nama: "Gejala Penghindaran (Avoidance)",
        skor: skorC,
        skorMax: 6,
        persentase: Math.round((skorC / 6) * 100),
        keterangan: getSubscaleStatus(skorC, 6),
        gejalaTerpenuhi: endorsedC,
      },
      cognitionMood: {
        kode: "D",
        nama: "Perubahan Negatif Kognisi & Mood",
        skor: skorD,
        skorMax: 21,
        persentase: Math.round((skorD / 21) * 100),
        keterangan: getSubscaleStatus(skorD, 21),
        gejalaTerpenuhi: endorsedD,
      },
      arousal: {
        kode: "E",
        nama: "Hyperarousal & Reaktivitas",
        skor: skorE,
        skorMax: 18,
        persentase: Math.round((skorE / 18) * 100),
        keterangan: getSubscaleStatus(skorE, 18),
        gejalaTerpenuhi: endorsedE,
      },
    },
    fungsiPsikososial: {
      totalTerganggu: totalFungsiTerganggu,
      aspek: {
        pergaulan: fungsiMap[1],
        hobi: fungsiMap[2],
        sekolah: fungsiMap[3],
        keluarga: fungsiMap[4],
        kebahagiaanUmum: fungsiMap[5],
      },
      rincian: fungsiRincian,
    },
    dsmEvaluation: {
      kriteriaA_PTE: hasPTE,
      kriteriaB_Intrusion: meetsB,
      kriteriaC_Avoidance: meetsC,
      kriteriaD_CognitionMood: meetsD,
      kriteriaE_Arousal: meetsE,
      kriteriaF_Impairment: meetsF,
      memenuhiKriteriaGejalaDSM5: meetsSymptomCriteria,
    },
  };
}

