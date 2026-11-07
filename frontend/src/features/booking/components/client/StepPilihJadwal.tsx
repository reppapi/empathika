"use client"
import { useBookingFlowStore } from "@/store/bookingFlowStore"
import { Button } from "@/components/ui/Button"

const jadwalList: Array<{ id: string; tanggal: string; waktu: string }> = []

export function StepPilihJadwal() {
  const setJadwal = useBookingFlowStore((s) => s.setJadwal)

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-semibold">Pilih Jadwal</h3>
      {jadwalList.length === 0 ? (
        <p className="text-xs text-gray-500">Tidak ada jadwal tersedia.</p>
      ) : (
        jadwalList.map((j) => (
          <Button key={j.id} variant="outline" onClick={() => setJadwal(j.id)}>
            {j.tanggal} - {j.waktu}
          </Button>
        ))
      )}
    </div>
  )
}
