// =====================================================================
// Business Constants & Shared Financial Calculations
// =====================================================================

export const PSIKOLOG_SHARE = 0.6 // 60% untuk Psikolog
export const EMPATHIKA_SHARE = 0.4 // 40% untuk Empathika Platform

/**
 * Format angka ke format mata uang Rupiah tanpa desimal
 * Jika kosong, null, undefined, atau 0, mengembalikan '-'
 */
export function formatRupiahPendapatan(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(amount) || amount <= 0) {
    return '-'
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Math.round(amount))
}

/**
 * Menghitung nominal pendapatan psikolog (60%)
 */
export function calculatePsikologIncome(fullPrice?: number | null): number {
  if (!fullPrice || fullPrice <= 0) return 0
  return Math.round(fullPrice * PSIKOLOG_SHARE)
}
