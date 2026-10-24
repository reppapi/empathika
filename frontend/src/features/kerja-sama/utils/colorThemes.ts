export interface ColorThemeOption {
  label: string
  value: string
  dotClass: string
  hoverClass: string
  borderClass: string
  badgeBg: string
}

export const COLOR_THEMES: ColorThemeOption[] = [
  {
    label: "Ungu Indigo",
    value: "from-purple-500 to-indigo-600",
    dotClass: "bg-gradient-to-r from-purple-500 to-indigo-600",
    hoverClass: "group-hover:bg-gradient-to-br group-hover:from-purple-500 group-hover:to-indigo-600",
    borderClass: "border-purple-300",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    label: "Biru Samudra",
    value: "from-blue-500 to-cyan-600",
    dotClass: "bg-gradient-to-r from-blue-500 to-cyan-600",
    hoverClass: "group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-cyan-600",
    borderClass: "border-blue-300",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    label: "Hijau Zamrud",
    value: "from-emerald-500 to-teal-600",
    dotClass: "bg-gradient-to-r from-emerald-500 to-teal-600",
    hoverClass: "group-hover:bg-gradient-to-br group-hover:from-emerald-500 group-hover:to-teal-600",
    borderClass: "border-emerald-300",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    label: "Oranye Amber",
    value: "from-amber-500 to-orange-600",
    dotClass: "bg-gradient-to-r from-amber-500 to-orange-600",
    hoverClass: "group-hover:bg-gradient-to-br group-hover:from-amber-500 group-hover:to-orange-600",
    borderClass: "border-amber-300",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    label: "Merah Rose",
    value: "from-rose-500 to-red-600",
    dotClass: "bg-gradient-to-r from-rose-500 to-red-600",
    hoverClass: "group-hover:bg-gradient-to-br group-hover:from-rose-500 group-hover:to-red-600",
    borderClass: "border-rose-300",
    badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
  },
  {
    label: "Pink Mawar",
    value: "from-pink-400 to-rose-500",
    dotClass: "bg-gradient-to-r from-pink-400 to-rose-500",
    hoverClass: "group-hover:bg-gradient-to-br group-hover:from-pink-400 group-hover:to-rose-500",
    borderClass: "border-pink-300",
    badgeBg: "bg-pink-50 text-pink-700 border-pink-200",
  },
  {
    label: "Abu Netral",
    value: "from-gray-600 to-gray-800",
    dotClass: "bg-gradient-to-r from-gray-600 to-gray-800",
    hoverClass: "group-hover:bg-gradient-to-br group-hover:from-gray-600 group-hover:to-gray-800",
    borderClass: "border-gray-300",
    badgeBg: "bg-gray-100 text-gray-700 border-gray-200",
  },
]

/**
 * Normalisasi format warna lama/alternatif ke salah satu opsi standar
 */
export function normalizeColorTheme(color?: string | null): string {
  if (!color) return COLOR_THEMES[0].value

  const c = color.trim()

  // 1. Cek apakah langsung match persis dengan salah satu opsi
  const exact = COLOR_THEMES.find((item) => item.value === c)
  if (exact) return exact.value

  // 2. Normalisasi format lama/alternatif jika belum match persis
  if (c.includes("pink")) return "from-pink-400 to-rose-500"
  if (c.includes("blue-400") || c.includes("cyan")) return "from-blue-500 to-cyan-600"
  if (c.includes("emerald-400") || c.includes("teal")) return "from-emerald-500 to-teal-600"
  if (c.includes("orange-400") || c.includes("amber")) return "from-amber-500 to-orange-600"
  if (c.includes("rose") || c.includes("red")) return "from-rose-500 to-red-600"
  if (c.includes("gray")) return "from-gray-600 to-gray-800"
  if (c.includes("purple") || c.includes("indigo")) return "from-purple-500 to-indigo-600"

  return c
}

/**
 * Dapatkan konfigurasi lengkap tema warna berdasarkan string value
 */
export function getColorTheme(color?: string | null): ColorThemeOption {
  const normalized = normalizeColorTheme(color)
  const found = COLOR_THEMES.find((t) => t.value === normalized)
  if (found) return found

  // Fallback aman jika custom
  return {
    label: "Kustom",
    value: normalized,
    dotClass: `bg-gradient-to-r ${normalized}`,
    hoverClass: "group-hover:bg-gradient-to-br group-hover:from-purple-500 group-hover:to-indigo-600",
    borderClass: "border-purple-200",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
  }
}
