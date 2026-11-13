import { describe, it, expect } from "vitest";
import {
  calculateCDI,
  CDI_NEGATIVE_MOOD_ITEMS,
  CDI_INTERPERSONAL_ITEMS,
  CDI_INEFFECTIVENESS_ITEMS,
  CDI_ANHEDONIA_ITEMS,
  CDI_NEGATIVE_SELF_ESTEEM_ITEMS,
  CDI_KELOMPOK_1_ITEMS,
  CDI_KELOMPOK_2_ITEMS,
  CDI_CLINICAL_CUTOFF,
} from "../src/modules/psikotes/alat-ukur/cdi/scoring";

describe("CDI (Children's Depression Inventory) Scoring & Psychometrics", () => {
  it("harus memiliki tepat 27 butir terbagi ke 5 dimensi klinis tanpa tumpang tindih", () => {
    expect(CDI_NEGATIVE_MOOD_ITEMS.length).toBe(6);
    expect(CDI_INTERPERSONAL_ITEMS.length).toBe(4);
    expect(CDI_INEFFECTIVENESS_ITEMS.length).toBe(4);
    expect(CDI_ANHEDONIA_ITEMS.length).toBe(8);
    expect(CDI_NEGATIVE_SELF_ESTEEM_ITEMS.length).toBe(5);

    const totalDimensi =
      CDI_NEGATIVE_MOOD_ITEMS.length +
      CDI_INTERPERSONAL_ITEMS.length +
      CDI_INEFFECTIVENESS_ITEMS.length +
      CDI_ANHEDONIA_ITEMS.length +
      CDI_NEGATIVE_SELF_ESTEEM_ITEMS.length;
    expect(totalDimensi).toBe(27);

    // Pastikan seluruh nomor butir 1..27 unik dan lengkap
    const allItems = new Set([
      ...CDI_NEGATIVE_MOOD_ITEMS,
      ...CDI_INTERPERSONAL_ITEMS,
      ...CDI_INEFFECTIVENESS_ITEMS,
      ...CDI_ANHEDONIA_ITEMS,
      ...CDI_NEGATIVE_SELF_ESTEEM_ITEMS,
    ]);
    expect(allItems.size).toBe(27);
    for (let i = 1; i <= 27; i++) {
      expect(allItems.has(i)).toBe(true);
    }
  });

  it("harus memiliki pembagian kelompok arah penskoran 14 butir Kelompok 1 dan 13 butir Kelompok 2", () => {
    expect(CDI_KELOMPOK_1_ITEMS.length).toBe(14);
    expect(CDI_KELOMPOK_2_ITEMS.length).toBe(13);

    const allKelompok = new Set([...CDI_KELOMPOK_1_ITEMS, ...CDI_KELOMPOK_2_ITEMS]);
    expect(allKelompok.size).toBe(27);
    for (let i = 1; i <= 27; i++) {
      expect(allKelompok.has(i)).toBe(true);
    }
  });

  it("skor minimum adalah 0 (Depresi Normal / Wajar)", () => {
    const zeroAnswers: Record<number, number> = {};
    for (let i = 1; i <= 27; i++) zeroAnswers[i] = 0;

    const res = calculateCDI(zeroAnswers);
    expect(res.totalSkor).toBe(0);
    expect(res.maxSkor).toBe(54);
    expect(res.isKlinisSignifikan).toBe(false);
    expect(res.grade).toBe("Depresi Normal / Wajar");
    expect(res.kategori).toBe("Tingkat Depresi Berada dalam Batas Wajar");
    expect(res.ideMelukaiDiri).toBe(false);

    expect(res.subscales.negativeMood.skor).toBe(0);
    expect(res.subscales.interpersonalProblem.skor).toBe(0);
    expect(res.subscales.ineffectiveness.skor).toBe(0);
    expect(res.subscales.anhedonia.skor).toBe(0);
    expect(res.subscales.negativeSelfEsteem.skor).toBe(0);
  });

  it("skor maksimum adalah 54 (Depresi Bermakna Klinis & Ide Melukai Diri Aktif)", () => {
    const maxAnswers: Record<number, number> = {};
    for (let i = 1; i <= 27; i++) maxAnswers[i] = 2;

    const res = calculateCDI(maxAnswers);
    expect(res.totalSkor).toBe(54);
    expect(res.maxSkor).toBe(54);
    expect(res.isKlinisSignifikan).toBe(true);
    expect(res.grade).toBe("Depresi Bermakna Klinis");
    expect(res.kategori).toBe("Kecenderungan Depresi Bermakna Secara Klinis (Perlu Perhatian)");
    expect(res.ideMelukaiDiri).toBe(true);

    expect(res.subscales.negativeMood.skor).toBe(12);
    expect(res.subscales.interpersonalProblem.skor).toBe(8);
    expect(res.subscales.ineffectiveness.skor).toBe(8);
    expect(res.subscales.anhedonia.skor).toBe(16);
    expect(res.subscales.negativeSelfEsteem.skor).toBe(10);
  });

  it("menguji ambang batas cut-off klinis skor >= 19 secara presisi", () => {
    expect(CDI_CLINICAL_CUTOFF).toBe(19);

    // Skor 18 (Tepat 1 poin di bawah cut-off)
    const answers18: Record<number, number> = {};
    for (let i = 1; i <= 27; i++) answers18[i] = 0;
    // Beri 9 butir bernilai 2 (kecuali butir 9 agar ideMelukaiDiri tetap false)
    [1, 2, 3, 4, 5, 6, 7, 8, 10].forEach((no) => {
      answers18[no] = 2;
    });

    const res18 = calculateCDI(answers18);
    expect(res18.totalSkor).toBe(18);
    expect(res18.isKlinisSignifikan).toBe(false);
    expect(res18.grade).toBe("Depresi Normal / Wajar");

    // Skor 19 (Mencapai batas cut-off klinis)
    const answers19 = { ...answers18, 11: 1 };
    const res19 = calculateCDI(answers19);
    expect(res19.totalSkor).toBe(19);
    expect(res19.isKlinisSignifikan).toBe(true);
    expect(res19.grade).toBe("Depresi Bermakna Klinis");
  });

  it("memverifikasi deteksi ide bunuh diri / menyakiti diri pada Butir 9", () => {
    // Butir 9 = 0
    const ans0 = { 9: 0 };
    expect(calculateCDI(ans0).ideMelukaiDiri).toBe(false);

    // Butir 9 = 1
    const ans1 = { 9: 1 };
    const res1 = calculateCDI(ans1);
    expect(res1.ideMelukaiDiri).toBe(true);
    expect(res1.catatanKlinis.some((c) => c.includes("PERHATIAN KHUSUS"))).toBe(true);

    // Butir 9 = 2
    const ans2 = { 9: 2 };
    const res2 = calculateCDI(ans2);
    expect(res2.ideMelukaiDiri).toBe(true);
    expect(res2.catatanKlinis.some((c) => c.includes("PERHATIAN KHUSUS"))).toBe(true);
  });

  it("mendukung format index 0-based dan nilai berbasis objek { bobot: ... }", () => {
    // 0-based: index 0..26 mewakili butir 1..27
    const zeroBasedAnswers: Record<number, { bobot: number }> = {};
    for (let i = 0; i < 27; i++) {
      zeroBasedAnswers[i] = { bobot: 1 };
    }

    const res = calculateCDI(zeroBasedAnswers);
    expect(res.totalSkor).toBe(27);
    expect(res.isKlinisSignifikan).toBe(true);
    expect(res.ideMelukaiDiri).toBe(true); // butir 9 (index 8) bernilai 1
    expect(res.subscales.negativeMood.skor).toBe(6);
    expect(res.subscales.interpersonalProblem.skor).toBe(4);
    expect(res.subscales.ineffectiveness.skor).toBe(4);
    expect(res.subscales.anhedonia.skor).toBe(8);
    expect(res.subscales.negativeSelfEsteem.skor).toBe(5);
  });

  it("mendukung input berbasis optionIndex mentah dengan inversi skor Kelompok 2", () => {
    // Kelompok 1: butir 1 -> optIdx 0 bernilai 0
    // Kelompok 2: butir 2 -> optIdx 0 bernilai 2 (inversi: 2 - 0 = 2)
    const rawOptions = {
      1: { optionIndex: 0 },
      2: { optionIndex: 0 },
    };
    const res = calculateCDI(rawOptions);
    expect(res.subscales.negativeMood.skor).toBe(0); // butir 1 ada di NM -> 0
    expect(res.subscales.ineffectiveness.skor).toBe(2); // butir 2 ada di Ineff -> 2
    expect(res.totalSkor).toBe(2);
  });
});

