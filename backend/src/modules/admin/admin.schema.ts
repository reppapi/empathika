import { z } from 'zod'

export const getAdminJadwalQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  layanan: z.string().optional(),
  status: z.string().optional(),
})

export const createAdminJadwalSlotSchema = z.object({
  id_psikolog: z.string().uuid(),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  jam_mulai: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format jam_mulai harus HH:mm'),
  jam_selesai: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format jam_selesai harus HH:mm'),
  tipe_jadwal: z.literal('ASESMEN').default('ASESMEN'), // Admin hanya membuka slot untuk ASESMEN
})

export const createAdminSesiSchema = z.object({
  id_psikolog: z.string().uuid(),
  id_layanan: z.string().uuid(),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  jam_mulai: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format jam_mulai harus HH:mm'),
  jam_selesai: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format jam_selesai harus HH:mm'),
  metode: z.enum(['ONLINE', 'OFFLINE']).default('ONLINE'),
  deskripsi_trauma: z.string().optional(),
  klien: z.object({
    nama: z.string().min(1, 'Nama klien wajib diisi'),
    no_telepon: z.string().min(8, 'Nomor telepon minimal 8 digit'),
    usia: z.number().optional(),
    jenis_kelamin: z.string().optional(),
  }),
})

export const updateBookingStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']),
})

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
  password: z.string().min(6, 'Password baru minimal 6 karakter').optional(),
})

export type GetAdminJadwalQuery = z.infer<typeof getAdminJadwalQuerySchema>
export type CreateAdminJadwalSlotInput = z.infer<typeof createAdminJadwalSlotSchema>
export type CreateAdminSesiInput = z.infer<typeof createAdminSesiSchema>
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>
export type UpdateAdminProfileInput = z.infer<typeof updateAdminProfileSchema>

