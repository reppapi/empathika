"use client"

interface BookingFilterTabsProps {
  availableFilters: string[]
  currentFilter: string
  onSelectFilter: (filter: string) => void
}

export function BookingFilterTabs({
  availableFilters,
  currentFilter,
  onSelectFilter,
}: BookingFilterTabsProps) {
  return (
    <div className="mb-10 flex justify-center gap-3 flex-wrap">
      {availableFilters.map((f) => (
        <button
          key={f}
          onClick={() => onSelectFilter(f)}
          className={`px-6 py-2 rounded-full text-[13px] font-bold transition-all shadow-sm cursor-pointer ${
            currentFilter === f
              ? "bg-[#561269] text-white"
              : "bg-white text-[#561269] hover:bg-[#561269]/10"
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  )
}
