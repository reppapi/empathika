"use client"
import { Input } from "@/components/ui/Input"

interface PsikologFilterProps {
  search: string
  onSearchChange: (val: string) => void
  kategoriAktif: string
  onKategoriChange: (kategori: string) => void
}

export function PsikologFilter({
  search,
  onSearchChange,
  kategoriAktif,
  onKategoriChange,
}: PsikologFilterProps) {
  const categories = [
    { label: "Semua", value: "semua" },
    { label: "Psikolog", value: "psikolog" },
    { label: "Konselor", value: "konselor" },
  ]

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      {/* Tab Filter Kategori */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const isActive = kategoriAktif === cat.value
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => onKategoriChange(cat.value)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#561269] text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Input Search */}
      <div className="w-full sm:w-72">
        <Input
          placeholder="Cari psikolog atau spesialisasi..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  )
}
