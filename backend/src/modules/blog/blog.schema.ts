import { z } from 'zod'

// ==========================================
// PARAMETERS & QUERY SCHEMAS
// ==========================================
export const blogIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Format ID blog harus berupa UUID valid' }),
})

export const blogQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1, 'Halaman minimal 1').default(1),
  limit: z.coerce.number().int().min(1).max(100, 'Maksimal 100 item per halaman').default(10),
})

// ==========================================
// BODY SCHEMAS
// ==========================================
export const createBlogSchema = z.object({
  judul: z
    .string({ required_error: 'Judul artikel wajib diisi' })
    .trim()
    .min(3, 'Judul minimal 3 karakter')
    .max(255, 'Judul maksimal 255 karakter'),
  isi: z
    .string({ required_error: 'Isi artikel wajib diisi' })
    .trim()
    .min(10, 'Isi artikel minimal 10 karakter'),
  banner_url: z
    .string()
    .trim()
    .nullish(),
})

export const updateBlogSchema = z.object({
  judul: z
    .string()
    .trim()
    .min(3, 'Judul minimal 3 karakter')
    .max(255, 'Judul maksimal 255 karakter')
    .optional(),
  isi: z
    .string()
    .trim()
    .min(10, 'Isi artikel minimal 10 karakter')
    .optional(),
  banner_url: z
    .string()
    .trim()
    .nullish(),
})

// ==========================================
// RESPONSE SCHEMAS
// ==========================================
export const blogItemSchema = z.object({
  id: z.string().uuid(),
  judul: z.string(),
  isi: z.string(),
  banner_url: z.string().nullable(),
  tanggal_terbit: z.date().or(z.string()),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
})

export const blogListResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(blogItemSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
})

export const blogDetailResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: blogItemSchema,
})

export const blogMutationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: blogItemSchema,
})

// ==========================================
// TYPE EXPORTS
// ==========================================
export type BlogIdParamInput = z.infer<typeof blogIdParamSchema>
export type BlogQueryInput = z.infer<typeof blogQuerySchema>
export type CreateBlogInput = z.infer<typeof createBlogSchema>
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>
export type BlogItemResponse = z.infer<typeof blogItemSchema>
export type BlogListResponse = z.infer<typeof blogListResponseSchema>
export type BlogDetailResponse = z.infer<typeof blogDetailResponseSchema>
