"use client"
import { useState } from "react"
import { useBookingFlowStore } from "@/store/bookingFlowStore"
import { Button } from "@/components/ui/Button"

// TODO: Fetch jadwal nyata dari API berdasarkan psikologId
const mockJadwal = [
  { id: "j1", tanggal: "2025-01-15", waktu: "09:00" },
  { id: "j2", tanggal: "2025-01-15", waktu: "11:00" },
  { id: "j3", tanggal: "2025-01-16", waktu: "14:00" },
]

export function StepPilihJadwal() {
  const setJadwal = useBookingFlowStore((s) => s.setJadwal)

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-semibold">Pilih Jadwal</h3>
      {mockJadwal.map((j) => (
        <Button key={j.id} variant="outline" onClick={() => setJadwal(j.id)}>
          {j.tanggal} - {j.waktu}
        </Button>
      ))}
    </div>
  )
}

