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
    { label: "Peer Konselor", value: "peer-konselor" },
  ]

  return (
    <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white/60 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-sm">
      {/* Tab Filter Kategori */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => {
          const isActive = kategoriAktif === cat.value
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => onKategoriChange(cat.value)}
              className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer active:scale-95 ${
                isActive
                  ? "bg-[#561269] text-white shadow-sm ring-2 ring-[#561269]/20"
                  : "bg-gray-100/90 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Input Search */}
      <div className="w-full md:w-80 lg:w-96">
        <Input
          placeholder="Cari nama psikolog, spesialisasi..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full text-sm"
        />
      </div>
    </div>
  )
}
