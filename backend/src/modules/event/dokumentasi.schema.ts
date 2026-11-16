import { z } from 'zod'
import { EVENT_LIMITS } from './event.constants'

// ==========================================
// PARAM & QUERY SCHEMAS
// ==========================================

export const dokumentasiIdParamSchema = z.object({
  id: z.string().uuid({ message: 'ID dokumentasi event harus berupa UUID valid' }),
})

export const dokumentasiQuerySchema = z.object({
  search: z.string().trim().optional(),
  kategori: z.enum(['SEMINAR', 'WORKSHOP', 'KOLABORASI']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

// ==========================================
// FOTO SCHEMA
// ==========================================

export const dokumentasiFotoInputSchema = z.object({
  foto_url: z
    .string({ required_error: 'URL foto wajib diisi' })
    .trim()
    .min(1, 'URL foto tidak boleh kosong'),
  urutan: z.number().int().default(0),
})

// ==========================================
// MUTATION SCHEMAS (CREATE & UPDATE)
// ==========================================

export const createDokumentasiSchema = z.object({
  judul: z
    .string({ required_error: 'Judul event wajib diisi' })
    .trim()
    .min(3, 'Judul minimal 3 karakter')
    .max(255, 'Judul maksimal 255 karakter'),
  kategori: z
    .enum(['SEMINAR', 'WORKSHOP', 'KOLABORASI'])
    .default('KOLABORASI'),
  tanggal: z
    .string({ required_error: 'Tanggal pelaksanaan wajib diisi' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  deskripsi: z
    .string({ required_error: 'Deskripsi wajib diisi' })
    .trim()
    .min(5, 'Deskripsi minimal 5 karakter'),
  foto: z
    .array(dokumentasiFotoInputSchema)
    .max(EVENT_LIMITS.MAX_DOKUMENTASI_FOTO, `Maksimal ${EVENT_LIMITS.MAX_DOKUMENTASI_FOTO} foto dokumentasi`)
    .default([]),
})

export const updateDokumentasiSchema = z.object({
  judul: z
    .string()
    .trim()
    .min(3, 'Judul minimal 3 karakter')
    .max(255, 'Judul maksimal 255 karakter')
    .optional(),
  kategori: z
    .enum(['SEMINAR', 'WORKSHOP', 'KOLABORASI'])
    .optional(),
  tanggal: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD')
    .optional(),
  deskripsi: z
    .string()
    .trim()
    .min(5, 'Deskripsi minimal 5 karakter')
    .optional(),
  foto: z
    .array(dokumentasiFotoInputSchema)
    .max(EVENT_LIMITS.MAX_DOKUMENTASI_FOTO, `Maksimal ${EVENT_LIMITS.MAX_DOKUMENTASI_FOTO} foto dokumentasi`)
    .optional(),
})

// ==========================================
// RESPONSE SCHEMAS
// ==========================================

export const dokumentasiFotoResponseSchema = z.object({
  id: z.string().uuid(),
  foto_url: z.string(),
  urutan: z.number(),
  createdAt: z.date(),
})

export const dokumentasiItemResponseSchema = z.object({
  id: z.string().uuid(),
  judul: z.string(),
  kategori: z.string().optional(),
  tanggal: z.date(),
  deskripsi: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  jumlah_foto: z.number(),
  thumbnail: z.string().nullable().optional(),
  foto: z.array(dokumentasiFotoResponseSchema),
})

export const dokumentasiListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(dokumentasiItemResponseSchema),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
})

export const dokumentasiDetailResponseSchema = z.object({
  success: z.boolean(),
  data: dokumentasiItemResponseSchema,
})

export const dokumentasiMutationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: dokumentasiItemResponseSchema,
})

export const dokumentasiDeleteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
})

// ==========================================
// INFERRED TYPES
// ==========================================

export type CreateDokumentasiInput = z.infer<typeof createDokumentasiSchema>
export type UpdateDokumentasiInput = z.infer<typeof updateDokumentasiSchema>
export type DokumentasiQueryInput = z.infer<typeof dokumentasiQuerySchema>

