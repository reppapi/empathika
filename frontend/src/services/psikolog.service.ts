import apiClient from "@/lib/axios"
import type { Psikolog, PsikologFilter } from "@/types/psikolog"

export const psikologService = {
  getList: (filter?: PsikologFilter) =>
    apiClient.get<Psikolog[]>("/psikolog", { params: filter }).then((r) => r.data),

  getBySlug: (slug: string) =>
    apiClient.get<Psikolog>(`/psikolog/${slug}`).then((r) => r.data),

  getJadwal: (psikologId: string) =>
    apiClient.get(`/psikolog/${psikologId}/jadwal`).then((r) => r.data),
}

