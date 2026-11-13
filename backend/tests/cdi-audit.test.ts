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
import { CDI_SOAL, CDI_INTERPRETASI } from "../prisma/seeds-psikotes/seeds/seed-cdi";
import { CDI_CONFIG } from "../src/modules/psikotes/alat-ukur/cdi/config";

describe("AUDIT MENYELURUH IMPLEMENTASI CDI (CHILDREN'S DEPRESSION INVENTORY)", () => {
  // ==========================================================================
  // FOKUS 1: Pemetaan Seluruh 27 Butir Soal ke Dimensi
  // ==========================================================================
  describe("Fokus 1: Pemetaan 27 Butir ke 5 Dimensi", () => {
    it("1.1 Seluruh 27 butir harus terpetakan tepat sesuai tabel acuan", () => {
      // 1. Negative Mood (Suasana Hati Negatif): 1, 3, 6, 10, 11, 26 (6 butir)
      expect(CDI_NEGATIVE_MOOD_ITEMS).toEqual([1, 3, 6, 10, 11, 26]);
      expect(CDI_NEGATIVE_MOOD_ITEMS.length).toBe(6);

      // 2. Interpersonal Problems (Masalah Antarpribadi): 5, 8, 12, 27 (4 butir)
      expect(CDI_INTERPERSONAL_ITEMS).toEqual([5, 8, 12, 27]);
      expect(CDI_INTERPERSONAL_ITEMS.length).toBe(4);

      // 3. Ineffectiveness (Ketidakefektifan): 2, 15, 23, 24 (4 butir)
      expect(CDI_INEFFECTIVENESS_ITEMS).toEqual([2, 15, 23, 24]);
      expect(CDI_INEFFECTIVENESS_ITEMS.length).toBe(4);

      // 4. Anhedonia (Kehilangan Minat/Kesenangan): 4, 16, 17, 18, 19, 20, 21, 22 (8 butir)
      expect(CDI_ANHEDONIA_ITEMS).toEqual([4, 16, 17, 18, 19, 20, 21, 22]);
      expect(CDI_ANHEDONIA_ITEMS.length).toBe(8);

      // 5. Negative Self-Esteem (Harga Diri Negatif): 7, 9, 13, 14, 25 (5 butir)
      expect(CDI_NEGATIVE_SELF_ESTEEM_ITEMS).toEqual([7, 9, 13, 14, 25]);
      expect(CDI_NEGATIVE_SELF_ESTEEM_ITEMS.length).toBe(5);
    });

    it("1.2 Tidak ada nomor butir yang hilang atau ganda (1..27 lengkap)", () => {
      const allDimItems = [
        ...CDI_NEGATIVE_MOOD_ITEMS,
        ...CDI_INTERPERSONAL_ITEMS,
        ...CDI_INEFFECTIVENESS_ITEMS,
        ...CDI_ANHEDONIA_ITEMS,
        ...CDI_NEGATIVE_SELF_ESTEEM_ITEMS,
      ];
      expect(allDimItems.length).toBe(27);
      const uniqueSet = new Set(allDimItems);
      expect(uniqueSet.size).toBe(27);
      for (let i = 1; i <= 27; i++) {
        expect(uniqueSet.has(i)).toBe(true);
      }
    });

    it("1.3 Seeder CDI_SOAL harus memiliki tepat 27 butir dengan nomor 1..27 urut", () => {
      expect(CDI_SOAL.length).toBe(27);
      CDI_SOAL.forEach((soal, idx) => {
        expect(soal.no).toBe(idx + 1);
        expect(soal.opsi.length).toBe(3);
      });
    });
  });

  // ==========================================================================
  // FOKUS 2: Arah Skoring Setiap Pilihan Jawaban (Normal vs Inversi)
  // ==========================================================================
  describe("Fokus 2: Arah Skoring Pilihan Jawaban (Normal vs Inversi)", () => {
    it("2.1 Pembagian 14 butir normal (Kelompok 1) dan 13 butir inversi (Kelompok 2)", () => {
      const kel1Expected = [1, 3, 4, 6, 9, 12, 14, 17, 19, 20, 22, 23, 26, 27];
      const kel2Expected = [2, 5, 7, 8, 10, 11, 13, 15, 16, 18, 21, 24, 25];

      expect(CDI_KELOMPOK_1_ITEMS).toEqual(kel1Expected);
      expect(CDI_KELOMPOK_2_ITEMS).toEqual(kel2Expected);
      expect(CDI_KELOMPOK_1_ITEMS.length).toBe(14);
      expect(CDI_KELOMPOK_2_ITEMS.length).toBe(13);
    });

    it("2.2 Pada seeder CDI_SOAL, bobot opsi harus presisi sesuai kelompoknya", () => {
      const kel1Set = new Set(CDI_KELOMPOK_1_ITEMS);
      const kel2Set = new Set(CDI_KELOMPOK_2_ITEMS);

      for (const item of CDI_SOAL) {
        if (kel1Set.has(item.no)) {
          // Kelompok 1: Opsi 1 = 0, Opsi 2 = 1, Opsi 3 = 2
          expect(item.opsi[0].bobot).toBe(0);
          expect(item.opsi[1].bobot).toBe(1);
          expect(item.opsi[2].bobot).toBe(2);
        } else if (kel2Set.has(item.no)) {
          // Kelompok 2: Opsi 1 = 2, Opsi 2 = 1, Opsi 3 = 0
          expect(item.opsi[0].bobot).toBe(2);
          expect(item.opsi[1].bobot).toBe(1);
          expect(item.opsi[2].bobot).toBe(0);
        } else {
          throw new Error(`Butir ${item.no} tidak terdaftar di Kelompok 1 maupun Kelompok 2`);
        }
      }
    });

    it("2.3 Urutan tampilan pilihan harus mengikuti nomor label ('0', '1', '2') bukan disortir berdasarkan bobot", () => {
      // Pada butir inversi seperti Butir 2:
      // label '0' harus menjadi pilihan pertama: "Aku tidak pernah berhasil." (bobot 2)
      // label '2' harus menjadi pilihan ketiga: "Biasanya aku berhasil." (bobot 0)
      const butir2 = CDI_SOAL.find((s) => s.no === 2)!;
      const sortedByLabel = [...butir2.opsi].sort(
        (a, b) => (Number(a.label) || 0) - (Number(b.label) || 0)
      );

      expect(sortedByLabel[0].text).toBe("Aku tidak pernah berhasil.");
      expect(sortedByLabel[0].bobot).toBe(2);
      expect(sortedByLabel[2].text).toBe("Biasanya aku berhasil.");
      expect(sortedByLabel[2].bobot).toBe(0);

      // Jika disortir berdasarkan bobot asc, urutannya terbalik:
      const sortedByBobot = [...butir2.opsi].sort(
        (a, b) => (Number(a.bobot) || 0) - (Number(b.bobot) || 0)
      );
      expect(sortedByBobot[0].text).toBe("Biasanya aku berhasil."); // Terbalik jika sort by bobot!
    });

    it("2.4 Verifikasi rinci 14 butir normal (0->1->2) dan 13 butir inversi (2->1->0) beserta bahasan", () => {
      const normalExpected: Record<number, string> = {
        1: "Kesedihan",
        3: "Rasa bersalah",
        4: "Kesenangan",
        6: "Kekhawatiran",
        9: "Pikiran bunuh diri",
        12: "Penarikan diri",
        14: "Penampilan",
        17: "Kepenatan",
        19: "Rasa sakit",
        20: "Perasaan sendirian",
        22: "Pertemanan",
        23: "Pekerjaan sekolah",
        26: "Melakukan yang disuruh",
        27: "Pergaulan",
      };

      const inversiExpected: Record<number, string> = {
        2: "Harapan dan keberhasilan",
        5: "Sikap baik/tidak",
        7: "Perasaan terhadap diri",
        8: "Menyalahkan diri",
        10: "Keinginan menangis",
        11: "Perasaan diri disusahkan",
        13: "Pengambilan keputusan",
        15: "Mengerjakan PR",
        16: "Pola tidur",
        18: "Nafsu makan",
        21: "Perasaan senang di sekolah",
        24: "Kemampuan dibanding anak lain",
        25: "Perasaan dicintai",
      };

      // Cek jumlah
      expect(Object.keys(normalExpected).length).toBe(14);
      expect(Object.keys(inversiExpected).length).toBe(13);
      expect(Object.keys(normalExpected).length + Object.keys(inversiExpected).length).toBe(27);

      // Cek butir normal
      for (const [noStr, bahasan] of Object.entries(normalExpected)) {
        const no = Number(noStr);
        const item = CDI_SOAL.find((s) => s.no === no)!;
        expect(item).toBeDefined();
        expect(item.bahasan).toBe(bahasan);
        expect(item.opsi.map((o) => o.bobot)).toEqual([0, 1, 2]);
      }

      // Cek butir inversi
      for (const [noStr, bahasan] of Object.entries(inversiExpected)) {
        const no = Number(noStr);
        const item = CDI_SOAL.find((s) => s.no === no)!;
        expect(item).toBeDefined();
        expect(item.bahasan).toBe(bahasan);
        expect(item.opsi.map((o) => o.bobot)).toEqual([2, 1, 0]);
      }
    });
  });

  // ==========================================================================
  // FOKUS 3: Rentang Skor Total 0–54 dan Batas Maksimum Dimensi
  // ==========================================================================
  describe("Fokus 3: Rentang Skor Total & Batas Dimensi", () => {
    it("3.1 Skor total minimum = 0 dan maksimum = 54", () => {
      const allZero: Record<number, number> = {};
      const allTwo: Record<number, number> = {};
      for (let i = 1; i <= 27; i++) {
        allZero[i] = 0;
        allTwo[i] = 2;
      }

      const resMin = calculateCDI(allZero);
      expect(resMin.totalSkor).toBe(0);
      expect(resMin.maxSkor).toBe(54);

      const resMax = calculateCDI(allTwo);
      expect(resMax.totalSkor).toBe(54);
      expect(resMax.maxSkor).toBe(54);
    });

    it("3.2 Skor masing-masing dimensi tidak boleh melebihi batas maksimum teoritisnya", () => {
      const allTwo: Record<number, number> = {};
      for (let i = 1; i <= 27; i++) allTwo[i] = 2;

      const res = calculateCDI(allTwo);
      // Negative Mood: 6 butir * 2 = 12
      expect(res.subscales.negativeMood.skor).toBe(12);
      expect(res.subscales.negativeMood.max_skor).toBe(12);
      expect(res.subscales.negativeMood.total_item).toBe(6);

      // Interpersonal Problems: 4 butir * 2 = 8
      expect(res.subscales.interpersonalProblem.skor).toBe(8);
      expect(res.subscales.interpersonalProblem.max_skor).toBe(8);
      expect(res.subscales.interpersonalProblem.total_item).toBe(4);

      // Ineffectiveness: 4 butir * 2 = 8
      expect(res.subscales.ineffectiveness.skor).toBe(8);
      expect(res.subscales.ineffectiveness.max_skor).toBe(8);
      expect(res.subscales.ineffectiveness.total_item).toBe(4);

      // Anhedonia: 8 butir * 2 = 16
      expect(res.subscales.anhedonia.skor).toBe(16);
      expect(res.subscales.anhedonia.max_skor).toBe(16);
      expect(res.subscales.anhedonia.total_item).toBe(8);

      // Negative Self-Esteem: 5 butir * 2 = 10
      expect(res.subscales.negativeSelfEsteem.skor).toBe(10);
      expect(res.subscales.negativeSelfEsteem.max_skor).toBe(10);
      expect(res.subscales.negativeSelfEsteem.total_item).toBe(5);

      // Jumlah total dimensi harus persis sama dengan totalSkor
      const sumSubs =
        res.subscales.negativeMood.skor +
        res.subscales.interpersonalProblem.skor +
        res.subscales.ineffectiveness.skor +
        res.subscales.anhedonia.skor +
        res.subscales.negativeSelfEsteem.skor;
      expect(sumSubs).toBe(res.totalSkor);
    });
  });

  // ==========================================================================
  // FOKUS 4: Cut-Off Score >= 19 dan Non-Diagnostic Labeling
  // ==========================================================================
  describe("Fokus 4: Cut-off >= 19 dan Non-Diagnostic Labeling", () => {
    it("4.1 Skor 0–18 berada dalam batas wajar / non-klinis", () => {
      for (let s = 0; s <= 18; s++) {
        // Buat kombinasi jawaban yang menghasilkan total skor s
        const ans: Record<number, number> = {};
        for (let i = 1; i <= 27; i++) ans[i] = 0;
        let remaining = s;
        for (let i = 1; i <= 27 && remaining > 0; i++) {
          if (i === 9) continue; // Jangan pakai butir 9 agar ideMelukaiDiri tetap false
          const add = Math.min(2, remaining);
          ans[i] = add;
          remaining -= add;
        }

        const res = calculateCDI(ans);
        expect(res.totalSkor).toBe(s);
        expect(res.isKlinisSignifikan).toBe(false);
        expect(res.grade).toBe("Depresi Normal / Wajar");
        expect(res.kategori).toBe("Tingkat Depresi Berada dalam Batas Wajar");
      }
    });

    it("4.2 Skor 19–54 mengindikasikan kecenderungan bermakna klinis (tanpa mendiagnosis mutlak)", () => {
      for (let s = 19; s <= 54; s += 5) {
        const ans: Record<number, number> = {};
        for (let i = 1; i <= 27; i++) ans[i] = 0;
        let remaining = s;
        for (let i = 1; i <= 27 && remaining > 0; i++) {
          const add = Math.min(2, remaining);
          ans[i] = add;
          remaining -= add;
        }

        const res = calculateCDI(ans);
        expect(res.totalSkor).toBe(s);
        expect(res.isKlinisSignifikan).toBe(true);
        expect(res.grade).toBe("Depresi Bermakna Klinis");
        expect(res.kategori).toContain("Kecenderungan Depresi Bermakna Secara Klinis");
        // Pastikan tidak ada klaim vonis medis diagnosis langsung
        expect(res.kategori).not.toMatch(/^Diagnosis:/i);
        expect(res.grade).not.toMatch(/^Diagnosis:/i);
      }
    });

    it("4.3 Teks interpretasi pada seeder database tidak boleh memvonis diagnosis medis", () => {
      // Tier 1 (Normal 0-18): Menyatakan tidak ada sindrom depresi bermakna dan fluktuasi emosi adalah wajar
      expect(CDI_INTERPRETASI[0].deskripsi).toContain("tidak mengindikasikan adanya sindrom depresi yang bermakna secara klinis");
      expect(CDI_INTERPRETASI[0].deskripsi).not.toMatch(/diagnosis:/i);

      // Tier 2 (Klinis 19-54): Menyatakan skrining awal dan bukan diagnosis medis mutlak
      expect(CDI_INTERPRETASI[1].deskripsi).toMatch(/bukan diagnosis medis mutlak|bukan sebagai diagnosis/i);
      expect(CDI_INTERPRETASI[1].deskripsi).toContain("psikolog");
    });
  });

  // ==========================================================================
  // FOKUS 5: Item 9 Memicu Penanda Risiko Keselamatan & Tindak Lanjut
  // ==========================================================================
  describe("Fokus 5: Pemeriksaan Kritis Item 9 (Risiko Bunuh Diri)", () => {
    it("5.1 Item 9 = 0: Aman, tidak memicu ideMelukaiDiri", () => {
      const ans = { 9: 0 };
      const res = calculateCDI(ans);
      expect(res.ideMelukaiDiri).toBe(false);
      expect(res.catatanKlinis.some((c) => c.includes("PERHATIAN KHUSUS"))).toBe(false);
    });

    it("5.2 Item 9 = 1: Pilihan 'memikirkan untuk bunuh diri tapi tak akan melakukannya' memicu ideMelukaiDiri", () => {
      const ans = { 9: 1 };
      const res = calculateCDI(ans);
      expect(res.ideMelukaiDiri).toBe(true);
      expect(res.catatanKlinis.some((c) => c.includes("PERHATIAN KHUSUS"))).toBe(true);
    });

    it("5.3 Item 9 = 2: Pilihan 'ingin bunuh diri' memicu ideMelukaiDiri", () => {
      const ans = { 9: 2 };
      const res = calculateCDI(ans);
      expect(res.ideMelukaiDiri).toBe(true);
      expect(res.catatanKlinis.some((c) => c.includes("PERHATIAN KHUSUS"))).toBe(true);
    });
  });

  // ==========================================================================
  // FOKUS 6 & 7: Konsistensi Perhitungan Frontend vs Backend
  // ==========================================================================
  describe("Fokus 6 & 7: Konsistensi Antara Frontend dan Backend", () => {
    it("7.1 Jumlah bobot yang dipilih di frontend harus identik dengan totalSkor backend", () => {
      // Simulasikan pilihan acak untuk seluruh 27 butir
      const simulatedChoices: Record<number, number> = {}; // key: index 0..26, val: pilihan 0..2
      let frontendCalculatedScore = 0;
      const backendAnswers: Record<number, number> = {};

      CDI_SOAL.forEach((soal, idx) => {
        // Pilih opsi tertentu (misal bergantian opsi 0, 1, 2)
        const chosenOptIdx = idx % 3;
        simulatedChoices[idx] = chosenOptIdx;
        const bobotOpsi = soal.opsi[chosenOptIdx].bobot;
        frontendCalculatedScore += bobotOpsi;
        backendAnswers[soal.no] = bobotOpsi;
      });

      const backendResult = calculateCDI(backendAnswers);
      expect(backendResult.totalSkor).toBe(frontendCalculatedScore);
    });
  });

  // ==========================================================================
  // FOKUS 8: Seluruh Kemungkinan Skor & Validasi Jawaban Tidak Lengkap
  // ==========================================================================
  describe("Fokus 8: Seluruh Kemungkinan Skor & Validasi Jawaban Tidak Lengkap", () => {
    it("8.1 Menguji seluruh skor dari 0 sampai 54 dapat tercapai", () => {
      const reachedScores = new Set<number>();

      // Algoritma greedy untuk menghasilkan skor target 0..54
      for (let target = 0; target <= 54; target++) {
        const answers: Record<number, number> = {};
        let rem = target;
        for (let i = 1; i <= 27; i++) {
          const pt = Math.min(2, rem);
          answers[i] = pt;
          rem -= pt;
        }
        const res = calculateCDI(answers);
        expect(res.totalSkor).toBe(target);
        reachedScores.add(res.totalSkor);
      }

      expect(reachedScores.size).toBe(55); // 0 sampai 54 lengkap
    });

    it("8.2 Jawaban parsial / tidak lengkap: engine backend tetap aman (default ke 0 per butir tanpa NaN)", () => {
      // Hanya menjawab butir 1 dan 2
      const partialAnswers = { 1: 1, 2: 2 };
      const res = calculateCDI(partialAnswers);
      expect(res.totalSkor).toBe(3);
      expect(isNaN(res.totalSkor)).toBe(false);
      expect(isNaN(res.subscales.negativeMood.skor)).toBe(false);
      expect(isNaN(res.subscales.anhedonia.skor)).toBe(false);
    });
  });
});
