// ============================================================================
// MODUL SKORING CDI (Children's Depression Inventory)
// Dikembangkan oleh Maria Kovacs (1992) untuk anak & remaja usia 7–19 tahun
// Total 27 Butir (3 pilihan per butir: skor 0, 1, atau 2). Total skor: 0–54.
// Ambang batas klinis (Cut-off score) >= 19.
// ============================================================================

/**
 * 1. Pemetaan 27 Butir ke dalam 5 Dimensi CDI sesuai Panduan Resmi
 */
// Negative Mood (Suasana hati negatif) - 6 butir: 1, 6, 3, 10, 11, 26
export const CDI_NEGATIVE_MOOD_ITEMS = [1, 3, 6, 10, 11, 26];

// Interpersonal Problems (Masalah antar pribadi) - 4 butir: 5, 8, 12, 27
export const CDI_INTERPERSONAL_ITEMS = [5, 8, 12, 27];

// Ineffectiveness (Ketidakefektifan) - 4 butir: 2, 15, 23, 24
export const CDI_INEFFECTIVENESS_ITEMS = [2, 15, 23, 24];

// Anhedonia (Kesedihan / Hilang Minat) - 8 butir: 4, 16, 17, 18, 19, 20, 21, 22
export const CDI_ANHEDONIA_ITEMS = [4, 16, 17, 18, 19, 20, 21, 22];

// Negative Self-Esteem (Harga diri negatif) - 5 butir: 7, 9, 13, 14, 25
export const CDI_NEGATIVE_SELF_ESTEEM_ITEMS = [7, 9, 13, 14, 25];

/**
 * 2. Pengelompokan Arah Penskoran Butir
 * - Kelompok 1: Pilihan 1 = 0, Pilihan 2 = 1, Pilihan 3 = 2
 * - Kelompok 2: Pilihan 1 = 2, Pilihan 2 = 1, Pilihan 3 = 0
 */
export const CDI_KELOMPOK_1_ITEMS = [1, 3, 4, 6, 9, 12, 14, 17, 19, 20, 22, 23, 26, 27];
export const CDI_KELOMPOK_2_ITEMS = [2, 5, 7, 8, 10, 11, 13, 15, 16, 18, 21, 24, 25];

/** Ambang batas klinis CDI: skor >= 19 mengindikasikan sindrom depresi bermakna */
export const CDI_CLINICAL_CUTOFF = 19;

export interface CDISubscaleResult {
  skor: number;
  total_item: number;
  max_skor: number;
  nama: string;
  namaId: string;
  deskripsi: string;
}

export interface CDICalculationResult {
  totalSkor: number; // 0–54
  maxSkor: number; // 54
  kategori: string;
  grade: "Depresi Normal / Wajar" | "Depresi Bermakna Klinis";
  isKlinisSignifikan: boolean;
  ideMelukaiDiri: boolean; // Butir 9 > 0
  subscales: {
    negativeMood: CDISubscaleResult;
    interpersonalProblem: CDISubscaleResult;
    ineffectiveness: CDISubscaleResult;
    anhedonia: CDISubscaleResult;
    negativeSelfEsteem: CDISubscaleResult;
  };
  subscalesList: Array<{
    key: string;
    nama: string;
    namaId: string;
    skor: number;
    max_skor: number;
    total_item: number;
    deskripsi: string;
  }>;
  catatanKlinis: string[];
}

/**
 * Fungsi kalkulasi skor CDI
 * @param answers Peta jawaban peserta, baik berupa { [nomorSoal]: skor } maupun { [nomorSoal]: { bobot: ... } }
 */
