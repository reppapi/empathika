import { z } from 'zod'

// ── 1. Skema Pengajuan Kerja Sama (Leads) ───────────────────────────────────

export const createPengajuanSchema = z.object({
  nama_instansi: z.string().min(1, 'Nama instansi/organisasi wajib diisi'),
  nama_pic: z.string().min(1, 'Nama PIC/penanggung jawab wajib diisi'),
  email: z.string().email('Format email tidak valid'),
  no_telepon: z.string().min(8, 'Nomor telepon minimal 8 digit'),
  kategori: z.string().min(1, 'Kategori kerja sama wajib diisi'),
  tipe_formulir: z.string().default('lainnya'),
  pesan: z.string().optional().nullable(),
  jawaban_detail: z.record(z.any()).optional().nullable(),
})

export type CreatePengajuanInput = z.infer<typeof createPengajuanSchema>

export const updatePengajuanStatusSchema = z.object({
  status: z.enum(['MENUNGGU', 'DIHUBUNGI', 'DISETUJUI', 'DITOLAK']),
  pesan: z.string().optional().nullable(),
})

export type UpdatePengajuanStatusInput = z.infer<typeof updatePengajuanStatusSchema>

export const getPengajuanQuerySchema = z.object({
  status: z.enum(['MENUNGGU', 'DIHUBUNGI', 'DISETUJUI', 'DITOLAK', 'semua']).optional(),
  kategori: z.string().optional(),
  tipe_formulir: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
})

export type GetPengajuanQuery = z.infer<typeof getPengajuanQuerySchema>

// ── 2. Skema Program Kerja Sama ──────────────────────────────────────────────

export const createProgramSchema = z.object({
  slug: z.string().min(1, 'Slug wajib diisi'),
  title: z.string().min(1, 'Judul program wajib diisi'),
  short_name: z.string().min(1, 'Nama pendek program wajib diisi'),
  deskripsi: z.string().min(1, 'Deskripsi wajib diisi'),
  pelatihan_title: z.string().optional().nullable(),
  pelatihan_deskripsi: z.string().optional().nullable(),
  pelatihan_image: z.string().optional().nullable(),
  mitra_title: z.string().optional().nullable(),
  mitra_deskripsi: z.string().optional().nullable(),
  mitra_image: z.string().optional().nullable(),
  warna_tema: z.string().optional().nullable(),
  status: z.enum(['AKTIF', 'NONAKTIF']).default('AKTIF'),
  urutan: z.number().default(1),
})

export type CreateProgramInput = z.infer<typeof createProgramSchema>

export const updateProgramSchema = createProgramSchema.partial()
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>

// ── 3. Skema Formulir Kerja Sama ─────────────────────────────────────────────

export const updateFormulirSchema = z.object({
  title: z.string().optional(),
  kategori_default: z.string().optional(),
  deskripsi: z.string().optional().nullable(),
  pertanyaan_khusus: z.array(z.any()).optional(),
})

export type UpdateFormulirInput = z.infer<typeof updateFormulirSchema>
