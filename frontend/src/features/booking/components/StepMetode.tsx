"use client"
import { useBookingFlowStore } from "@/store/bookingFlowStore"
import { Button } from "@/components/ui/Button"

export function StepMetode() {
  const setMetode = useBookingFlowStore((s) => s.setMetode)

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold">Pilih Metode Konsultasi</h3>
      <div className="flex gap-4">
        <Button onClick={() => setMetode("online")}>Online (Video Call)</Button>
        <Button variant="outline" onClick={() => setMetode("offline")}>Offline (Tatap Muka)</Button>
      </div>
    </div>
  )
}

