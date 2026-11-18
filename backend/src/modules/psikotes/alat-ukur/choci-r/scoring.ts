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
  totalSkor: number; // Menggunakan totalSymptoms untuk kompatibilitas DB
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

/**
 * Menghitung skor instrumen CHOCI-R dari 38 nomor butir pertanyaan:
 * - Butir 1–10  : Gejala Kompulsi (0–2, total 0–20)
 * - Butir 11–13 : Isian Kualitatif 3 Kebiasaan Kompulsi (skor 0)
 * - Butir 14–19 : Keparahan Kompulsi (0–4, total 0–24)
 * - Butir 20–29 : Gejala Obsesi (0–2, total 0–20)
 * - Butir 30–32 : Isian Kualitatif 3 Pikiran Obsesi (skor 0)
 * - Butir 33–38 : Keparahan Obsesi (0–4, total 0–24)
 *
 * Menghasilkan:
 * - Total Symptoms Score (0–40)
 * - Total Impairment Score (0–48)
 */
export function calculateCHOCI(answers: Record<string | number, any>): CHOCICalculationResult {
  if (!answers || typeof answers !== "object") {
    throw new Error("Jawaban kuesioner CHOCI-R tidak valid.");
  }

  // 1. Hitung Compulsion Symptoms Score (Butir 1 s/d 10, skala 0–2)
  let compulsionSymptoms = 0;
  for (let i = 1; i <= 10; i++) {
    const raw = answers[i] ?? answers[String(i)];
    compulsionSymptoms += clampScore(raw, 2);
  }

  // 2. Ekstrak Isian Kualitatif Kebiasaan Kompulsi (Butir 11, 12, 13)
  const kebiasaanKompulsi: string[] = [];
  const rawChociIsian = (answers as any)?.choci_isian || (answers as any)?.chociIsian;
  if (rawChociIsian && typeof rawChociIsian === "object") {
    const k1 = extractText(rawChociIsian[10] ?? rawChociIsian["10"] ?? rawChociIsian[11] ?? rawChociIsian["11"]);
    const k2 = extractText(rawChociIsian[11] ?? rawChociIsian["11"] ?? rawChociIsian[12] ?? rawChociIsian["12"]);
    const k3 = extractText(rawChociIsian[12] ?? rawChociIsian["12"] ?? rawChociIsian[13] ?? rawChociIsian["13"]);
    if (k1) kebiasaanKompulsi.push(k1);
    if (k2 && k2 !== k1) kebiasaanKompulsi.push(k2);
    if (k3 && k3 !== k2 && k3 !== k1) kebiasaanKompulsi.push(k3);
  }
  if (kebiasaanKompulsi.length === 0) {
    for (let i = 11; i <= 13; i++) {
      const text = extractText(answers[i] ?? answers[String(i)]);
      if (text) kebiasaanKompulsi.push(text);
    }
  }

  // 3. Hitung Compulsion Severity Score (Butir 14 s/d 19, skala 0–4)
  let compulsionSeverity = 0;
  for (let i = 14; i <= 19; i++) {
    const raw = answers[i] ?? answers[String(i)];
    compulsionSeverity += clampScore(raw, 4);
  }

  // 4. Hitung Obsession Symptoms Score (Butir 20 s/d 29, skala 0–2)
  let obsessionSymptoms = 0;
  for (let i = 20; i <= 29; i++) {
    const raw = answers[i] ?? answers[String(i)];
    obsessionSymptoms += clampScore(raw, 2);
  }

  // 5. Ekstrak Isian Kualitatif Pikiran Obsesi (Butir 30, 31, 32)
  const pikiranObsesi: string[] = [];
  if (rawChociIsian && typeof rawChociIsian === "object") {
    const p1 = extractText(rawChociIsian[29] ?? rawChociIsian["29"] ?? rawChociIsian[30] ?? rawChociIsian["30"]);
    const p2 = extractText(rawChociIsian[30] ?? rawChociIsian["30"] ?? rawChociIsian[31] ?? rawChociIsian["31"]);
    const p3 = extractText(rawChociIsian[31] ?? rawChociIsian["31"] ?? rawChociIsian[32] ?? rawChociIsian["32"]);
    if (p1) pikiranObsesi.push(p1);
    if (p2 && p2 !== p1) pikiranObsesi.push(p2);
    if (p3 && p3 !== p2 && p3 !== p1) pikiranObsesi.push(p3);
  }
  if (pikiranObsesi.length === 0) {
    for (let i = 30; i <= 32; i++) {
      const text = extractText(answers[i] ?? answers[String(i)]);
      if (text) pikiranObsesi.push(text);
    }
  }

  // 6. Hitung Obsession Severity Score (Butir 33 s/d 38, skala 0–4)
  let obsessionSeverity = 0;
  for (let i = 33; i <= 38; i++) {
    const raw = answers[i] ?? answers[String(i)];
    obsessionSeverity += clampScore(raw, 4);
  }

  // 7. Hitung Skor Total Gabungan Sesuai Handout
  const totalSymptoms = compulsionSymptoms + obsessionSymptoms; // 0–40
  const totalImpairment = compulsionSeverity + obsessionSeverity; // 0–48

  const scores: CHOCIScores = {
    compulsionSymptoms,
    compulsionSeverity,
    obsessionSymptoms,
    obsessionSeverity,
    totalSymptoms,
    totalImpairment,
  };

  // 8. Bentuk daftar subskala untuk visualisasi UI dan laporan PDF
  const subscalesList: CHOCISubscaleItem[] = [
    {
      key: "totalSymptoms",
      nama: "Total Symptoms Score (Gejala OCD)",
      rentangButir: "1–10 & 20–29",
      total_item: 20,
      max_skor: 40,
      skor: totalSymptoms,
      deskripsi:
        "Semakin tinggi skor, semakin besar kompleksitas dan luasnya gejala OCD yang dialami.",
    },
    {
      key: "totalImpairment",
      nama: "Total Impairment Score (Keparahan & Distres)",
      rentangButir: "14–19 & 33–38",
      total_item: 12,
      max_skor: 48,
      skor: totalImpairment,
      deskripsi:
        "Semakin tinggi skor, semakin tinggi tingkat keparahan atau distres yang berkaitan dengan gejala OCD.",
    },
    {
      key: "compulsionSymptoms",
      nama: "Compulsion Symptoms (Gejala Kompulsi)",
      rentangButir: "1–10",
      total_item: 10,
      max_skor: 20,
      skor: compulsionSymptoms,
      deskripsi: "Keberadaan dan frekuensi perilaku atau tindakan berulang (kompulsi).",
    },
    {
      key: "compulsionSeverity",
      nama: "Compulsion Severity (Keparahan Kompulsi)",
      rentangButir: "14–19",
      total_item: 6,
      max_skor: 24,
      skor: compulsionSeverity,
      deskripsi: "Waktu, gangguan, distres, dan penghindaran akibat perilaku kompulsi.",
    },
    {
      key: "obsessionSymptoms",
      nama: "Obsession Symptoms (Gejala Obsesi)",
      rentangButir: "20–29",
      total_item: 10,
      max_skor: 20,
      skor: obsessionSymptoms,
      deskripsi: "Keberadaan dan frekuensi pikiran, gambaran, atau desakan mengganggu (obsesi).",
    },
    {
      key: "obsessionSeverity",
      nama: "Obsession Severity (Keparahan Obsesi)",
      rentangButir: "33–38",
      total_item: 6,
      max_skor: 24,
      skor: obsessionSeverity,
      deskripsi: "Waktu, gangguan, distres, kendali, dan penghindaran akibat pikiran obsesi.",
    },
  ];

  const catatanKlinis = [
    "Total Symptoms Score: Semakin tinggi skor, semakin besar kompleksitas dan luasnya gejala OCD.",
    "Total Impairment Score: Semakin tinggi skor, semakin tinggi tingkat keparahan atau stres yang berkaitan dengan gejala OCD.",
    "Persentil 50: Skor persentil 50 merupakan skor rata-rata untuk anak/remaja dengan OCD, yang menunjukkan gejala khas dan signifikan secara klinis.",
    "Instrumen CHOCI-R tidak menggunakan kategori buatan (ringan/sedang/berat), melainkan menyajikan profil skor gejala dan keparahan untuk melacak perubahan gejala dari waktu ke waktu.",
  ];

  return {
    totalSkor: totalSymptoms,
    tanpaSkorTotal: true,
    hasInterpretation: false,
    grade: "Profil Gejala & Keparahan CHOCI-R",
    kategori: "Profil Skor Gejala & Keparahan OCD (CHOCI-R)",
    deskripsi:
      "Hasil CHOCI-R menyajikan profil Total Symptoms Score (rentang 0–40) dan Total Impairment Score (rentang 0–48) tanpa pengelompokan kategori artifisial. Semakin tinggi skor, semakin besar kompleksitas dan tingkat keparahan/stres terkait gejala OCD.",
    saran: catatanKlinis,
    scores,
    subscalesList,
    catatanKlinis,
    kualitatif: {
      kebiasaanKompulsi,
      pikiranObsesi,
    },
  };
}

