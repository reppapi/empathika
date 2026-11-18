/** Helper penentuan kategori usia peserta tes psikotes sesuai standar etika klinis */
export function determineKategoriPeserta(usia?: number | null): string | null {
  if (usia === undefined || usia === null || isNaN(Number(usia))) return null
  const numUsia = Number(usia)
  if (numUsia < 12) return 'ANAK'
  if (numUsia <= 17) return 'REMAJA'
  return 'DEWASA'
}

