import { describe, it, expect } from "vitest";
import { calculateCHOCI } from "../src/modules/psikotes/alat-ukur/choci-r/scoring";

describe("CHOCI-R (Children’s Obsessive-Compulsive Inventory – Revised) Scoring Logic", () => {
  it("harus menghitung skor 0 ketika seluruh jawaban bernilai 0", () => {
    const zeroAnswers: Record<number, number> = {};
    for (let i = 1; i <= 38; i++) {
      zeroAnswers[i] = 0;
    }

    const res = calculateCHOCI(zeroAnswers);

    expect(res.scores.compulsionSymptoms).toBe(0);
    expect(res.scores.compulsionSeverity).toBe(0);
    expect(res.scores.obsessionSymptoms).toBe(0);
    expect(res.scores.obsessionSeverity).toBe(0);
    expect(res.scores.totalSymptoms).toBe(0);
    expect(res.scores.totalImpairment).toBe(0);
    expect(res.tanpaSkorTotal).toBe(true);
    expect(res.hasInterpretation).toBe(false);
  });

  it("harus menghitung skor maksimum dengan benar (Total Symptoms 40, Total Impairment 48)", () => {
    const maxAnswers: Record<number, number> = {};
    // Butir 1–10: gejala kompulsi maks 2
    for (let i = 1; i <= 10; i++) maxAnswers[i] = 2;
    // Butir 11–13: isian (skor 0)
    for (let i = 11; i <= 13; i++) maxAnswers[i] = 0;
    // Butir 14–19: keparahan kompulsi maks 4
    for (let i = 14; i <= 19; i++) maxAnswers[i] = 4;
    // Butir 20–29: gejala obsesi maks 2
    for (let i = 20; i <= 29; i++) maxAnswers[i] = 2;
    // Butir 30–32: isian (skor 0)
    for (let i = 30; i <= 32; i++) maxAnswers[i] = 0;
    // Butir 33–38: keparahan obsesi maks 4
    for (let i = 33; i <= 38; i++) maxAnswers[i] = 4;

    const res = calculateCHOCI(maxAnswers);

    expect(res.scores.compulsionSymptoms).toBe(20);
    expect(res.scores.compulsionSeverity).toBe(24);
    expect(res.scores.obsessionSymptoms).toBe(20);
    expect(res.scores.obsessionSeverity).toBe(24);
    expect(res.scores.totalSymptoms).toBe(40);
    expect(res.scores.totalImpairment).toBe(48);
  });

  it("harus menghitung subskala secara terpisah sesuai rentang butir", () => {
    const mixedAnswers: Record<number, number> = {};
    for (let i = 1; i <= 38; i++) mixedAnswers[i] = 0;

    // Kompulsi saja: gejala 1–5 bernilai 1 -> total 5
    mixedAnswers[1] = 1;
    mixedAnswers[2] = 1;
    mixedAnswers[3] = 1;
    mixedAnswers[4] = 1;
    mixedAnswers[5] = 1;

    // Keparahan kompulsi: 14 dan 15 bernilai 3 -> total 6
    mixedAnswers[14] = 3;
    mixedAnswers[15] = 3;

    // Obsesi: gejala 20 bernilai 2 -> total 2
    mixedAnswers[20] = 2;

    // Keparahan obsesi: 33 bernilai 4 -> total 4
    mixedAnswers[33] = 4;

    const res = calculateCHOCI(mixedAnswers);

    expect(res.scores.compulsionSymptoms).toBe(5);
    expect(res.scores.compulsionSeverity).toBe(6);
    expect(res.scores.obsessionSymptoms).toBe(2);
    expect(res.scores.obsessionSeverity).toBe(4);
    expect(res.scores.totalSymptoms).toBe(7); // 5 + 2
    expect(res.scores.totalImpairment).toBe(10); // 6 + 4
  });

  it("harus mengekstrak teks isian kualitatif pada butir 11–13 dan 30–32", () => {
    const answers: Record<string | number, any> = {
      11: "Cuci tangan berulang kali",
      12: "Mengecek kunci pintu",
      30: "Takut menyakiti orang lain",
    };

    const res = calculateCHOCI(answers);

    expect(res.kualitatif.kebiasaanKompulsi).toContain("Cuci tangan berulang kali");
    expect(res.kualitatif.kebiasaanKompulsi).toContain("Mengecek kunci pintu");
    expect(res.kualitatif.pikiranObsesi).toContain("Takut menyakiti orang lain");
  });

  it("harus mengekstrak teks isian kualitatif dari objek choci_isian dengan pemetaan 0-based", () => {
    const answers: Record<string | number, any> = {
      choci_isian: {
        10: "Mencuci piring berulang-ulang",
        11: "Menata barang simetris",
        29: "Takut terkontaminasi debu",
      },
    };

    const res = calculateCHOCI(answers);

    expect(res.kualitatif.kebiasaanKompulsi).toEqual([
      "Mencuci piring berulang-ulang",
      "Menata barang simetris",
    ]);
    expect(res.kualitatif.pikiranObsesi).toEqual([
      "Takut terkontaminasi debu",
    ]);
  });

  it("harus me-clamp nilai yang melebihi batas batas maksimum (skala 0–2 untuk gejala, 0–4 untuk keparahan)", () => {
    const overflowAnswers: Record<number, number> = {
      1: 99, // gejala harus di-clamp ke 2
      14: 99, // keparahan harus di-clamp ke 4
    };

    const res = calculateCHOCI(overflowAnswers);

    expect(res.scores.compulsionSymptoms).toBe(2);
    expect(res.scores.compulsionSeverity).toBe(4);
  });
});
