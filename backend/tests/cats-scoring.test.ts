import { describe, it, expect } from "vitest";
import { calculateCATS } from "../src/modules/psikotes/alat-ukur/cats/scoring";
import { hitungSkorAlatUkur } from "../src/modules/psikotes/alat-ukur";

describe("Kalkulasi Skoring CATS (Child and Adolescent Trauma Screen)", () => {
  it("mengembalikan skor 0 dan Normal jika klien tidak melaporkan peristiwa traumatis (PTE)", () => {
    // Skenario: Semua PTE (1..15) bernilai 0
    const answers: Record<number, number> = {};
    for (let i = 1; i <= 15; i++) answers[i] = 0;
    // Bahkan jika gejala diisi, tanpa PTE asesmen dianggap selesai
    for (let i = 16; i <= 35; i++) answers[i] = 3;

    const res = calculateCATS(answers);
    expect(res.hasPTE).toBe(false);
    expect(res.pte.totalDialami).toBe(0);
    expect(res.totalSkor).toBe(0);
    expect(res.kategori).toBe("Normal, tidak meningkat secara klinis");
    expect(res.grade).toBe("Normal");
    expect(res.cutoffKlinis).toBe(false);
  });

  it("menghitung skor dalam kategori Normal (0–14) saat ada PTE dan gejala rendah", () => {
    const answers: Record<number, number> = {};
    // Ada 1 PTE: Bencana alam (nomor 1)
    answers[1] = 1;
    for (let i = 2; i <= 15; i++) answers[i] = 0;

    // Gejala total 10: nomor 16..20 masing-masing skor 2, sisanya 0
    for (let i = 16; i <= 20; i++) answers[i] = 2; // Intrusi = 10
    for (let i = 21; i <= 35; i++) answers[i] = 0;

    const res = calculateCATS(answers);
    expect(res.hasPTE).toBe(true);
    expect(res.pte.totalDialami).toBe(1);
    expect(res.totalSkor).toBe(10);
    expect(res.kategori).toBe("Normal, tidak meningkat secara klinis");
    expect(res.grade).toBe("Normal");
    expect(res.cutoffKlinis).toBe(false);
    expect(res.subscales.intrusion.skor).toBe(10);
  });

  it("mengembalikan kategori Normal pada batas atas skor 14", () => {
    const answers: Record<number, number> = {};
    answers[1] = 1; // 1 PTE
    // 14 butir bernilai 1, 6 butir bernilai 0 -> Total = 14
    for (let i = 16; i <= 29; i++) answers[i] = 1;
    for (let i = 30; i <= 35; i++) answers[i] = 0;

    const res = calculateCATS(answers);
    expect(res.totalSkor).toBe(14);
    expect(res.kategori).toBe("Normal, tidak meningkat secara klinis");
    expect(res.cutoffKlinis).toBe(false);
  });

  it("mengembalikan kategori Distres Level Menengah Terkait Trauma pada batas bawah skor 15", () => {
    const answers: Record<number, number> = {};
    answers[2] = 1; // 1 PTE (kecelakaan)
    // 15 butir bernilai 1 -> Total = 15
    for (let i = 16; i <= 30; i++) answers[i] = 1;
    for (let i = 31; i <= 35; i++) answers[i] = 0;

    const res = calculateCATS(answers);
    expect(res.totalSkor).toBe(15);
    expect(res.kategori).toBe("Distres level menengah terkait trauma");
    expect(res.grade).toBe("Distres Menengah");
    expect(res.cutoffKlinis).toBe(false);
  });

  it("mengembalikan kategori Distres Level Menengah Terkait Trauma pada batas atas skor 20", () => {
    const answers: Record<number, number> = {};
    answers[3] = 1; // 1 PTE
    // 20 butir bernilai 1 -> Total = 20
    for (let i = 16; i <= 35; i++) answers[i] = 1;

    const res = calculateCATS(answers);
    expect(res.totalSkor).toBe(20);
    expect(res.kategori).toBe("Distres level menengah terkait trauma");
    expect(res.grade).toBe("Distres Menengah");
    expect(res.cutoffKlinis).toBe(false);
  });

  it("mengembalikan kategori Kemungkinan PTSD pada batas ambang klinis skor 21", () => {
    const answers: Record<number, number> = {};
    answers[4] = 1; // 1 PTE
    // 19 butir bernilai 1, 1 butir bernilai 2 -> Total = 21
    for (let i = 16; i <= 34; i++) answers[i] = 1;
    answers[35] = 2;

    const res = calculateCATS(answers);
    expect(res.totalSkor).toBe(21);
    expect(res.kategori).toBe("Kemungkinan PTSD");
    expect(res.grade).toBe("Kemungkinan PTSD");
    expect(res.cutoffKlinis).toBe(true);
  });

  it("mengembalikan skor maksimum 60 dan Kemungkinan PTSD saat semua 20 gejala bernilai 3", () => {
    const answers: Record<number, number> = {};
    answers[5] = 1; // 1 PTE
    for (let i = 16; i <= 35; i++) answers[i] = 3;

    const res = calculateCATS(answers);
    expect(res.totalSkor).toBe(60);
    expect(res.kategori).toBe("Kemungkinan PTSD");
    expect(res.cutoffKlinis).toBe(true);
    expect(res.subscales.intrusion.skor).toBe(15); // 5 * 3
    expect(res.subscales.avoidance.skor).toBe(6); // 2 * 3
    expect(res.subscales.cognitionMood.skor).toBe(21); // 7 * 3
    expect(res.subscales.arousal.skor).toBe(18); // 6 * 3
    expect(res.dsmEvaluation.memenuhiKriteriaGejalaDSM5).toBe(true);
  });

  it("menghitung 4 subskala klaster DSM-5 (Intrusion, Avoidance, Cognition/Mood, Hyperarousal) secara terpisah", () => {
    const answers: Record<number, number> = {};
    answers[1] = 1; // 1 PTE

    // B: Intrusi (Gejala 1..5 / Flat 16..20): skor 1, 2, 0, 1, 3 = 7
    answers[16] = 1;
    answers[17] = 2;
    answers[18] = 0;
    answers[19] = 1;
    answers[20] = 3;

    // C: Penghindaran (Gejala 6..7 / Flat 21..22): skor 2, 2 = 4
    answers[21] = 2;
    answers[22] = 2;

    // D: Kognisi & Mood Negatif (Gejala 8..14 / Flat 23..29): skor 1, 1, 2, 0, 0, 1, 2 = 7
    answers[23] = 1;
    answers[24] = 1;
    answers[25] = 2;
    answers[26] = 0;
    answers[27] = 0;
    answers[28] = 1;
    answers[29] = 2;

    // E: Hyperarousal (Gejala 15..20 / Flat 30..35): skor 2, 1, 3, 0, 1, 2 = 9
    answers[30] = 2;
    answers[31] = 1;
    answers[32] = 3;
    answers[33] = 0;
    answers[34] = 1;
    answers[35] = 2;

    const res = calculateCATS(answers);
    expect(res.subscales.intrusion.skor).toBe(7);
    expect(res.subscales.avoidance.skor).toBe(4);
    expect(res.subscales.cognitionMood.skor).toBe(7);
    expect(res.subscales.arousal.skor).toBe(9);
    expect(res.totalSkor).toBe(7 + 4 + 7 + 9); // 27
    expect(res.kategori).toBe("Kemungkinan PTSD");
  });

  it("menyimpan 5 aspek fungsi psikososial tanpa menambahkan nilainya ke skor gejala 0–60", () => {
    const answers: Record<number, number> = {};
    answers[1] = 1; // 1 PTE
    // Gejala total = 10
    for (let i = 16; i <= 25; i++) answers[i] = 1;
    for (let i = 26; i <= 35; i++) answers[i] = 0;

    // 5 Aspek Psikososial (Flat 36..40) semuanya Ya (1)
    for (let i = 36; i <= 40; i++) answers[i] = 1;

    const res = calculateCATS(answers);
    // Skor gejala TETAP 10 (tidak ditambah 5 poin fungsi psikososial)
    expect(res.totalSkor).toBe(10);
    expect(res.kategori).toBe("Normal, tidak meningkat secara klinis");

    // Aspek fungsi psikososial tersimpan dengan benar
    expect(res.fungsiPsikososial.totalTerganggu).toBe(5);
    expect(res.fungsiPsikososial.aspek.pergaulan).toBe(true);
    expect(res.fungsiPsikososial.aspek.hobi).toBe(true);
    expect(res.fungsiPsikososial.aspek.sekolah).toBe(true);
    expect(res.fungsiPsikososial.aspek.keluarga).toBe(true);
    expect(res.fungsiPsikososial.aspek.kebahagiaanUmum).toBe(true);
  });

  it("dapat diakses via modul registry hitungSkorAlatUkur('CATS')", () => {
    const answers: Record<number, number> = {};
    answers[1] = 1;
    for (let i = 16; i <= 35; i++) answers[i] = 1; // Total = 20

    const res = hitungSkorAlatUkur("CATS", answers);
    expect(res.totalSkor).toBe(20);
    expect(res.kategori).toBe("Distres level menengah terkait trauma");
    expect(res.grade).toBe("Distres Menengah");
  });

  it("menyimpan dan memformat peristiwaLainnya (butir 15) dan peristiwaPalingMengganggu", () => {
    const answers: Record<string | number, any> = {
      15: 1,
      peristiwa_lainnya: "Mengalami bullying parah di sekolah",
      peristiwa_paling_mengganggu: "Bullying di sekolah",
    };
    for (let i = 16; i <= 35; i++) answers[i] = 1;

    const res = calculateCATS(answers);
    expect(res.hasPTE).toBe(true);
    expect(res.pte.totalDialami).toBe(1);
    expect(res.pte.peristiwaLainnya).toBe("Mengalami bullying parah di sekolah");
    expect(res.pte.peristiwaPalingMengganggu).toBe("Bullying di sekolah");
    expect(res.pte.daftarPeristiwa[0].teks).toBe('Peristiwa lainnya: "Mengalami bullying parah di sekolah"');
  });
});

