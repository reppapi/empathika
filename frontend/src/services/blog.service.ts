import apiClient from "@/lib/axios"

export const blogService = {
  getList: (params?: { page?: number; limit?: number }) =>
    apiClient.get("/blog", { params }).then((r) => r.data),

  getBySlug: (slug: string) =>
    apiClient.get(`/blog/${slug}`).then((r) => r.data),
}

