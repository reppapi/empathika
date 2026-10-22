import { z } from 'zod'

export {
  getJadwalTersediaQuerySchema,
  getJadwalPsikologMeQuerySchema,
  createJadwalSlotSchema,
  type GetJadwalTersediaQuery,
  type GetJadwalPsikologMeQuery,
  type CreateJadwalSlotInput,
} from '../booking/booking.schema'

export const getAllPsikologQuerySchema = z.object({
  kategori: z.string().optional(),
  search: z.string().optional(),
  status: z.string().optional(),
})

export const createPsikologSchema = z.object({
  id_account: z.string().uuid(),
  id_spesialisasi: z.string().uuid(),
  kategori: z.string(),
  nama_gelar: z.string(),
  no_str: z.string().optional(),
  no_sipp: z.string().optional(),
  no_silp: z.string().optional(),
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
  email: z.string().email().optional(),
  password: z.string().optional(),
  no_telepon: z.string().optional(),
  spesialisasi: z.string().optional(),
  no_str: z.string().optional(),
  no_sipp: z.string().optional(),
  no_silp: z.string().optional(),
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
  id: z.string().nullable().optional(),
  nama: z.string().min(1, 'Nama wajib diisi').default('Dr. Jane Doe, M.Psi., Psikolog'),
  email: z.string().email('Format email tidak valid').default('janedoe@empathika.id'),
  noTelepon: z.string().nullable().optional().default('081234567890'),
  kategori: z.enum(['psikolog', 'konselor', 'peer-konselor']).default('psikolog'),
  spesialisasi: z.string().nullable().optional().default('Psikologi Klinis Dewasa'),
  noStr: z.string().nullable().optional().default('1234567890'),
  noSipp: z.string().nullable().optional().default('SIPP-2026-001'),
  noSilp: z.string().nullable().optional().default('SILP-2026-001'),
  pendidikanText: z.string().nullable().optional().default('Magister Psikologi Profesi Universitas Indonesia'),
  pendidikan: z.string().nullable().optional(),
  bio: z.string().nullable().optional().default('Praktisi psikologi berfokus pada trauma dan kecemasan.'),
  quote: z.string().nullable().optional().default('Setiap perjalanan pemulihan dimulai dari keberanian mendengarkan diri.'),
  instagram: z.string().nullable().optional().default('@janedoe.psi'),
  keahlian: z.union([z.string(), z.array(z.string())]).nullable().optional().default(['Trauma', 'Depresi', 'Keluarga']),
  tarif_per_jam: z.number().nullable().optional().default(150000),
  statusAkses: z.enum(['AKTIF', 'NONAKTIF']).default('AKTIF'),
  foto: z.string().nullable().optional(),
  pengalaman_tahun: z.string().nullable().optional(),
  experienceYears: z.string().nullable().optional(),
  jenis_kelamin: z.string().nullable().optional(),
  jenisKelamin: z.string().nullable().optional(),
  video_intro_url: z.string().nullable().optional(),
  videoIntroUrl: z.string().nullable().optional(),
  video_thumbnail: z.string().nullable().optional(),
  videoThumbnail: z.string().nullable().optional(),
  video_duration: z.string().nullable().optional(),
  videoDuration: z.string().nullable().optional(),
  profil_lengkap: z.union([z.string(), z.array(z.string())]).nullable().optional(),
  profilLengkap: z.union([z.string(), z.array(z.string())]).nullable().optional(),
}).passthrough()

export type GetAllPsikologQuery = z.infer<typeof getAllPsikologQuerySchema>
export type CreatePsikologInput = z.infer<typeof createPsikologSchema>
export type UpdatePsikologInput = z.infer<typeof updatePsikologSchema>
export type UpdatePsikologProfileInput = z.infer<typeof updatePsikologProfileSchema>
export type RegisterPsikologBaruInput = z.infer<typeof registerPsikologBaruSchema>

