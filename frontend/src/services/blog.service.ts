import apiClient from "@/lib/axios"

export interface CreateBlogDto {
  judul: string
  isi: string
  banner_url?: string | null
}

export interface UpdateBlogDto {
  judul?: string
  isi?: string
  banner_url?: string | null
}

export const blogService = {
  getList: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get("/blog", { params }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get(`/blog/${id}`).then((r) => r.data),

  create: (data: CreateBlogDto) =>
    apiClient.post("/blog", data).then((r) => r.data),

  update: (id: string, data: UpdateBlogDto) =>
    apiClient.put(`/blog/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/blog/${id}`).then((r) => r.data),
}
