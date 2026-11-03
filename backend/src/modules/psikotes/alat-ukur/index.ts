import { GAD7_CONFIG } from "./gad-7/config";
import { GAD7_QUESTIONS, GAD7_OPTIONS, GAD7_DIFFICULTY_QUESTION } from "./gad-7/questions";
import { calculateGAD7, GAD7CalculationResult, GAD7_LEVELS } from "./gad-7/scoring";

export interface AlatUkurModule {
  config: {
    kode: string;
    nama: string;
    kategori: string;
    targetUsia?: string;
    instruksi: string;
    deskripsi?: string;
  };
  questions: Array<{ id: number; text: string }>;
  options: Array<{ value: number; label: string; text: string }>;
  additionalQuestions?: any[];
  levels: Array<{
    min: number;
    max: number;
    grade: string;
    kategori: string;
    deskripsi: string;
    saran: string[];
  }>;
  calculate: (answers: Record<string | number, any>) => any;
}

// Kamus pendaftaran modul alat ukur
const registry: Record<string, AlatUkurModule> = {
  "GAD-7": {
    config: GAD7_CONFIG,
    questions: GAD7_QUESTIONS,
    options: GAD7_OPTIONS,
    additionalQuestions: [GAD7_DIFFICULTY_QUESTION],
    levels: GAD7_LEVELS,
    calculate: calculateGAD7,
  },
};

/**
 * Mengambil modul alat ukur berdasarkan kode baku (misal "GAD-7")
 */
export function getAlatUkur(kode: string): AlatUkurModule | null {
  const normalizedKey = (kode || "").trim().toUpperCase();
  return registry[normalizedKey] || null;
}

/**
 * Menghitung skor alat ukur secara dinamis
 */
export function hitungSkorAlatUkur(kode: string, jawaban: Record<string | number, any>) {
  const modul = getAlatUkur(kode);
  if (!modul) {
    throw new Error(`Modul alat ukur dengan kode '${kode}' belum terdaftar di sistem.`);
  }
  return modul.calculate(jawaban);
}

/**
 * Mengambil paket pertanyaan & pilihan jawaban untuk disajikan ke peserta
 */
export function getSoalDanOpsiAlatUkur(kode: string) {
  const modul = getAlatUkur(kode);
  if (!modul) return null;

  return {
    config: modul.config,
    soal: modul.questions,
    pilihan_jawaban: modul.options,
    pertanyaan_tambahan: modul.additionalQuestions || [],
    levels: modul.levels,
  };
}

/**
 * Menghasilkan struktur `soal_psikotes` lengkap yang kompatibel dengan frontend
 */
export function formatSoalPsikotesForAlatUkur(idPaket: string, kode: string) {
  const modul = getAlatUkur(kode);
  if (!modul) return [];

  return modul.questions.map((q) => {
    const soalId = `${kode.toLowerCase()}-q-${q.id}`;
    return {
      id: soalId,
      id_paket: idPaket,
      urutan: q.id,
      pertanyaan: q.text,
      createdAt: new Date(),
      updatedAt: new Date(),
      pilihan_jawaban: modul.options.map((opt) => ({
        id: `${soalId}-opt-${opt.value}`,
        id_soal: soalId,
        label: opt.label,
        teks_jawaban: opt.text,
        bobot: opt.value,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    };
  });
}

/**
 * Menghasilkan struktur `interpretasi_psikotes` lengkap yang kompatibel dengan frontend
 */
export function formatInterpretasiForAlatUkur(idPaket: string, kode: string) {
  const modul = getAlatUkur(kode);
  if (!modul) return [];

  return modul.levels.map((lvl, idx) => ({
    id: `${kode.toLowerCase()}-int-${idx + 1}`,
    id_paket: idPaket,
    min_skor: lvl.min,
    max_skor: lvl.max,
    grade: lvl.grade,
    judul: lvl.kategori,
    deskripsi: lvl.deskripsi,
    makna: null,
    tips: lvl.saran,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

