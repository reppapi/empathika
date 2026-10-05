import apiClient from "@/lib/axios"

export const layananService = {
  getList: () =>
    apiClient.get("/layanan").then((r) => r.data),

  getBySlug: (slug: string) =>
    apiClient.get(`/layanan/${slug}`).then((r) => r.data),
}

