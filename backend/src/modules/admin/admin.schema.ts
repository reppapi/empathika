import { z } from 'zod'

export {
  getAdminJadwalQuerySchema,
  createAdminJadwalSlotSchema,
  createAdminSesiSchema,
  updateBookingStatusSchema,
  rescheduleBookingSchema,
  type GetAdminJadwalQuery,
  type CreateAdminJadwalSlotInput,
  type CreateAdminSesiInput,
  type UpdateBookingStatusInput,
  type RescheduleBookingInput,
} from '../booking/booking.schema'

export const dashboardLimitQuerySchema = z.object({
  limit: z.string().optional(),
  biroId: z.string().optional(),
})

export type DashboardLimitQuery = z.infer<typeof dashboardLimitQuerySchema>

export const dashboardChartQuerySchema = z.object({
  period: z.string().optional(),
  biroId: z.string().optional(),
})

export type DashboardChartQuery = z.infer<typeof dashboardChartQuerySchema>

export const dashboardMetricsQuerySchema = z.object({
  biroId: z.string().optional(),
})

export type DashboardMetricsQuery = z.infer<typeof dashboardMetricsQuerySchema>

export const updateAdminProfileSchema = z.object({
  nama: z.string().min(1, 'Nama lengkap wajib diisi').optional(),
  email: z.string().email('Format email tidak valid').optional(),
  no_telepon: z.string().nullable().optional(),
  noTelepon: z.string().nullable().optional(),
  alamat: z.string().nullable().optional(),
  link_maps: z.string().nullable().optional(),
  linkMaps: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  foto: z.string().nullable().optional(),
  instagram: z.string().nullable().optional(),
  tiktok: z.string().nullable().optional(),
  youtube: z.string().nullable().optional(),
  linkedin: z.string().nullable().optional(),
  password: z.string().min(6, 'Password baru minimal 6 karakter').optional(),
})

export const resendActivationSchema = z.object({
  accountId: z.string().min(1, 'accountId wajib diisi'),
})

export type UpdateAdminProfileInput = z.infer<typeof updateAdminProfileSchema>
export type ResendActivationInput = z.infer<typeof resendActivationSchema>

const safeUrlRegex = /^(https?:\/\/|\/uploads\/|\/images\/|\/)/i

export const updateTentangKamiSchema = z.object({
  hero: z.object({
    tagline: z.string().trim().min(1, 'Tagline hero wajib diisi').max(500, 'Tagline hero maksimal 500 karakter'),
    gallery: z
      .array(
        z
          .string()
          .trim()
          .min(1, 'URL foto tidak boleh kosong')
          .max(1000, 'URL foto maksimal 1000 karakter')
          .refine((val) => safeUrlRegex.test(val), {
            message: 'URL foto harus valid (diawali http://, https://, atau /uploads/)',
          })
      )
      .length(6, 'Galeri hero harus berisi tepat 6 foto'),
  }),
  berkenalan: z.object({
    judul: z.string().trim().min(1, 'Judul pengenalan wajib diisi').max(200, 'Judul pengenalan maksimal 200 karakter'),
    paragraf1: z.string().trim().min(1, 'Paragraf 1 pengenalan wajib diisi').max(5000, 'Paragraf 1 maksimal 5000 karakter'),
    paragraf2: z.string().trim().min(1, 'Paragraf 2 pengenalan wajib diisi').max(5000, 'Paragraf 2 maksimal 5000 karakter'),
  }),
  nilai: z.object({
    judulSection: z.string().trim().min(1, 'Judul section nilai wajib diisi').max(200, 'Judul section nilai maksimal 200 karakter'),
    subjudulSection: z.string().trim().min(1, 'Subjudul section nilai wajib diisi').max(500, 'Subjudul section nilai maksimal 500 karakter'),
    items: z
      .array(
        z.object({
          id: z.string().trim().max(50, 'ID nilai maksimal 50 karakter'),
          judul: z.string().trim().min(1, 'Judul nilai wajib diisi').max(100, 'Judul nilai maksimal 100 karakter'),
          deskripsi: z.string().trim().min(1, 'Deskripsi nilai wajib diisi').max(500, 'Deskripsi nilai maksimal 500 karakter'),
          icon: z.enum(['heart', 'star', 'shield', 'users', 'lightbulb', 'award']).default('heart'),
        })
      )
      .min(1, 'Minimal 1 nilai yang kami bawa')
      .max(10, 'Maksimal 10 nilai yang kami bawa'),
  }),
  kenapaHadir: z.object({
    judul: z.string().trim().min(1, 'Judul kenapa hadir wajib diisi').max(200, 'Judul kenapa hadir maksimal 200 karakter'),
    fotoTim: z
      .string()
      .trim()
      .min(1, 'Foto tim wajib diisi')
      .max(1000, 'URL foto tim maksimal 1000 karakter')
      .refine((val) => safeUrlRegex.test(val), {
        message: 'URL foto tim harus valid (diawali http://, https://, atau /uploads/)',
      }),
    paragraf1: z.string().trim().min(1, 'Paragraf 1 latar belakang wajib diisi').max(5000, 'Paragraf 1 maksimal 5000 karakter'),
    paragraf2: z.string().trim().min(1, 'Paragraf 2 latar belakang wajib diisi').max(5000, 'Paragraf 2 maksimal 5000 karakter'),
    paragraf3: z.string().trim().min(1, 'Paragraf 3 latar belakang wajib diisi').max(5000, 'Paragraf 3 maksimal 5000 karakter'),
  }),
  layananSection: z
    .object({
      judul: z.string().trim().max(200, 'Judul section layanan maksimal 200 karakter').optional(),
      deskripsi: z.string().trim().max(1000, 'Deskripsi section layanan maksimal 1000 karakter').optional(),
    })
    .optional(),
})

