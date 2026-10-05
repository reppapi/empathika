import { psikologService } from "@/services/psikolog.service"
import { useQuery } from "@tanstack/react-query"

export function usePsikologDetail(slug: string) {
  return useQuery({
    queryKey: ["psikolog", "detail", slug],
    queryFn: () => psikologService.getBySlug(slug),
    enabled: !!slug,
  })
}

