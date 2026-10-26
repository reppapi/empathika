import { z } from 'zod'

// ── 1. Slot Jadwal Tersedia untuk Klien (Publik) ──
export const getJadwalTersediaQuerySchema = z.object({
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD').optional(),
  id_psikolog: z.string().optional(),
  tipe_jadwal: z.enum(['KONSULTASI', 'ASESMEN']).default('KONSULTASI'),
})

// ── 2. Jadwal Milik Psikolog (Portal Psikolog) ──
export const getJadwalPsikologMeQuerySchema = z.object({
  id_psikolog: z.string().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  id_psikolog: z.string().optional(),
})

export const createJadwalSlotSchema = z.object({
  id_psikolog: z.string().optional(),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  jam_mulai: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format jam_mulai harus HH:mm'),
  jam_selesai: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format jam_selesai harus HH:mm'),
  tipe_jadwal: z.enum(['KONSULTASI', 'ASESMEN']).default('KONSULTASI'),
  metode: z.string().optional().default('ONLINE'),
})

// ── 3. Jadwal & Sesi Konsultasi di Admin ──
export const getAdminJadwalQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  layanan: z.string().optional(),
  status: z.string().optional(),
})

export const createAdminJadwalSlotSchema = z.object({
  id_psikolog: z.string().uuid().optional(),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  jam_mulai: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format jam_mulai harus HH:mm'),
  jam_selesai: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format jam_selesai harus HH:mm'),
  tipe_jadwal: z.string().optional().default('ASESMEN'),
  metode: z.string().optional().default('ONLINE'),
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

// ── 4. Booking Mandiri oleh Klien (Public) ──
export const createClientBookingSchema = z.object({
  id_jadwal: z.string().optional(),
  id_layanan: z.string().optional(),
  id_psikolog: z.string().optional(),
  tanggal: z.string().optional(),
  jam_mulai: z.string().optional(),
  metode: z.enum(['ONLINE', 'OFFLINE']).default('ONLINE'),
  deskripsi_trauma: z.string().optional(),
  status: z.enum(['PENDING', 'CONFIRMED']).optional().default('CONFIRMED'),
  metode_pembayaran: z.string().optional(),
  channel_pembayaran: z.string().optional(),
  klien: z.object({
    nama: z.string().min(1, 'Nama klien wajib diisi'),
    no_telepon: z.string().min(8, 'Nomor WhatsApp minimal 8 digit'),
    email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
    usia: z.number().optional(),
    jenis_kelamin: z.string().optional(),
  }),
})

export type GetJadwalTersediaQuery = z.infer<typeof getJadwalTersediaQuerySchema>
export type GetJadwalPsikologMeQuery = z.infer<typeof getJadwalPsikologMeQuerySchema>
export type CreateJadwalSlotInput = z.infer<typeof createJadwalSlotSchema>
export type GetAdminJadwalQuery = z.infer<typeof getAdminJadwalQuerySchema>
export type CreateAdminJadwalSlotInput = z.infer<typeof createAdminJadwalSlotSchema>
export type CreateAdminSesiInput = z.infer<typeof createAdminSesiSchema>
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>
export type CreateClientBookingInput = z.infer<typeof createClientBookingSchema>
