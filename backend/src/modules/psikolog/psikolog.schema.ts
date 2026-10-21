import { z } from 'zod'

export const getJadwalTersediaQuerySchema = z.object({
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD').optional(),
  id_psikolog: z.string().optional(),
  tipe_jadwal: z.enum(['KONSULTASI', 'ASESMEN']).default('KONSULTASI'),
})

export const getJadwalPsikologMeQuerySchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export const createJadwalSlotSchema = z.object({
  id_psikolog: z.string().optional(),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  jam_mulai: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format jam_mulai harus HH:mm'),
  jam_selesai: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format jam_selesai harus HH:mm'),
  tipe_jadwal: z.enum(['KONSULTASI', 'ASESMEN']).default('KONSULTASI'),
})

export const createPsikologSchema = z.object({
  id_account: z.string().uuid(),
  id_spesialisasi: z.string().uuid(),
  kategori: z.string(),
  nama_gelar: z.string(),
  no_str: z.string().optional(),
  no_sipp: z.string().optional(),
  pendidikan: z.string().optional(),
  pengalaman_tahun: z.string().optional(),
  quote: z.string().optional(),
  instagram: z.string().optional(),
  keahlian: z.string().optional(),
  jenis_kelamin: z.string().optional(),
  foto: z.string().optional(),
  bio: z.string().optional(),
  tarif_per_jam: z.number().default(0),
})

export const updatePsikologSchema = createPsikologSchema.partial()

export type GetJadwalTersediaQuery = z.infer<typeof getJadwalTersediaQuerySchema>
export type GetJadwalPsikologMeQuery = z.infer<typeof getJadwalPsikologMeQuerySchema>
export type CreateJadwalSlotInput = z.infer<typeof createJadwalSlotSchema>
export type CreatePsikologInput = z.infer<typeof createPsikologSchema>
export type UpdatePsikologInput = z.infer<typeof updatePsikologSchema>
