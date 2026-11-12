/** Unit test validasi pembagian 126 butir dan skoring 9 skala kepribadian PBQ. */
import { describe, it, expect } from "vitest";
import {
  calculatePBQ,
  PBQ_TOTAL_ITEMS,
  PBQ_ITEMS_PER_SCALE,
  PBQ_MAX_SCALE_SCORE,
  PBQ_SCALE_DEFINITIONS,
} from "../src/modules/psikotes/alat-ukur/pbq/scoring";
import { PBQ_SOAL, PBQ_OPSI } from "../prisma/seeds-psikotes/seeds/seed-pbq";

describe("PBQ Psychometrics & Scoring Engine", () => {
  it("harus memiliki tepat 9 skala, 14 butir per skala, total 126 butir tanpa celah/tumpang tindih", () => {
    expect(PBQ_SCALE_DEFINITIONS.length).toBe(9);
    expect(PBQ_TOTAL_ITEMS).toBe(126);
    expect(PBQ_SOAL.length).toBe(126);

    const coveredItems = new Set<number>();
    for (const def of PBQ_SCALE_DEFINITIONS) {
      const count = def.endItem - def.startItem + 1;
      expect(count).toBe(PBQ_ITEMS_PER_SCALE);
      for (let i = def.startItem; i <= def.endItem; i++) {
        expect(coveredItems.has(i)).toBe(false);
        coveredItems.add(i);
      }
    }

    expect(coveredItems.size).toBe(126);
    for (let i = 1; i <= 126; i++) {
      expect(coveredItems.has(i)).toBe(true);
      expect(PBQ_SOAL[i - 1]?.no).toBe(i);
    }

    // Skala opsi 0..4 (Tidak Yakin Sepenuhnya .. Yakin Sepenuhnya)
    expect(PBQ_OPSI.map((o) => o.bobot)).toEqual([0, 1, 2, 3, 4]);
  });

  it("skor mentah per skala harus di rentang 0–56 dan tidak dijumlahkan menjadi skor total gabungan", () => {
    const zeroAnswers: Record<number, number> = {};
    const maxAnswers: Record<number, number> = {};
    for (let i = 1; i <= 126; i++) {
      zeroAnswers[i] = 0;
      maxAnswers[i] = 4;
    }

    const resZero = calculatePBQ(zeroAnswers);
    expect(resZero.tanpaSkorTotal).toBe(true);
    expect(resZero.totalSkor).toBe(0);
    expect(resZero.hasInterpretation).toBe(false);
    for (const s of resZero.subscalesList) {
      expect(s.skor).toBe(0);
      expect(s.max_skor).toBe(PBQ_MAX_SCALE_SCORE);
      expect(s.zScore).toBeNull();
    }

    const resMax = calculatePBQ(maxAnswers);
    expect(resMax.tanpaSkorTotal).toBe(true);
    // Wajib tetap 0 (bukan 126 * 4 = 504) karena PBQ tidak dijumlahkan jadi skor total gabungan
    expect(resMax.totalSkor).toBe(0);
    expect(resMax.hasInterpretation).toBe(false);
    for (const s of resMax.subscalesList) {
      expect(s.skor).toBe(56);
      expect(s.total_item).toBe(14);
      expect(s.zScore).toBeNull();
    }
  });

  it("harus menghitung setiap skala secara independen sesuai pembagian butir PBQ", () => {
    const answers: Record<number, number> = {};
    for (let i = 1; i <= 126; i++) answers[i] = 0;

    // 1–14 Avoidant -> semua 4 (56)
    for (let i = 1; i <= 14; i++) answers[i] = 4;
    // 57–70 Antisocial -> semua 2 (28)
    for (let i = 57; i <= 70; i++) answers[i] = 2;
    // 113–126 Paranoid -> semua 3 (42)
    for (let i = 113; i <= 126; i++) answers[i] = 3;

    const res = calculatePBQ(answers);
    expect(res.subscales.avoidant.skor).toBe(56);
    expect(res.subscales.dependent.skor).toBe(0);
    expect(res.subscales.passiveAggressive.skor).toBe(0);
    expect(res.subscales.obsessiveCompulsive.skor).toBe(0);
    expect(res.subscales.antisocial.skor).toBe(28);
    expect(res.subscales.narcissistic.skor).toBe(0);
    expect(res.subscales.histrionic.skor).toBe(0);
    expect(res.subscales.schizoid.skor).toBe(0);
    expect(res.subscales.paranoid.skor).toBe(42);
  });

  it("harus toleran terhadap key 0-based (0..125) serta meng-clamp nilai di luar 0–4", () => {
    const zeroBased: Record<number, number> = {};
    for (let i = 0; i < 126; i++) zeroBased[i] = 0;
    zeroBased[0] = 4;    // Item 1 -> Avoidant
    zeroBased[14] = 3;   // Item 15 -> Dependent
    zeroBased[28] = 2;   // Item 29 -> Passive-Aggressive
    zeroBased[42] = 1;   // Item 43 -> Obsessive-Compulsive
    zeroBased[56] = 4;   // Item 57 -> Antisocial
    zeroBased[70] = 3;   // Item 71 -> Narcissistic
    zeroBased[84] = 2;   // Item 85 -> Histrionic
    zeroBased[98] = 1;   // Item 99 -> Schizoid
    zeroBased[112] = 99; // Item 113 -> Paranoid (harus ter-clamp max 4)

    const res = calculatePBQ(zeroBased);
    expect(res.subscales.avoidant.skor).toBe(4);
    expect(res.subscales.dependent.skor).toBe(3);
    expect(res.subscales.passiveAggressive.skor).toBe(2);
    expect(res.subscales.obsessiveCompulsive.skor).toBe(1);
    expect(res.subscales.antisocial.skor).toBe(4);
    expect(res.subscales.narcissistic.skor).toBe(3);
    expect(res.subscales.histrionic.skor).toBe(2);
    expect(res.subscales.schizoid.skor).toBe(1);
    expect(res.subscales.paranoid.skor).toBe(4);
  });
});

