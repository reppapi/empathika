/**
 * Unit test validasi psikometri, indeks validitas, dan engine skoring MCMI-IV.
 */
import { describe, it, expect } from "vitest";
import {
  calculateMCMI4,
  MCMI_TOTAL_ITEMS,
  MCMI_INCONSISTENCY_PAIRS,
  MCMI_VALIDITY_ITEMS,
  MCMI_SCALE_X_ITEMS,
  rawToBR,
  MCMI_PERSONALITY_DESCRIPTIONS,
  MCMI_CLINICAL_DESCRIPTIONS,
} from "../src/modules/psikotes/alat-ukur/mcmi-iv/scoring";
import { MCMI4_CONFIG } from "../src/modules/psikotes/alat-ukur/mcmi-iv/config";
import { MCMI_SOAL, MCMI_OPSI } from "../prisma/seeds-psikotes/seeds/seed-mcmi";

describe("MCMI-IV Psychometrics & Scoring Engine", () => {
  it("harus memiliki tepat 195 butir soal dan 2 pilihan jawaban (+/-)", () => {
    expect(MCMI_TOTAL_ITEMS).toBe(195);
    expect(MCMI_SOAL.length).toBe(195);
    for (let i = 1; i <= 195; i++) {
      expect(MCMI_SOAL[i - 1]?.no).toBe(i);
      expect(MCMI_SOAL[i - 1]?.text.trim().length).toBeGreaterThan(5);
    }

    expect(MCMI_OPSI).toHaveLength(2);
    expect(MCMI_OPSI[0]?.label).toBe("+");
    expect(MCMI_OPSI[0]?.bobot).toBe(1);
    expect(MCMI_OPSI[1]?.label).toBe("-");
    expect(MCMI_OPSI[1]?.bobot).toBe(0);

    expect(MCMI4_CONFIG.kode).toBe("MCMI-IV");
    expect(MCMI4_CONFIG.targetUsia).toBe("18 tahun ke atas");
    expect(MCMI4_CONFIG.dimensiList?.length).toBe(25); // 15 Spektrum + 10 Sindroma
  });

  it("harus memiliki 3 butir Skala V dan 25 pasang butir Skala W", () => {
    expect(MCMI_VALIDITY_ITEMS).toEqual([49, 98, 160]);
    expect(MCMI_INCONSISTENCY_PAIRS).toHaveLength(25);
    // Verifikasi pasangan contoh handout [22, 170]
    expect(MCMI_INCONSISTENCY_PAIRS.some(([a, b]) => a === 22 && b === 170)).toBe(true);
    // Verifikasi 121 butir pembentuk skala X
    expect(MCMI_SCALE_X_ITEMS).toHaveLength(121);
  });

  it("harus mendeteksi INVALID jika Skala V > 1 (>= 2 jawaban True pada butir janggal)", () => {
    // Siapkan jawaban wajar dengan beberapa skala True agar skala X berada di 7..114
    const answers: Record<number, number> = {};
    for (let i = 1; i <= 195; i++) answers[i] = 0;
    // Beri 20 jawaban True acak agar lolos Skala X
    for (let i = 1; i <= 20; i++) answers[i] = 1;

    // Jawaban True pada 2 butir janggal: 49 dan 98 -> V = 2 (> 1)
    answers[49] = 1;
    answers[98] = 1;

    const res = calculateMCMI4(answers);
    expect(res.validitas.skalaV).toBe(2);
    expect(res.validitas.isValid).toBe(false);
    expect(res.validitas.alasanInvalid.some((a) => a.includes("Skala V"))).toBe(true);
    expect(res.laporanNaratif.validitas).toBe("Hasil tes ini tidak akurat dan tidak dapat diinterpretasi.");
    expect(res.laporanNaratif.polaKepribadian).toBe("Tidak dapat diinterpretasi.");
    expect(res.laporanNaratif.klinis).toBe("Tidak dapat diinterpretasi.");
  });

  it("harus mendeteksi INVALID jika Skala W > 19 (inkonsistensi ekstrem)", () => {
    const answers: Record<number, number> = {};
    for (let i = 1; i <= 195; i++) answers[i] = 0;
    for (let i = 1; i <= 20; i++) answers[i] = 1;

    // Buat beda jawaban pada 20 pasang Skala W
    for (let p = 0; p < 20; p++) {
      const [itemA, itemB] = MCMI_INCONSISTENCY_PAIRS[p];
      answers[itemA] = 1;
      answers[itemB] = 0;
    }

    const res = calculateMCMI4(answers);
    expect(res.validitas.skalaW).toBeGreaterThan(19);
    expect(res.validitas.isValid).toBe(false);
    expect(res.validitas.alasanInvalid.some((a) => a.includes("Skala W"))).toBe(true);
    expect(res.laporanNaratif.validitas).toBe("Hasil tes ini tidak akurat dan tidak dapat diinterpretasi.");
  });

  it("harus mendeteksi INVALID jika Skala X < 7 atau > 114", () => {
    // Kasus X < 7 (hanya 3 True)
    const answersUnder: Record<number, number> = {};
    for (let i = 1; i <= 195; i++) answersUnder[i] = 0;
    answersUnder[1] = 1;
    answersUnder[2] = 1;
    answersUnder[3] = 1;

    const resUnder = calculateMCMI4(answersUnder);
    expect(resUnder.validitas.skalaX).toBeLessThan(7);
    expect(resUnder.validitas.isValid).toBe(false);
    expect(resUnder.validitas.alasanInvalid.some((a) => a.includes("Skala X"))).toBe(true);

    // Kasus X > 114 (120 butir True)
    const answersOver: Record<number, number> = {};
    for (let i = 1; i <= 195; i++) answersOver[i] = 1;
    answersOver[49] = 0;
    answersOver[98] = 0;
    answersOver[160] = 0;

    const resOver = calculateMCMI4(answersOver);
    expect(resOver.validitas.skalaX).toBeGreaterThan(114);
    expect(resOver.validitas.isValid).toBe(false);
    expect(resOver.validitas.alasanInvalid.some((a) => a.includes("Skala X"))).toBe(true);
  });

  it("harus menghasilkan interpretasi valid dan memicu deskripsi Borderline (Skala C) sesuai Contoh 3 handout", () => {
    const answers: Record<number, number> = {};
    for (let i = 1; i <= 195; i++) answers[i] = 0;

    // Berikan konsistensi penuh pada pasangan W (keduanya True atau keduanya False)
    for (const [a, b] of MCMI_INCONSISTENCY_PAIRS) {
      answers[a] = 0;
      answers[b] = 0;
    }

    // Pastikan V = 0
    answers[49] = 0;
    answers[98] = 0;
    answers[160] = 0;

    // Berikan jawaban True pada butir-butir Skala 3 (Dependent) & Skala 7 (Compulsive) agar lolos X (antara 7..114) dan BR >= 60
    const scale3Items = [4, 42, 60, 77, 109, 133, 162, 173, 194];
    for (const no of scale3Items) answers[no] = 1;

    const scale7Items = [2, 29, 35, 48, 63, 73, 140, 158, 179, 188];
    for (const no of scale7Items) answers[no] = 1;

    // Berikan jawaban True pada butir-butir Borderline (Skala C) agar mencapai Tipe Kepribadian (BR 75–84)
    const scaleCItems = [18, 37, 40, 70, 74, 78, 82, 111];
    for (const no of scaleCItems) answers[no] = 1;

    const res = calculateMCMI4(answers);
    expect(res.validitas.isValid).toBe(true);
    expect(res.validitas.skalaV).toBe(0);
    expect(res.laporanNaratif.validitas).toBe("Hasil tes ini akurat dan dapat dipercaya.");

    // Skala C harus terpicu dan memiliki teks baku Borderline sesuai Contoh 3 handout:
    const cScale = res.polaKepribadian["C"];
    expect(cScale).toBeDefined();
    expect(cScale.brScore).toBeGreaterThanOrEqual(75);
    expect(cScale.deskripsi).toContain("Emosi labil, sulit diduga dan impulsif (bertindak tanpa pertimbangan)");
    expect(cScale.deskripsi).toContain("Terdapat tendensi mencederai diri sendiri");
    expect(res.laporanNaratif.polaKepribadian).toContain("Emosi labil, sulit diduga dan impulsif");
  });

  it("harus memicu deskripsi sindroma klinis Alcohol Use (Skala B) & PTSD (Skala R) jika skor menonjol", () => {
    const answers: Record<number, number> = {};
    for (let i = 1; i <= 195; i++) answers[i] = 0;

    // Beri dukungan skala kepribadian dasar agar valid
    const scale3Items = [4, 42, 60, 77, 109, 133, 162, 173, 194];
    for (const no of scale3Items) answers[no] = 1;

    // Pemicu Alcohol (Skala B)
    for (const no of [25, 45, 94, 130, 161]) answers[no] = 1;

    // Pemicu PTSD (Skala R)
    for (const no of [47, 62, 76, 91, 125, 143, 150, 157]) answers[no] = 1;

    const res = calculateMCMI4(answers);
    expect(res.validitas.isValid).toBe(true);

    const bScale = res.sindromaKlinis["B"];
    expect(bScale.brScore).toBeGreaterThanOrEqual(75);
    expect(bScale.deskripsi).toContain("penggunaan alkohol berlebihan");

    const rScale = res.sindromaKlinis["R"];
    expect(rScale.brScore).toBeGreaterThanOrEqual(75);
    expect(rScale.deskripsi).toContain("kejadian yang");
    expect(res.laporanNaratif.klinis).toContain("penggunaan alkohol berlebihan");
  });

  it("fungsi rawToBR harus memetakan skor mentah ke BR 0–115 secara bertingkat", () => {
    expect(rawToBR(0, 10)).toBe(0);
    expect(rawToBR(3, 10)).toBe(60);  // 30% -> BR 60
    expect(rawToBR(5, 10)).toBe(75);  // 50% -> BR 75
    expect(rawToBR(8, 10)).toBeGreaterThanOrEqual(85); // >75% -> BR >= 85
    expect(rawToBR(10, 10)).toBe(115); // 100% -> BR 115
  });
});
