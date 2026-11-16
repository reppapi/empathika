import apiClient from "@/lib/axios"
import type {
  BlogQueryParams,
  BlogListApiResponse,
  BlogDetailApiResponse,
  BlogMutationApiResponse,
} from "@/features/blog/types"

export interface CreateBlogDto {
  judul: string
  isi: string
  banner_url?: string | null
  tanggal_terbit?: string | Date
}

export interface UpdateBlogDto {
  judul?: string
  isi?: string
  banner_url?: string | null
  tanggal_terbit?: string | Date
}

export const blogService = {
  getList: (params?: BlogQueryParams): Promise<BlogListApiResponse> =>
    apiClient.get<BlogListApiResponse>("/blog", { params }).then((r) => r.data),

  getById: (id: string): Promise<BlogDetailApiResponse> =>
    apiClient.get<BlogDetailApiResponse>(`/blog/${id}`).then((r) => r.data),

  create: (data: CreateBlogDto): Promise<BlogMutationApiResponse> =>
    apiClient.post<BlogMutationApiResponse>("/blog", data).then((r) => r.data),

  update: (id: string, data: UpdateBlogDto): Promise<BlogMutationApiResponse> =>
    apiClient.put<BlogMutationApiResponse>(`/blog/${id}`, data).then((r) => r.data),

  delete: (id: string): Promise<{ success: boolean; message: string; data: null }> =>
    apiClient.delete(`/blog/${id}`).then((r) => r.data),
}
