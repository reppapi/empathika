/**
 * Utility untuk memisahkan teks deskripsi Layanan (khususnya Workshop & Seminar).
 *
 * Logika:
 * - Paragraf pertama (sebelum tombol Enter / newline):
 *   Otomatis menjadi Teks Pengantar Utama (intro) di bagian atas, di atas bagian Manfaat Workshop / Seminar.
 * - Paragraf berikutnya (setelah tombol Enter):
 *   Otomatis masuk ke kotak penjelasan di bawah bagian Manfaat Workshop / Seminar (additionalInfo).
 */
export function parseWorkshopSeminarDeskripsi(deskripsi?: string | null): {
  intro: string
  additionalInfo: string
} {
  if (!deskripsi || !deskripsi.trim()) {
    return { intro: "", additionalInfo: "" }
  }

  // Pisahkan berdasarkan Enter (mendukung single enter \n maupun multiple enter \n\n)
  const parts = deskripsi
    .split(/\r?\n+/)
    .map((s) => s.trim())
    .filter(Boolean)

  if (parts.length === 0) {
    return { intro: "", additionalInfo: "" }
  }

  if (parts.length === 1) {
    return {
      intro: parts[0],
      additionalInfo: "",
    }
  }

  // Paragraf 1 (sebelum Enter) = Teks Pengantar Utama di atas Manfaat
  const intro = parts[0]

  // Paragraf berikutnya (setelah Enter) = Kotak Penjelasan di bawah Manfaat
  const additionalInfo = parts.slice(1).join("\n\n")

  return {
    intro,
    additionalInfo,
  }
}

