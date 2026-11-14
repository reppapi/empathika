/**
 * Utilitas Terpusat Deteksi Instrumen Psikotes & Status Akses
 *
 * Mencegah kesalahan heuristik substring judul (seperti kata umum "stres" atau "anak")
 * dengan memprioritaskan kode unik alat ukur (`alat_ukur.kode`) dan status akses dari database.
 */

export type InstrumentCode =
  | "CATS"
  | "CDI"
  | "PBQ"
  | "RCMAS"
  | "IGDS"
  | "DASS"
  | "PHQ"
  | "GAD"
  | "UNKNOWN";

export interface DetectablePackage {
  id?: string;
  judul?: string | null;
  alat_ukur?: {
    id?: string;
    kode?: string | null;
    nama?: string | null;
  } | null;
}

/**
 * Mendeteksi kode instrumen secara deterministik.
 * Urutan prioritas:
 * 1. `alat_ukur.kode` (Master code dari database)
 * 2. Kata kunci spesifik dalam kurung atau akronim judul
 * 3. Fallback parameter ID / URL slug jika data API belum termuat
 */
export function getInstrumentCode(
  data?: DetectablePackage | null,
  fallbackIdOrSlug?: string
): InstrumentCode {
  const kode = (data?.alat_ukur?.kode || "").toUpperCase().trim();

  // 1. Prioritas Utama: Master Kode Alat Ukur di DB
  if (kode.includes("CATS")) return "CATS";
  if (kode.includes("CDI")) return "CDI";
  if (kode.includes("PBQ")) return "PBQ";
  if (kode.includes("RCMAS")) return "RCMAS";
  if (kode.includes("IGDS")) return "IGDS";
  if (kode.includes("DASS")) return "DASS";
  if (kode.includes("PHQ")) return "PHQ";
  if (kode.includes("GAD")) return "GAD";

  // 2. Prioritas Kedua: Akronim Spesifik pada Judul
  const j = (data?.judul || "").toUpperCase();
  if (j.includes("(CATS)") || j.includes(" CATS") || j.includes("TRAUMA SCREEN") || j.includes("PENGALAMAN TRAUMATIS") || j.includes("PASCATRAUMA")) return "CATS";
  if (j.includes("(CDI)") || j.includes(" CDI") || j.includes("CHILDREN'S DEPRESSION") || j.includes("DEPRESI ANAK")) return "CDI";
  if (j.includes("(PBQ)") || j.includes(" PBQ") || j.includes("POLA KEYAKINAN KEPRIBADIAN") || j.includes("KEYAKINAN DAN POLA KEPRIBADIAN")) return "PBQ";
  if (j.includes("(RCMAS)") || j.includes(" RCMAS") || (j.includes("KECEMASAN ANAK") && !j.includes("CATS"))) return "RCMAS";
  if (j.includes("(IGDS") || j.includes("IGDS9") || j.includes("BERMAIN GAME") || j.includes("KEBIASAAN BERMAIN GAME") || j.includes("GAMING")) return "IGDS";
  if (j.includes("DASS-42") || j.includes("DASS42") || (j.includes("DEPRESI") && j.includes("KECEMASAN") && j.includes("STRES"))) return "DASS";
  if (j.includes("(PHQ-9)") || j.includes("PHQ-9") || j === "TES DEPRESI" || (j.includes("SKRINING GEJALA DEPRESI AWAL") && !j.includes("CDI"))) return "PHQ";
  if (j.includes("(GAD-7)") || j.includes("GAD-7") || j === "TES KECEMASAN" || j.includes("ANXIETY TEST") || (j.includes("TINGKAT KECEMASANMU") && !j.includes("RCMAS"))) return "GAD";

  // 3. Prioritas Ketiga: Fallback ID / Slug URL
  const slug = (fallbackIdOrSlug || "").toUpperCase();
  if (slug.includes("CATS")) return "CATS";
  if (slug.includes("CDI")) return "CDI";
  if (slug.includes("PBQ")) return "PBQ";
  if (slug.includes("RCMAS")) return "RCMAS";
  if (slug.includes("IGDS") || slug.includes("GAMING")) return "IGDS";
  if (slug.includes("DASS")) return "DASS";
  if (slug.includes("PHQ")) return "PHQ";
  if (slug.includes("GAD")) return "GAD";

  return "UNKNOWN";
}

/**
 * Boolean Helper Fungsi Per Alat Ukur
 */
export function isCATS(data?: DetectablePackage | null, fallbackId?: string): boolean {
  return getInstrumentCode(data, fallbackId) === "CATS";
}

export function isCDI(data?: DetectablePackage | null, fallbackId?: string): boolean {
  return getInstrumentCode(data, fallbackId) === "CDI";
}

export function isPBQ(data?: DetectablePackage | null, fallbackId?: string): boolean {
  return getInstrumentCode(data, fallbackId) === "PBQ";
}

export function isRCMAS(data?: DetectablePackage | null, fallbackId?: string): boolean {
  return getInstrumentCode(data, fallbackId) === "RCMAS";
}

export function isIGDS(data?: DetectablePackage | null, fallbackId?: string): boolean {
  return getInstrumentCode(data, fallbackId) === "IGDS";
}

export function isDASS(data?: DetectablePackage | null, fallbackId?: string): boolean {
  return getInstrumentCode(data, fallbackId) === "DASS";
}

export function isPHQ(data?: DetectablePackage | null, fallbackId?: string): boolean {
  return getInstrumentCode(data, fallbackId) === "PHQ";
}

export function isGAD(data?: DetectablePackage | null, fallbackId?: string): boolean {
  return getInstrumentCode(data, fallbackId) === "GAD";
}

/**
 * Target Rentang Usia Baku Sesuai Materi Handout & Manual Resmi Alat Ukur
 */
export function getInstrumentTargetUsia(
  data?: DetectablePackage | null,
  fallbackId?: string
): string {
  const code = getInstrumentCode(data, fallbackId);
  switch (code) {
    case "CATS":
      return "7–17 Tahun (Anak & Remaja)";
    case "CDI":
      return "7–19 Tahun (Anak & Remaja)";
    case "RCMAS":
      return "6–19 Tahun (Anak & Remaja)";
    case "DASS":
      return "13 Tahun ke Atas (Remaja & Dewasa)";
    case "IGDS":
      return "11 Tahun ke Atas (Anak-anak hingga Dewasa)";
    case "PHQ":
      return "18 Tahun ke Atas (Dewasa)";
    case "GAD":
      return "18 Tahun ke Atas (Dewasa)";
    case "PBQ":
      return "18 Tahun ke Atas (Dewasa)";
    default: {
      const backendUsia =
        (data?.alat_ukur as any)?.targetUsia ||
        (data?.alat_ukur as any)?.targetResponden;
      if (backendUsia && typeof backendUsia === "string" && backendUsia.trim()) {
        return backendUsia.trim();
      }
      return "Remaja & Dewasa";
    }
  }
}

/**
 * Pengecekan Mutlak Status Paket Berbayar:
 * Berpegang teguh pada database `jenis_akses` dan `harga`.
 * Tidak boleh ditebak dari nama atau instrumen.
 */
export function isPackagePaid(data?: {
  jenis_akses?: string | null;
  harga?: number | string | null;
} | null): boolean {
  if (!data) return false;
  if (data.jenis_akses === "GRATIS") return false;
  if (data.jenis_akses === "BERBAYAR") return true;
  const num = typeof data.harga === "number" ? data.harga : Number(data.harga || 0);
  return num > 0;
}

