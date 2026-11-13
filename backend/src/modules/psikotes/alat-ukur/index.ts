/** Registry pusat seluruh modul alat ukur psikotes (config & fungsi skoring masing-masing instrumen). */
import { GAD7_CONFIG } from "./gad-7/config";
import { calculateGAD7 } from "./gad-7/scoring";

import { PHQ9_CONFIG } from "./phq-9/config";
import { calculatePHQ9 } from "./phq-9/scoring";

import { DASS42_CONFIG } from "./dass-42/config";
import { calculateDASS42 } from "./dass-42/scoring";

import { IGDS9SF_CONFIG } from "./igds9-sf/config";
import { calculateIGDS9SF } from "./igds9-sf/scoring";

import { RCMAS_CONFIG } from "./rcmas/config";
import { calculateRCMAS } from "./rcmas/scoring";

import { PBQ_CONFIG } from "./pbq/config";
import { calculatePBQ } from "./pbq/scoring";

import { CDI_CONFIG } from "./cdi/config";
import { calculateCDI } from "./cdi/scoring";

export interface AlatUkurModule {
  config: {
    kode: string;
    nama: string;
    kategori: string;
    targetUsia?: string;
    instruksi: string;
    instruksiSingkat?: string;
    periode?: string;
    deskripsi?: string;
  };
  calculate: (answers: Record<string | number, any>) => any;
}

// Kamus pendaftaran modul alat ukur
const registry: Record<string, AlatUkurModule> = {
  "GAD-7": {
    config: GAD7_CONFIG,
    calculate: calculateGAD7,
  },
  "PHQ-9": {
    config: PHQ9_CONFIG,
    calculate: calculatePHQ9,
  },
  "DASS-42": {
    config: DASS42_CONFIG,
    calculate: calculateDASS42,
  },
  "IGDS9-SF": {
    config: IGDS9SF_CONFIG,
    calculate: calculateIGDS9SF,
  },
  "IGDS9SF": {
    config: IGDS9SF_CONFIG,
    calculate: calculateIGDS9SF,
  },
  "RCMAS": {
    config: RCMAS_CONFIG,
    calculate: calculateRCMAS,
  },
  "PBQ": {
    config: PBQ_CONFIG,
    calculate: calculatePBQ,
  },
  "CDI": {
    config: CDI_CONFIG,
    calculate: calculateCDI,
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
