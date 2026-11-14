import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "from-purple-500", "to-indigo-600",
    "from-blue-400", "to-blue-600",
    "from-blue-500", "to-cyan-600",
    "from-emerald-400", "to-teal-500",
    "from-emerald-500", "to-teal-600",
    "from-orange-400", "to-red-500",
    "from-amber-500", "to-orange-600",
    "from-gray-600", "to-gray-800",
    "from-rose-500", "to-red-600",
    "from-pink-400", "to-rose-500",
    "group-hover:from-purple-500", "group-hover:to-indigo-600",
    "group-hover:from-blue-400", "group-hover:to-blue-600",
    "group-hover:from-blue-500", "group-hover:to-cyan-600",
    "group-hover:from-emerald-400", "group-hover:to-teal-500",
    "group-hover:from-emerald-500", "group-hover:to-teal-600",
    "group-hover:from-orange-400", "group-hover:to-red-500",
    "group-hover:from-amber-500", "group-hover:to-orange-600",
    "group-hover:from-gray-600", "group-hover:to-gray-800",
    "group-hover:from-rose-500", "group-hover:to-red-600",
    "group-hover:from-pink-400", "group-hover:to-rose-500",
    "group-hover:bg-gradient-to-br",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",
        secondary: "#6366F1",
      },
      fontFamily: {
        poppins: ["var(--font-poppins)", "Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
}

export default config

