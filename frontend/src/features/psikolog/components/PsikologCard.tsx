import type { Psikolog } from "@/types/psikolog.types"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

interface PsikologCardProps {
  psikolog: Psikolog
}

export function PsikologCard({ psikolog }: PsikologCardProps) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="font-semibold text-lg">{psikolog.name}</div>
      <div className="flex flex-wrap gap-1">
        {psikolog.specialization.map((s) => (
          <Badge key={s} variant="info">{s}</Badge>
        ))}
      </div>
      <p className="text-sm text-gray-500 line-clamp-2">{psikolog.bio}</p>
      <p className="text-sm">Online: {formatCurrency(psikolog.priceOnline)}</p>
      <Link href={`/psikolog/${psikolog.slug}`} className="text-primary text-sm font-medium">
        Lihat Profil
      </Link>
    </Card>
  )
}

