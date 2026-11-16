import { describe, it, expect } from "vitest";
import {
  calculateRCMAS,
  RCMAS_PHYSIOLOGICAL_ITEMS,
  RCMAS_WORRY_ITEMS,
  RCMAS_CONCENTRATION_ITEMS,
  RCMAS_LIE_ITEMS,
  RCMAS_CLINICAL_CUTOFF,
} from "../src/modules/psikotes/alat-ukur/rcmas/scoring";

describe("RCMAS Psychometrics & Scoring Engine", () => {
  it("harus memiliki total 37 butir terdistribusi presisi sesuai handout", () => {
    expect(RCMAS_PHYSIOLOGICAL_ITEMS.length).toBe(10);
    expect(RCMAS_WORRY_ITEMS.length).toBe(11);
    expect(RCMAS_CONCENTRATION_ITEMS.length).toBe(7);
    expect(RCMAS_LIE_ITEMS.length).toBe(9);

    const totalItems =
      RCMAS_PHYSIOLOGICAL_ITEMS.length +
      RCMAS_WORRY_ITEMS.length +
      RCMAS_CONCENTRATION_ITEMS.length +
      RCMAS_LIE_ITEMS.length;
    expect(totalItems).toBe(37);

    // Pastikan tidak ada nomor butir yang tumpang tindih
    const allSet = new Set([
      ...RCMAS_PHYSIOLOGICAL_ITEMS,
      ...RCMAS_WORRY_ITEMS,
      ...RCMAS_CONCENTRATION_ITEMS,
      ...RCMAS_LIE_ITEMS,
    ]);
    expect(allSet.size).toBe(37);

    // Pastikan nomor butir 1..37 lengkap tanpa bolong
    for (let i = 1; i <= 37; i++) {
      expect(allSet.has(i)).toBe(true);
    }
  });

  it("skor kecemasan harus berada di rentang 0–28 dan terpisah dari Lie Scale", () => {
    // Simulasi: semua jawaban "Tidak" (skor 0)
    const zeroAnswers: Record<number, number> = {};
    for (let i = 1; i <= 37; i++) zeroAnswers[i] = 0;

    const resZero = calculateRCMAS(zeroAnswers);
    expect(resZero.totalSkor).toBe(0);
    expect(resZero.isKlinisSignifikan).toBe(false);
    expect(resZero.grade).toBe("Kecemasan Normal");
    expect(resZero.lieScale.skor).toBe(0);
    expect(resZero.subscales.physiological.skor).toBe(0);
    expect(resZero.subscales.worry.skor).toBe(0);
    expect(resZero.subscales.concentration.skor).toBe(0);

    // Simulasi: semua jawaban "Ya" (skor 1)
    const maxAnswers: Record<number, number> = {};
    for (let i = 1; i <= 37; i++) maxAnswers[i] = 1;

    const resMax = calculateRCMAS(maxAnswers);
    // Total kecemasan harus tepat 28 (BUKAN 37!)
    expect(resMax.totalSkor).toBe(28);
    expect(resMax.maxSkorAnxiety).toBe(28);
    expect(resMax.isKlinisSignifikan).toBe(true);
    expect(resMax.grade).toBe("Kecemasan Signifikan Secara Klinis");

    // Subskala maksimal
    expect(resMax.subscales.physiological.skor).toBe(10);
    expect(resMax.subscales.worry.skor).toBe(11);
    expect(resMax.subscales.concentration.skor).toBe(7);

    // Lie Scale maksimal = 9
    expect(resMax.lieScale.skor).toBe(9);
  });

  it("harus mengevaluasi cut-off klinis >= 19 secara tepat", () => {
    expect(RCMAS_CLINICAL_CUTOFF).toBe(19);

    // Kasus batas 1: Skor 18 (di bawah cut-off)
    const answers18: Record<number, number> = {};
    for (let i = 1; i <= 37; i++) answers18[i] = 0;
    // Beri 10 Fisiologis + 8 Worry = 18
    RCMAS_PHYSIOLOGICAL_ITEMS.forEach((id) => (answers18[id] = 1));
    RCMAS_WORRY_ITEMS.slice(0, 8).forEach((id) => (answers18[id] = 1));

    const res18 = calculateRCMAS(answers18);
    expect(res18.totalSkor).toBe(18);
    expect(res18.isKlinisSignifikan).toBe(false);
    expect(res18.grade).toBe("Kecemasan Normal");

    // Kasus batas 2: Skor 19 (persis cut-off)
    const answers19 = { ...answers18 };
    answers19[RCMAS_WORRY_ITEMS[8]] = 1; // tambah 1 poin -> 19

    const res19 = calculateRCMAS(answers19);
    expect(res19.totalSkor).toBe(19);
    expect(res19.isKlinisSignifikan).toBe(true);
    expect(res19.grade).toBe("Kecemasan Signifikan Secara Klinis");
  });

  it("jawaban Lie Scale tidak boleh menambah skor kecemasan", () => {
    const answersOnlyLie: Record<number, number> = {};
    for (let i = 1; i <= 37; i++) answersOnlyLie[i] = 0;
    // Isi semua item Lie Scale dengan "Ya" (skor 1)
    RCMAS_LIE_ITEMS.forEach((id) => (answersOnlyLie[id] = 1));

    const res = calculateRCMAS(answersOnlyLie);
    expect(res.totalSkor).toBe(0); // Skor kecemasan TETAP 0!
    expect(res.lieScale.skor).toBe(9); // Lie Scale = 9
    expect(res.isKlinisSignifikan).toBe(false);
  });

  it("harus toleran terhadap index 0-based (0..36)", () => {
    const answers0Based: Record<number, number> = {};
    // Item 1 (index 0) = Fisiologis
    // Item 2 (index 1) = Worry
    // Item 3 (index 2) = Concentration
    // Item 4 (index 3) = Lie
    for (let i = 0; i < 37; i++) answers0Based[i] = 0;
    answers0Based[0] = 1; // Item 1 -> Fisiologis
    answers0Based[1] = 1; // Item 2 -> Worry
    answers0Based[2] = 1; // Item 3 -> Concentration
    answers0Based[3] = 1; // Item 4 -> Lie

    const res = calculateRCMAS(answers0Based);
    expect(res.totalSkor).toBe(3);
    expect(res.subscales.physiological.skor).toBe(1);
    expect(res.subscales.worry.skor).toBe(1);
    expect(res.subscales.concentration.skor).toBe(1);
    expect(res.lieScale.skor).toBe(1);
  });
});

