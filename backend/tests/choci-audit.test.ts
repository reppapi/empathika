import { describe, it, expect } from "vitest";
import { CHOCI_SOAL, CHOCI_OPSI_GEJALA, CHOCI_OPSI_ISIAN, CHOCI_INTERPRETASI } from "../prisma/seeds-psikotes/seeds/seed-choci";
import { CHOCI_CONFIG } from "../src/modules/psikotes/alat-ukur/choci-r/config";
import { calculateCHOCI } from "../src/modules/psikotes/alat-ukur/choci-r/scoring";
import { getAlatUkur } from "../src/modules/psikotes/alat-ukur";

describe("Audit Kelayakan & Integritas Alat Ukur CHOCI-R", () => {
  it("A. Verifikasi Metadata & Konfigurasi Modul", () => {
    expect(CHOCI_CONFIG.kode).toBe("CHOCI-R");
    expect(CHOCI_CONFIG.nama).toContain("Children’s Obsessive-Compulsive Inventory – Revised");
    expect(CHOCI_CONFIG.targetUsia).toBe("7–17 tahun");
    expect(CHOCI_CONFIG.rentangSkorTotal).toContain("Total Symptoms (0–40)");
    expect(CHOCI_CONFIG.dimensiList).toHaveLength(4);

    // Registri pusat
    const modul = getAlatUkur("CHOCI-R");
    expect(modul).not.toBeNull();
    expect(modul?.config.kode).toBe("CHOCI-R");

    const alias = getAlatUkur("CHOCI");
    expect(alias).not.toBeNull();
    expect(alias?.config.kode).toBe("CHOCI-R");
  });

  it("B. Verifikasi Seeder Soal (Tepat 38 Butir Pertanyaan)", () => {
    expect(CHOCI_SOAL).toHaveLength(38);

    // Periksa urutan nomor 1 s/d 38
    for (let i = 0; i < 38; i++) {
      expect(CHOCI_SOAL[i].no).toBe(i + 1);
    }

    // Butir 1..10 adalah Gejala Kompulsi
    const kompGejala = CHOCI_SOAL.slice(0, 10);
    expect(kompGejala.every((q) => q.kategori === "KOMPULSI_GEJALA")).toBe(true);

    // Butir 11..13 adalah Isian Kompulsi
    const kompIsian = CHOCI_SOAL.slice(10, 13);
    expect(kompIsian.every((q) => q.kategori === "KOMPULSI_ISIAN")).toBe(true);

    // Butir 14..19 adalah Keparahan Kompulsi (6 butir)
    const kompKeparahan = CHOCI_SOAL.slice(13, 19);
    expect(kompKeparahan.every((q) => q.kategori === "KOMPULSI_KEPARAHAN")).toBe(true);

    // Butir 20..29 adalah Gejala Obsesi (10 butir)
    const obsGejala = CHOCI_SOAL.slice(19, 29);
    expect(obsGejala.every((q) => q.kategori === "OBSESI_GEJALA")).toBe(true);

    // Butir 30..32 adalah Isian Obsesi (3 butir)
    const obsIsian = CHOCI_SOAL.slice(29, 32);
    expect(obsIsian.every((q) => q.kategori === "OBSESI_ISIAN")).toBe(true);

    // Butir 33..38 adalah Keparahan Obsesi (6 butir)
    const obsKeparahan = CHOCI_SOAL.slice(32, 38);
    expect(obsKeparahan.every((q) => q.kategori === "OBSESI_KEPARAHAN")).toBe(true);
  });

  it("C. Verifikasi Opsi Pilihan Jawaban", () => {
    // Gejala: Skala 0–2 (Tidak, Sedikit, Banyak)
    expect(CHOCI_OPSI_GEJALA).toHaveLength(3);
    expect(CHOCI_OPSI_GEJALA[0]).toEqual({ label: "0", text: "Tidak", bobot: 0 });
    expect(CHOCI_OPSI_GEJALA[1]).toEqual({ label: "1", text: "Sedikit", bobot: 1 });
    expect(CHOCI_OPSI_GEJALA[2]).toEqual({ label: "2", text: "Banyak", bobot: 2 });

    // Keparahan Kompulsi (Butir 14..19): masing-masing punya 5 opsi (bobot 0 s/d 4)
    for (let i = 13; i < 19; i++) {
      expect(CHOCI_SOAL[i].opsi).toHaveLength(5);
      const bobotList = CHOCI_SOAL[i].opsi.map((o) => o.bobot);
      expect(bobotList).toEqual([0, 1, 2, 3, 4]);
    }

    // Keparahan Obsesi (Butir 33..38): masing-masing punya 5 opsi (bobot 0 s/d 4)
    for (let i = 32; i < 38; i++) {
      expect(CHOCI_SOAL[i].opsi).toHaveLength(5);
      const bobotList = CHOCI_SOAL[i].opsi.map((o) => o.bobot);
      expect(bobotList).toEqual([0, 1, 2, 3, 4]);
    }
  });

  it("D. Verifikasi Interpretasi Master Sesuai Handout (Tanpa Cut-off Buatan)", () => {
    expect(CHOCI_INTERPRETASI).toHaveLength(1);
    expect(CHOCI_INTERPRETASI[0].grade).toBe("Profil Gejala & Keparahan CHOCI-R");
    expect(CHOCI_INTERPRETASI[0].deskripsi).toContain("Total Symptoms Score");
    expect(CHOCI_INTERPRETASI[0].deskripsi).toContain("Total Impairment Score");
  });
});

