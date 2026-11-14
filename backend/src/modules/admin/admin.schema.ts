import { z } from 'zod'

export {
  getAdminJadwalQuerySchema,
  createAdminJadwalSlotSchema,
  createAdminSesiSchema,
  updateBookingStatusSchema,
  type GetAdminJadwalQuery,
  type CreateAdminJadwalSlotInput,
  type CreateAdminSesiInput,
  type UpdateBookingStatusInput,
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
