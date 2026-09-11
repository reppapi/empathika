import { psikologService } from "@/services/psikolog.service"
import { useQuery } from "@tanstack/react-query"
import type { PsikologFilter } from "@/types/psikolog.types"

export function usePsikologList(filter?: PsikologFilter) {
  return useQuery({
    queryKey: ["psikolog", "list", filter],
    queryFn: () => psikologService.getList(filter),
  })
}

