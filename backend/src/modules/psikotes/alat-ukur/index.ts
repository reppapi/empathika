import { GAD7_CONFIG } from "./gad-7/config";
import { GAD7_QUESTIONS, GAD7_OPTIONS, GAD7_DIFFICULTY_QUESTION } from "./gad-7/questions";
import { calculateGAD7, GAD7CalculationResult, GAD7_LEVELS } from "./gad-7/scoring";

import { PHQ9_CONFIG } from "./phq-9/config";
import { PHQ9_QUESTIONS, PHQ9_OPTIONS, PHQ9_DIFFICULTY_QUESTION } from "./phq-9/questions";
import { calculatePHQ9, PHQ9CalculationResult, PHQ9_LEVELS } from "./phq-9/scoring";

import { DASS42_CONFIG } from "./dass-42/config";
import { DASS42_QUESTIONS, DASS42_OPTIONS } from "./dass-42/questions";
import { calculateDASS42, DASS42CalculationResult, DASS42_LEVELS } from "./dass-42/scoring";

import { IGDS9SF_CONFIG } from "./igds9-sf/config";
import { IGDS9SF_QUESTIONS, IGDS9SF_OPTIONS } from "./igds9-sf/questions";
import { calculateIGDS9SF, IGDS9SFCalculationResult, IGDS9SF_LEVELS } from "./igds9-sf/scoring";

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
  "PHQ-9": {
    config: PHQ9_CONFIG,
    questions: PHQ9_QUESTIONS,
    options: PHQ9_OPTIONS,
    additionalQuestions: [PHQ9_DIFFICULTY_QUESTION],
    levels: PHQ9_LEVELS,
    calculate: calculatePHQ9,
  },
  "DASS-42": {
    config: DASS42_CONFIG,
    questions: DASS42_QUESTIONS,
    options: DASS42_OPTIONS,
    levels: DASS42_LEVELS,
    calculate: calculateDASS42,
  },
  "IGDS9-SF": {
    config: IGDS9SF_CONFIG,
    questions: IGDS9SF_QUESTIONS,
    options: IGDS9SF_OPTIONS,
    levels: IGDS9SF_LEVELS,
    calculate: calculateIGDS9SF,
  },
  "IGDS9SF": {
    config: IGDS9SF_CONFIG,
    questions: IGDS9SF_QUESTIONS,
    options: IGDS9SF_OPTIONS,
    levels: IGDS9SF_LEVELS,
    calculate: calculateIGDS9SF,
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
    tips: lvl.saran,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