export type UpdateTentangKamiInput = z.infer<typeof updateTentangKamiSchema>

// ── Modul Manajemen Internship ────────────────────────────────────
export const internshipQuestionItemSchema = z.object({
  id: z.string().optional(),
  label: z.string().trim().min(1, 'Pertanyaan tidak boleh kosong'),
  type: z.enum(['text', 'textarea', 'url']).default('textarea'),
  required: z.boolean().default(false),
})

export const internshipPositionSchema = z.object({
  id: z.string().optional(),
  judul: z.string().trim().min(1, 'Judul posisi wajib diisi'),
  divisi: z.string().trim().optional().nullable(),
  durasi: z.string().trim().min(1, 'Durasi wajib diisi'),
  lokasi: z.string().trim().min(1, 'Lokasi wajib diisi'),
  workMode: z.string().trim().min(1, 'Work mode wajib diisi'),
  kompensasi: z.string().trim().min(1, 'Kompensasi wajib diisi'),
  deadline: z.string().trim().min(1, 'Deadline pendaftaran wajib diisi'),
  deskripsi: z.string().trim().optional().nullable(),
  responsibilities: z.array(z.string()).default([]),
  qualifications: z.array(z.string()).default([]),
  questions: z.array(internshipQuestionItemSchema).optional().default([]),
  applyUrl: z.string().trim().default(''),
  isOpen: z.boolean().default(true),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export const createInternshipPositionSchema = internshipPositionSchema
export const updateInternshipPositionSchema = internshipPositionSchema.partial()
export const updateInternshipPositionsSchema = z.object({
  positions: z.array(internshipPositionSchema),
})
export const internshipIdParamsSchema = z.object({
  id: z.string().trim().min(1, 'ID posisi wajib diisi'),
})

// Schema Pengajuan Pelamar Magang (Internship Applications)
export const createInternshipApplicationSchema = z.object({
  positionId: z.string().trim().min(1, 'ID posisi wajib diisi'),
  positionTitle: z.string().trim().min(1, 'Judul posisi wajib diisi'),
  nama: z.string().trim().min(1, 'Nama lengkap wajib diisi'),
  email: z.string().trim().email('Format email tidak valid'),
  telepon: z.string().trim().min(5, 'Nomor telepon/WhatsApp wajib diisi'),
  universitas: z.string().trim().min(1, 'Asal universitas/institusi wajib diisi'),
  jurusan: z.string().trim().optional().nullable(),
  semester: z.string().trim().optional().nullable(),
  cvUrl: z.string().trim().min(1, 'Link CV/Resume wajib diisi'),
  portfolioUrl: z.string().trim().optional().nullable(),
  jawaban: z
    .array(
      z.object({
        questionId: z.string().optional(),
        question: z.string(),
        answer: z.string(),
      })
    )
    .optional()
    .default([]),
})

export const updateInternshipApplicationStatusSchema = z.object({
  status: z.enum(['MENUNGGU', 'REVIEW', 'DITERIMA', 'DITOLAK']),
  catatanAdmin: z.string().trim().optional().nullable(),
})

export type InternshipPositionItem = z.infer<typeof internshipPositionSchema>
export type CreateInternshipPositionInput = z.infer<typeof createInternshipPositionSchema>
export type UpdateInternshipPositionInput = z.infer<typeof updateInternshipPositionSchema>
export type UpdateInternshipPositionsInput = z.infer<typeof updateInternshipPositionsSchema>
export type InternshipIdParams = z.infer<typeof internshipIdParamsSchema>
export type CreateInternshipApplicationInput = z.infer<typeof createInternshipApplicationSchema>
export type UpdateInternshipApplicationStatusInput = z.infer<
  typeof updateInternshipApplicationStatusSchema
>

