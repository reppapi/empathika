import type { JudulPsikotesItem } from "../types/adminPsikotes";

/**
 * Nilai awal / fallback untuk daftar judul psikotes di dashboard admin.
 * Data aktual akan dimuat secara realtime dari API backend (psikotesService.getList).
 */
export const INITIAL_JUDUL_LIST: JudulPsikotesItem[] = [];