export function calculateCDI(
  answers: Record<string | number, any>
): CDICalculationResult {
  const nmSet = new Set(CDI_NEGATIVE_MOOD_ITEMS);
  const ipSet = new Set(CDI_INTERPERSONAL_ITEMS);
  const ineffSet = new Set(CDI_INEFFECTIVENESS_ITEMS);
  const anhSet = new Set(CDI_ANHEDONIA_ITEMS);
  const nseSet = new Set(CDI_NEGATIVE_SELF_ESTEEM_ITEMS);
  const kel2Set = new Set(CDI_KELOMPOK_2_ITEMS);

  let skorNM = 0;
  let skorIP = 0;
  let skorIneff = 0;
  let skorAnh = 0;
  let skorNSE = 0;
  let skorItem9 = 0;

  // Deteksi toleransi index: 1-based (1..27) atau 0-based (0..26)
  const numKeys = Object.keys(answers).map(Number);
  const isZeroBased = numKeys.includes(0) && !numKeys.includes(27);

  for (let no = 1; no <= 27; no++) {
    const key = isZeroBased ? no - 1 : no;
    const rawVal = answers[key] ?? answers[String(key)];

    let point = 0;
    if (typeof rawVal === "number") {
      // Jika nomor soal diteruskan langsung sebagai poin yang sudah dibobot (0, 1, 2)
      point = Math.max(0, Math.min(2, Math.round(rawVal)));
    } else if (rawVal && typeof rawVal === "object") {
      if (typeof rawVal.bobot === "number") {
        point = Math.max(0, Math.min(2, Math.round(rawVal.bobot)));
      } else if (typeof rawVal.value === "number") {
        point = Math.max(0, Math.min(2, Math.round(rawVal.value)));
      } else if (typeof rawVal.optionIndex === "number") {
        // Jika diteruskan indeks pilihan mentah 0..2 tanpa bobot
        const optIdx = Math.max(0, Math.min(2, Math.round(rawVal.optionIndex)));
        point = kel2Set.has(no) ? 2 - optIdx : optIdx;
      }
    }

    if (no === 9) {
      skorItem9 = point;
    }

    if (nmSet.has(no)) {
      skorNM += point;
    } else if (ipSet.has(no)) {
      skorIP += point;
    } else if (ineffSet.has(no)) {
      skorIneff += point;
    } else if (anhSet.has(no)) {
      skorAnh += point;
    } else if (nseSet.has(no)) {
      skorNSE += point;
    }
  }

  // Total Skor CDI (0–54)
  const totalSkor = skorNM + skorIP + skorIneff + skorAnh + skorNSE;
  const isKlinisSignifikan = totalSkor >= CDI_CLINICAL_CUTOFF;

  const grade = isKlinisSignifikan
    ? ("Depresi Bermakna Klinis" as const)
    : ("Depresi Normal / Wajar" as const);

  const kategori = isKlinisSignifikan
    ? "Kecenderungan Depresi Bermakna Secara Klinis (Perlu Perhatian)"
    : "Tingkat Depresi Berada dalam Batas Wajar";

  const ideMelukaiDiri = skorItem9 > 0;

  const catatanKlinis: string[] = [];
  if (ideMelukaiDiri) {
    catatanKlinis.push(
      "PERHATIAN KHUSUS: Peserta mengindikasikan adanya pikiran tentang kematian atau menyakiti diri sendiri (Butir 9 > 0). Diperlukan asesmen keselamatan mendalam dan konsultasi segera bersama orang tua/wali serta profesional kesehatan mental."
    );
  }

  if (isKlinisSignifikan) {
    catatanKlinis.push(
      `Skor total CDI (${totalSkor}/54) mencapai cut-off klinis ≥19, mengindikasikan adanya sindrom depresi yang bermakna secara klinis pada anak/remaja. Disarankan untuk evaluasi komprehensif lebih lanjut bersama psikolog atau psikiater.`
    );
  } else {
    catatanKlinis.push(
      `Skor total CDI (${totalSkor}/54) berada di bawah ambang klinis (<19), menunjukkan bahwa gejala depresi berada dalam rentang wajar/non-klinis.`
    );
  }

  const subscales = {
    negativeMood: {
      skor: skorNM,
      total_item: 6,
      max_skor: 12,
      nama: "Negative Mood",
      namaId: "Suasana Hati Negatif",
      deskripsi:
        "Menggambarkan perasaan sedih, khawatir, bersalah, dan kecenderungan menangis.",
    },
    interpersonalProblem: {
      skor: skorIP,
      total_item: 4,
      max_skor: 8,
      nama: "Interpersonal Problems",
      namaId: "Masalah Antar Pribadi",
      deskripsi:
        "Menggambarkan kesulitan dalam hubungan sosial dan interaksi dengan orang lain.",
    },
    ineffectiveness: {
      skor: skorIneff,
      total_item: 4,
      max_skor: 8,
      nama: "Ineffectiveness",
      namaId: "Ketidakefektifan",
      deskripsi:
        "Menggambarkan perasaan tidak mampu, kurang berhasil, atau mengalami kesulitan dalam menyelesaikan tugas.",
    },
    anhedonia: {
      skor: skorAnh,
      total_item: 8,
      max_skor: 16,
      nama: "Anhedonia",
      namaId: "Anhedonia / Kehilangan Minat",
      deskripsi:
        "Menggambarkan berkurangnya kesenangan, minat, atau ketertarikan terhadap aktivitas sehari-hari.",
    },
    negativeSelfEsteem: {
      skor: skorNSE,
      total_item: 5,
      max_skor: 10,
      nama: "Negative Self-Esteem",
      namaId: "Harga Diri Negatif",
      deskripsi:
        "Menggambarkan penilaian negatif terhadap diri sendiri, termasuk perasaan tidak berharga dan kebencian terhadap diri.",
    },
  };

  const subscalesList = [
    { key: "negativeMood", ...subscales.negativeMood },
    { key: "interpersonalProblem", ...subscales.interpersonalProblem },
    { key: "ineffectiveness", ...subscales.ineffectiveness },
    { key: "anhedonia", ...subscales.anhedonia },
    { key: "negativeSelfEsteem", ...subscales.negativeSelfEsteem },
  ];

  return {
    totalSkor,
    maxSkor: 54,
    kategori,
    grade,
    isKlinisSignifikan,
    ideMelukaiDiri,
    subscales,
    subscalesList,
    catatanKlinis,
  };
}

