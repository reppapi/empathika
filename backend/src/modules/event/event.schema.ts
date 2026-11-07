import { z } from 'zod'
import { EVENT_LIMITS } from './event.constants'

// ==========================================
// ENUM SCHEMAS
// ==========================================
export const jenisEventEnum = z.enum(['WEBINAR', 'WORKSHOP', 'SEMINAR'], {
  errorMap: () => ({ message: 'Jenis event harus salah satu dari: WEBINAR, WORKSHOP, SEMINAR' }),
})

export const tipeEventEnum = z.enum(['ONLINE', 'OFFLINE'], {
  errorMap: () => ({ message: 'Tipe event harus salah satu dari: ONLINE, OFFLINE' }),
})

export const statusEventEnum = z.enum(['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED', 'DRAFT'], {
  errorMap: () => ({
    message: 'Status event harus salah satu dari: UPCOMING, ONGOING, COMPLETED, CANCELLED, DRAFT',
  }),
})

// ==========================================
// PARAMETERS & QUERY SCHEMAS
// ==========================================
export const eventIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Format ID event harus berupa UUID valid' }),
})

export const eventQuerySchema = z.object({
  search: z.string().trim().optional(),
  jenis_event: jenisEventEnum.optional(),
  tipe_event: tipeEventEnum.optional(),
  status: statusEventEnum.optional(),
  page: z.coerce.number().int().min(1, 'Halaman minimal 1').default(1),
  limit: z.coerce.number().int().min(1).max(100, 'Maksimal 100 item per halaman').default(10),
})

// ==========================================
// BODY SCHEMAS
// ==========================================
export const createEventSchema = z
  .object({
    judul: z
      .string({ required_error: 'Judul event wajib diisi' })
      .trim()
      .min(3, 'Judul minimal 3 karakter')
      .max(255, 'Judul maksimal 255 karakter')
      .describe('Judul event')
      .default('Workshop Kesehatan Mental 2026'),
    jenis_event: jenisEventEnum.default('WORKSHOP'),
    tipe_event: tipeEventEnum.default('ONLINE'),
    link_meet: z
      .string()
      .trim()
      .url('Format link Google Meet harus berupa URL valid')
      .optional()
      .nullable()
      .or(z.literal('')),
    link_wa: z
      .string({ required_error: 'Link grup WhatsApp wajib diisi' })
      .trim()
      .url('Format link grup WhatsApp harus berupa URL valid'),
    deskripsi: z
      .string({ required_error: 'Deskripsi event wajib diisi' })
      .trim()
      .min(10, 'Deskripsi minimal 10 karakter')
      .default('Workshop interaktif bersama psikolog profesional.'),
    tanggal: z
      .string({ required_error: 'Tanggal event wajib diisi' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD')
      .describe('Format YYYY-MM-DD')
      .default('2026-11-20'),
    jam_mulai: z
      .string({ required_error: 'Jam mulai event wajib diisi' })
      .regex(/^\d{2}:\d{2}$/, 'Format jam mulai harus HH:MM')
      .describe('Format HH:MM')
      .default('09:30'),
    durasi_menit: z
      .number({ required_error: 'Durasi menit wajib diisi' })
      .int('Durasi harus berupa bilangan bulat')
      .min(EVENT_LIMITS.MIN_DURASI_MENIT, `Durasi minimal ${EVENT_LIMITS.MIN_DURASI_MENIT} menit`)
      .max(EVENT_LIMITS.MAX_DURASI_MENIT, `Durasi maksimal ${EVENT_LIMITS.MAX_DURASI_MENIT} menit (24 jam)`)
      .default(120),
    lokasi: z.string().trim().max(500, 'Lokasi maksimal 500 karakter').optional().nullable().default('Auditorium Empathika Bandung'),
    kuota: z
      .number({ required_error: 'Kuota wajib diisi' })
      .int('Kuota harus berupa bilangan bulat')
      .min(EVENT_LIMITS.MIN_KUOTA, `Kuota minimal ${EVENT_LIMITS.MIN_KUOTA} peserta`)
      .max(EVENT_LIMITS.MAX_KUOTA, `Kuota maksimal ${EVENT_LIMITS.MAX_KUOTA} peserta`)
      .default(50),
    harga: z
      .number({ required_error: 'Harga wajib diisi' })
      .min(0, 'Harga tidak boleh negatif')
      .max(EVENT_LIMITS.MAX_HARGA, 'Harga terlalu besar')
      .default(50000),
    harga_coret: z
      .number()
      .min(0, 'Harga coret tidak boleh negatif')
      .max(EVENT_LIMITS.MAX_HARGA, 'Harga coret terlalu besar')
      .optional()
      .nullable(),
    banner_url: z.string().trim().nullish().default('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80'),
    nama_pembicara: z
      .string({ required_error: 'Nama pembicara wajib diisi' })
      .trim()
      .min(2, 'Nama pembicara minimal 2 karakter')
      .max(255, 'Nama pembicara maksimal 255 karakter')
      .default('Dr. Sarah Melani, M.Psi'),
    status: statusEventEnum.optional().default('UPCOMING'),
  })
  .superRefine((data, ctx) => {
    // Validasi Tipe Online -> link_meet wajib diisi & valid url
    if (data.tipe_event === 'ONLINE') {
      if (!data.link_meet || data.link_meet.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Link Google Meet wajib diisi untuk event online',
          path: ['link_meet'],
        })
      }
    }
    // Validasi harga coret harus lebih besar dari harga asli
    if (data.harga_coret !== undefined && data.harga_coret !== null) {
      if (data.harga_coret <= data.harga) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Harga coret harus lebih besar dari harga asli',
          path: ['harga_coret'],
        })
      }
    }
  })

