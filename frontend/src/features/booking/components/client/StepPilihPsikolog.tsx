import { useBookingFlowStore } from "@/store/bookingFlowStore"
import { usePsikologList } from "@/features/psikolog/hooks/usePsikologList"
import { PsikologCard } from "@/features/psikolog/components/PsikologCard"

export function StepPilihPsikolog() {
  const { data: psikologs, isLoading } = usePsikologList()
  const setPsikolog = useBookingFlowStore((s) => s.setPsikolog)

  if (isLoading) return <div>Loading psikolog...</div>

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {psikologs?.map((p) => (
        <div key={p.id} onClick={() => setPsikolog(p.id)} className="cursor-pointer">
          <PsikologCard psikolog={p} />
        </div>
      ))}
    </div>
  )
}

