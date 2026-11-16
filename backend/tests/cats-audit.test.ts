import { describe, it, expect } from "vitest";
import { CATS_SOAL, CATS_OPSI_YA_TIDAK, CATS_OPSI_GEJALA, CATS_INTERPRETASI } from "../prisma/seeds-psikotes/seeds/seed-cats";
import { CATS_CONFIG } from "../src/modules/psikotes/alat-ukur/cats/config";
import { calculateCATS } from "../src/modules/psikotes/alat-ukur/cats/scoring";
import { getAlatUkur } from "../src/modules/psikotes/alat-ukur";

describe("Audit Kelayakan & Integritas Alat Ukur CATS (Child and Adolescent Trauma Screen)", () => {
  it("A. Verifikasi Metadata & Konfigurasi Modul", () => {
    expect(CATS_CONFIG.kode).toBe("CATS");
    expect(CATS_CONFIG.nama).toContain("Child and Adolescent Trauma Screen");
    expect(CATS_CONFIG.targetUsia).toBe("7–17 tahun");
    expect(CATS_CONFIG.rentangSkorTotal).toBe("0 – 60");
    expect(CATS_CONFIG.cutoff).toContain("≥ 21");
    expect(CATS_CONFIG.dimensiList).toHaveLength(6);

    // Pastikan terdaftar di registri pusat
    const modul = getAlatUkur("CATS");
    expect(modul).not.toBeNull();
    expect(modul?.config.kode).toBe("CATS");
  });

  it("B. Verifikasi Seeder Soal (Total 40 Butir: 15 PTE + 20 Gejala + 5 Fungsi Psikososial)", () => {
    expect(CATS_SOAL).toHaveLength(40);

    // Periksa urutan nomor 1 s/d 40
    for (let i = 0; i < 40; i++) {
      expect(CATS_SOAL[i].no).toBe(i + 1);
    }

    // Butir 1..15 adalah PTE
    const pteItems = CATS_SOAL.slice(0, 15);
    expect(pteItems.every((q) => q.kategori === "PTE")).toBe(true);

    // Butir 16..35 adalah Gejala PTSD DSM-5
    const gejalaItems = CATS_SOAL.slice(15, 35);
    expect(gejalaItems.every((q) => q.kategori === "GEJALA_PTSD")).toBe(true);
    expect(gejalaItems).toHaveLength(20);

    // Butir 36..40 adalah Fungsi Psikososial
    const fungsiItems = CATS_SOAL.slice(35, 40);
    expect(fungsiItems.every((q) => q.kategori === "FUNGSI_PSIKOSOSIAL")).toBe(true);
    expect(fungsiItems).toHaveLength(5);
  });

  it("C. Verifikasi Opsi Pilihan Jawaban", () => {
    // PTE & Fungsi: Ya/Tidak (0 dan 1)
    expect(CATS_OPSI_YA_TIDAK).toHaveLength(2);
    expect(CATS_OPSI_YA_TIDAK[0]).toEqual({ label: "0", text: "Tidak", bobot: 0 });
    expect(CATS_OPSI_YA_TIDAK[1]).toEqual({ label: "1", text: "Ya", bobot: 1 });

    // Gejala PTSD: Skala Likert 0–3
    expect(CATS_OPSI_GEJALA).toHaveLength(4);
    expect(CATS_OPSI_GEJALA[0]).toEqual({ label: "0", text: "Tidak pernah", bobot: 0 });
    expect(CATS_OPSI_GEJALA[1]).toEqual({ label: "1", text: "Sesekali", bobot: 1 });
    expect(CATS_OPSI_GEJALA[2]).toEqual({ label: "2", text: "Separuh waktu", bobot: 2 });
    expect(CATS_OPSI_GEJALA[3]).toEqual({ label: "3", text: "Hampir selalu", bobot: 3 });
  });

  it("D. Verifikasi 3 Kategori Interpretasi Sesuai Handout Resmi", () => {
    expect(CATS_INTERPRETASI).toHaveLength(3);

    // Tier 1: Normal (0–14)
    expect(CATS_INTERPRETASI[0].min_skor).toBe(0);
    expect(CATS_INTERPRETASI[0].max_skor).toBe(14);
    expect(CATS_INTERPRETASI[0].grade).toBe("Normal, tidak meningkat secara klinis");
    expect(CATS_INTERPRETASI[0].tips.length).toBeGreaterThanOrEqual(3);

    // Tier 2: Distres Menengah (15–20)
    expect(CATS_INTERPRETASI[1].min_skor).toBe(15);
    expect(CATS_INTERPRETASI[1].max_skor).toBe(20);
    expect(CATS_INTERPRETASI[1].grade).toBe("Distres level menengah terkait trauma");
    expect(CATS_INTERPRETASI[1].tips.length).toBeGreaterThanOrEqual(3);

    // Tier 3: Kemungkinan PTSD (21–60)
    expect(CATS_INTERPRETASI[2].min_skor).toBe(21);
    expect(CATS_INTERPRETASI[2].max_skor).toBe(60);
    expect(CATS_INTERPRETASI[2].grade).toBe("Kemungkinan PTSD");
    expect(CATS_INTERPRETASI[2].tips.length).toBeGreaterThanOrEqual(3);
  });

  it("E. Verifikasi Skenario Klinis Mandiri", () => {
    // Skenario 1: Tidak ada PTE sama sekali
    const zeroPTE: Record<number, number> = {};
    for (let i = 1; i <= 40; i++) zeroPTE[i] = 0;
    const resZero = calculateCATS(zeroPTE);
    expect(resZero.totalSkor).toBe(0);
    expect(resZero.hasPTE).toBe(false);
    expect(resZero.kategori).toBe("Normal, tidak meningkat secara klinis");

    // Skenario 2: 1 PTE dialami, gejala sedang (skor 18)
    const midStress: Record<number, number> = {};
    midStress[1] = 1; // PTE bencana alam
    for (let i = 2; i <= 15; i++) midStress[i] = 0;
    // 18 gejala bernilai 1, 2 gejala bernilai 0 -> Total = 18
    for (let i = 16; i <= 33; i++) midStress[i] = 1;
    for (let i = 34; i <= 35; i++) midStress[i] = 0;
    // Fungsi psikososial: 2 area terganggu
    midStress[36] = 1;
    midStress[37] = 1;
    midStress[38] = 0;
    midStress[39] = 0;
    midStress[40] = 0;

    const resMid = calculateCATS(midStress);
    expect(resMid.totalSkor).toBe(18);
    expect(resMid.kategori).toBe("Distres level menengah terkait trauma");
    expect(resMid.fungsiPsikososial.totalTerganggu).toBe(2);
    // Pastikan skor tidak terpengaruh 2 poin fungsi psikososial
    expect(resMid.totalSkor).toBe(18);

    // Skenario 3: Kemungkinan PTSD (skor 32)
    const ptsdCase: Record<number, number> = {};
    ptsdCase[8] = 1; // 1 PTE pelecehan
    ptsdCase[10] = 1; // 1 PTE kehilangan orang dekat
    for (let i = 1; i <= 15; i++) {
      if (i !== 8 && i !== 10) ptsdCase[i] = 0;
    }
    // 16 butir bernilai 2 -> Total = 32
    for (let i = 16; i <= 31; i++) ptsdCase[i] = 2;
    for (let i = 32; i <= 35; i++) ptsdCase[i] = 0;
    // 4 aspek fungsi terganggu
    for (let i = 36; i <= 39; i++) ptsdCase[i] = 1;
    ptsdCase[40] = 0;

    const resPTSD = calculateCATS(ptsdCase);
    expect(resPTSD.totalSkor).toBe(32);
    expect(resPTSD.kategori).toBe("Kemungkinan PTSD");
    expect(resPTSD.cutoffKlinis).toBe(true);
    expect(resPTSD.pte.totalDialami).toBe(2);
    expect(resPTSD.fungsiPsikososial.totalTerganggu).toBe(4);
  });
});

