import { z } from 'zod'

export const createBlogSchema = z.object({
  judul: z.string().min(1, 'Judul wajib diisi'),
  slug: z.string().nullish().or(z.literal('')),
  isi: z.string().min(1, 'Isi artikel wajib diisi'),
  banner_url: z.string().nullish(),
})

export const updateBlogSchema = z.object({
  judul: z.string().min(1).optional(),
  slug: z.string().nullish().or(z.literal('')),
  isi: z.string().min(1).optional(),
  banner_url: z.string().nullish(),
})

export const blogQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
})

export type CreateBlogInput = z.infer<typeof createBlogSchema>
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>
export type BlogQueryInput = z.infer<typeof blogQuerySchema>