export const updateEventSchema = z
  .object({
    judul: z
      .string()
      .trim()
      .min(3, 'Judul minimal 3 karakter')
      .max(255, 'Judul maksimal 255 karakter')
      .optional(),
    jenis_event: jenisEventEnum.optional(),
    tipe_event: tipeEventEnum.optional(),
    link_meet: z
      .string()
      .trim()
      .url('Format link Google Meet harus berupa URL valid')
      .optional()
      .nullable()
      .or(z.literal('')),
    link_wa: z
      .string()
      .trim()
      .url('Format link grup WhatsApp harus berupa URL valid')
      .optional()
      .nullable()
      .or(z.literal('')),
    deskripsi: z
      .string()
      .trim()
      .min(10, 'Deskripsi minimal 10 karakter')
      .optional(),
    tanggal: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD')
      .describe('Format YYYY-MM-DD')
      .optional(),
    jam_mulai: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Format jam mulai harus HH:MM')
      .describe('Format HH:MM')
      .optional(),
    durasi_menit: z
      .number()
      .int('Durasi harus berupa bilangan bulat')
      .min(1, 'Durasi minimal 1 menit')
      .max(1440, 'Durasi maksimal 1440 menit (24 jam)')
      .optional(),
    lokasi: z.string().trim().max(500, 'Lokasi maksimal 500 karakter').optional().nullable(),
    kuota: z
      .number()
      .int('Kuota harus berupa bilangan bulat')
      .min(1, 'Kuota minimal 1 peserta')
      .max(10000, 'Kuota maksimal 10.000 peserta')
      .optional(),
    harga: z
      .number()
      .min(0, 'Harga tidak boleh negatif')
      .max(99999999.99, 'Harga terlalu besar')
      .optional(),
    harga_coret: z
      .number()
      .min(0, 'Harga coret tidak boleh negatif')
      .max(99999999.99, 'Harga coret terlalu besar')
      .optional()
      .nullable(),
    banner_url: z.string().trim().nullish(),
    nama_pembicara: z
      .string()
      .trim()
      .min(2, 'Nama pembicara minimal 2 karakter')
      .max(255, 'Nama pembicara maksimal 255 karakter')
      .optional(),
    status: statusEventEnum.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tipe_event === 'ONLINE') {
      if (data.link_meet !== undefined && (!data.link_meet || data.link_meet.trim() === '')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Link Google Meet wajib diisi untuk event online',
          path: ['link_meet'],
        })
      }
    }
    if (data.harga_coret !== undefined && data.harga_coret !== null && data.harga !== undefined) {
      if (data.harga_coret <= data.harga) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Harga coret harus lebih besar dari harga asli',
          path: ['harga_coret'],
        })
      }
    }
  })

export const updateEventStatusSchema = z.object({
  status: statusEventEnum,
})

// ==========================================
// RESPONSE SCHEMAS
// ==========================================
export const eventItemSchema = z.object({
  id: z.string().uuid(),
  judul: z.string(),
  jenis_event: jenisEventEnum,
  tipe_event: tipeEventEnum,
  link_meet: z.string().nullable().optional(),
  link_wa: z.string().nullable().optional(),
  deskripsi: z.string(),
  tanggal: z.date().or(z.string()),
  jam_mulai: z.date().or(z.string()),
  durasi_menit: z.number(),
  lokasi: z.string().nullable(),
  kuota: z.number(),
  harga: z.union([z.number(), z.string()]), // Decimal dari Prisma bisa jadi string
  harga_coret: z.union([z.number(), z.string()]).nullable().optional(),
  banner_url: z.string().nullable(),
  nama_pembicara: z.string(),
  status: statusEventEnum,
  jumlah_booking: z.number().optional(),
  sisa_kuota: z.number().optional(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
})

export const eventListResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(eventItemSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
})

export const eventDetailResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: eventItemSchema,
})

export const eventMutationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: eventItemSchema,
})

export const eventDeleteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.null(),
})

// ==========================================
// TYPE EXPORTS
// ==========================================
export type EventIdParamInput = z.infer<typeof eventIdParamSchema>
export type EventQueryInput = z.infer<typeof eventQuerySchema>
export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
export type UpdateEventStatusInput = z.infer<typeof updateEventStatusSchema>
export type EventItemResponse = z.infer<typeof eventItemSchema>
export type EventListResponse = z.infer<typeof eventListResponseSchema>
export type EventDetailResponse = z.infer<typeof eventDetailResponseSchema>
