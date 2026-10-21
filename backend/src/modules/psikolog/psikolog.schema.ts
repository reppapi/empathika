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

export const getAllPsikologQuerySchema = z.object({
  kategori: z.string().optional(),
  search: z.string().optional(),
  status: z.string().optional(),
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

export const updatePsikologProfileSchema = z.object({
  nama: z.string().optional(),
  no_telepon: z.string().optional(),
  foto: z.string().optional(),
  bio: z.string().optional(),
  quote: z.string().optional(),
  instagram: z.string().optional(),
  keahlian: z.union([z.string(), z.array(z.string())]).optional(),
  pendidikan: z.string().optional(),
  pengalaman_tahun: z.string().optional(),
  jenis_kelamin: z.string().optional(),
  video_intro_url: z.string().optional(),
  video_thumbnail: z.string().optional(),
  video_duration: z.string().optional(),
  profil_lengkap: z.union([z.string(), z.array(z.string())]).optional(),
  tarif_per_jam: z.number().optional(),
})

export const registerPsikologBaruSchema = z.object({
  id: z.string().optional(),
  nama: z.string().min(1, 'Nama wajib diisi').default('Dr. Jane Doe, M.Psi., Psikolog'),
  email: z.string().email('Format email tidak valid').default('janedoe@empathika.id'),
  noTelepon: z.string().optional().default('081234567890'),
  kategori: z.enum(['psikolog', 'konselor', 'peer-konselor']).default('psikolog'),
  spesialisasi: z.string().optional().default('Psikologi Klinis Dewasa'),
  noStr: z.string().optional().default('1234567890'),
  noSipp: z.string().optional().default('SIPP-2026-001'),
  noSilp: z.string().optional().default('SILP-2026-001'),
  pendidikanText: z.string().optional().default('Magister Psikologi Profesi Universitas Indonesia'),
  pendidikan: z.string().optional(),
  bio: z.string().optional().default('Praktisi psikologi berfokus pada trauma dan kecemasan.'),
  quote: z.string().optional().default('Setiap perjalanan pemulihan dimulai dari keberanian mendengarkan diri.'),
  instagram: z.string().optional().default('@janedoe.psi'),
  keahlian: z.union([z.string(), z.array(z.string())]).optional().default(['Trauma', 'Depresi', 'Keluarga']),
  tarif_per_jam: z.number().optional().default(150000),
  statusAkses: z.enum(['AKTIF', 'NONAKTIF']).default('AKTIF'),
  foto: z.string().optional(),
  pengalaman_tahun: z.string().optional(),
  experienceYears: z.string().optional(),
  jenis_kelamin: z.string().optional(),
  jenisKelamin: z.string().optional(),
  video_intro_url: z.string().optional(),
  videoIntroUrl: z.string().optional(),
  video_thumbnail: z.string().optional(),
  videoThumbnail: z.string().optional(),
  video_duration: z.string().optional(),
  videoDuration: z.string().optional(),
  profil_lengkap: z.union([z.string(), z.array(z.string())]).optional(),
  profilLengkap: z.union([z.string(), z.array(z.string())]).optional(),
})

export type GetAllPsikologQuery = z.infer<typeof getAllPsikologQuerySchema>
export type GetJadwalTersediaQuery = z.infer<typeof getJadwalTersediaQuerySchema>
export type GetJadwalPsikologMeQuery = z.infer<typeof getJadwalPsikologMeQuerySchema>
export type CreateJadwalSlotInput = z.infer<typeof createJadwalSlotSchema>
export type CreatePsikologInput = z.infer<typeof createPsikologSchema>
export type UpdatePsikologInput = z.infer<typeof updatePsikologSchema>
export type UpdatePsikologProfileInput = z.infer<typeof updatePsikologProfileSchema>
export type RegisterPsikologBaruInput = z.infer<typeof registerPsikologBaruSchema>

