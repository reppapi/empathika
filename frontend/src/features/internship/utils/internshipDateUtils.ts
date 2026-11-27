// Helper untuk konversi string tanggal ke format YYYY-MM-DD agar kompatibel dengan input type="date"
export function toDateInputValue(val: string): string {
  if (!val) return ""
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val
  const parts = val.split(/[/-]/)
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`
    } else {
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`
    }
  }
  const d = new Date(val)
  if (!isNaN(d.getTime())) {
    return d.toISOString().split("T")[0]
  }
  return ""
}

// Helper untuk konversi YYYY-MM-DD dari input type="date" menjadi format DD/MM/YYYY
export function formatIsoToDisplayDate(isoDate: string): string {
  if (!isoDate) return ""
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    const [y, m, d] = isoDate.split("-")
    return `${d}/${m}/${y}`
  }
  return isoDate
}
