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
  nama: z.string().nullable().optional(),
  email: z.union([z.string().email(), z.literal("")]).nullable().optional(),
  password: z.string().nullable().optional(),
  no_telepon: z.string().nullable().optional(),
  spesialisasi: z.string().nullable().optional(),
  no_str: z.string().nullable().optional(),
  no_sipp: z.string().nullable().optional(),
  no_silp: z.string().nullable().optional(),
  foto: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  quote: z.string().nullable().optional(),
  instagram: z.string().nullable().optional(),
  keahlian: z.union([z.string(), z.array(z.string())]).nullable().optional(),
  pendidikan: z.string().nullable().optional(),
  pengalaman_tahun: z.string().nullable().optional(),
  jenis_kelamin: z.string().nullable().optional(),
  video_intro_url: z.string().nullable().optional(),
  video_thumbnail: z.string().nullable().optional(),
  video_duration: z.string().nullable().optional(),
  profil_lengkap: z.union([z.string(), z.array(z.string())]).nullable().optional(),
  tarif_per_jam: z.number().nullable().optional(),
  kategori: z.string().nullable().optional(),
})

export const registerPsikologBaruSchema = z.object({
  id: z.string().nullable().optional(),
  nama: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Format email tidak valid'),
  noTelepon: z.string().nullable().optional(),
  kategori: z.enum(['psikolog', 'konselor', 'peer-konselor']).default('psikolog'),
  spesialisasi: z.string().nullable().optional(),
  noStr: z.string().nullable().optional(),
  noSipp: z.string().nullable().optional(),
  noSilp: z.string().nullable().optional(),
  pendidikanText: z.string().nullable().optional(),
  pendidikan: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  quote: z.string().nullable().optional(),
  instagram: z.string().nullable().optional(),
  keahlian: z.union([z.string(), z.array(z.string())]).nullable().optional(),
  tarif_per_jam: z.number().nullable().optional(),
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

