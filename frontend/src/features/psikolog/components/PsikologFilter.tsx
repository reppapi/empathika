"use client"
import { useDebounce } from "@/hooks/useDebounce"
import { useState } from "react"
import { Input } from "@/components/ui/Input"

interface PsikologFilterProps {
  onFilterChange: (filter: { search?: string; specialization?: string }) => void
}

export function PsikologFilter({ onFilterChange }: PsikologFilterProps) {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    onFilterChange({ search: e.target.value })
  }

  return (
    <div className="flex gap-4">
      <Input
        placeholder="Cari psikolog..."
        value={search}
        onChange={handleSearch}
      />
    </div>
  )
}

