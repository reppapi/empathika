import { z } from 'zod'
import { BLOG_CONSTANTS } from './blog.constants'

// ==========================================
// PARAMETERS & QUERY SCHEMAS
// ==========================================
export const blogIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Format ID blog harus berupa UUID valid' }),
})

export const blogQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1, 'Halaman minimal 1').default(BLOG_CONSTANTS.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(BLOG_CONSTANTS.MAX_PAGE_SIZE, `Maksimal ${BLOG_CONSTANTS.MAX_PAGE_SIZE} item per halaman`)
    .default(BLOG_CONSTANTS.DEFAULT_PAGE_SIZE),
})

// ==========================================
// BODY SCHEMAS
// ==========================================
export const createBlogSchema = z.object({
  judul: z
    .string({ required_error: 'Judul artikel wajib diisi' })
    .trim()
    .min(BLOG_CONSTANTS.TITLE_MIN_LENGTH, `Judul minimal ${BLOG_CONSTANTS.TITLE_MIN_LENGTH} karakter`)
    .max(BLOG_CONSTANTS.TITLE_MAX_LENGTH, `Judul maksimal ${BLOG_CONSTANTS.TITLE_MAX_LENGTH} karakter`),
  isi: z
    .string({ required_error: 'Isi artikel wajib diisi' })
    .trim()
    .min(BLOG_CONSTANTS.CONTENT_MIN_LENGTH, `Isi artikel minimal ${BLOG_CONSTANTS.CONTENT_MIN_LENGTH} karakter`),
  banner_url: z
    .string()
    .trim()
    .nullish(),
  tanggal_terbit: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .or(z.date())
    .optional(),
})

export const updateBlogSchema = z.object({
  judul: z
    .string()
    .trim()
    .min(BLOG_CONSTANTS.TITLE_MIN_LENGTH, `Judul minimal ${BLOG_CONSTANTS.TITLE_MIN_LENGTH} karakter`)
    .max(BLOG_CONSTANTS.TITLE_MAX_LENGTH, `Judul maksimal ${BLOG_CONSTANTS.TITLE_MAX_LENGTH} karakter`)
    .optional(),
  isi: z
    .string()
    .trim()
    .min(BLOG_CONSTANTS.CONTENT_MIN_LENGTH, `Isi artikel minimal ${BLOG_CONSTANTS.CONTENT_MIN_LENGTH} karakter`)
    .optional(),
  banner_url: z
    .string()
    .trim()
    .nullish(),
  tanggal_terbit: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .or(z.date())
    .optional(),
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

export const blogDeleteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.null(),
})

// ==========================================
// INFERRED TYPES
// ==========================================
export type CreateBlogInput = z.infer<typeof createBlogSchema>
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>
export type BlogQueryInput = z.infer<typeof blogQuerySchema>
export type BlogIdParamInput = z.infer<typeof blogIdParamSchema>
