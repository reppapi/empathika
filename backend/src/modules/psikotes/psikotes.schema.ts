import { z } from 'zod'

export const pilihanJawabanSchema = z.object({
  id: z.string().optional(),
  label: z.string().optional().default(''),
  teks_jawaban: z.string().min(1, 'Teks jawaban wajib diisi'),
  bobot: z.number().int().default(0),
})

export const soalPsikotesSchema = z.object({
  id: z.string().optional(),
  urutan: z.number().int().optional().default(1),
  pertanyaan: z.string().min(1, 'Pertanyaan wajib diisi'),
  pilihan_jawaban: z.array(pilihanJawabanSchema).min(2, 'Minimal 2 pilihan jawaban'),
})

export const interpretasiPsikotesSchema = z.object({
  id: z.string().optional(),
  min_skor: z.number().int(),
  max_skor: z.number().int(),
  grade: z.string().optional().default(''),
  judul: z.string().min(1, 'Judul interpretasi wajib diisi'),
  deskripsi: z.string().min(1, 'Deskripsi interpretasi wajib diisi'),
  makna: z.string().optional().nullable(),
  tips: z.any().optional().nullable(),
})

export const createPsikotesSchema = z.object({
  judul: z.string().min(1, 'Judul psikotes wajib diisi'),
  deskripsi: z.string().optional().nullable(),
  banner_url: z.string().optional().nullable(),
  jenis_akses: z.enum(['GRATIS', 'BERBAYAR']).default('GRATIS'),
  harga: z.number().optional().default(0),
  status: z.enum(['PUBLISHED', 'DRAFT']).default('PUBLISHED'),
  benefits: z.any().optional().nullable(),
  soal_psikotes: z.array(soalPsikotesSchema).optional().default([]),
  interpretasi_psikotes: z.array(interpretasiPsikotesSchema).optional().default([]),
})

export const updatePsikotesSchema = createPsikotesSchema.partial()

export const psikotesQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(['PUBLISHED', 'DRAFT', 'ALL']).optional(),
  jenis_akses: z.enum(['GRATIS', 'BERBAYAR']).optional(),
  include_draft: z.union([z.boolean(), z.string()]).optional(),
})

export type CreatePsikotesInput = z.infer<typeof createPsikotesSchema>
export type UpdatePsikotesInput = z.infer<typeof updatePsikotesSchema>
export type PsikotesQueryInput = z.infer<typeof psikotesQuerySchema>
