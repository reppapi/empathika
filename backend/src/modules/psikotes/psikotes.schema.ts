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

export const submitJawabanItemSchema = z.object({
  id_soal: z.string().min(1, 'ID soal wajib diisi'),
  id_pilihan: z.string().min(1, 'ID pilihan jawaban wajib diisi'),
})

export const submitPsikotesSchema = z.object({
  jawaban: z.union([
    z.array(submitJawabanItemSchema).min(1, 'Minimal 1 jawaban wajib dikirimkan'),
    z.record(z.string(), z.string()).refine((obj) => Object.keys(obj).length > 0, {
      message: 'Minimal 1 jawaban wajib dikirimkan',
    }),
  ]),
  klien: z
    .object({
      nama: z.string().optional(),
      no_telepon: z.string().optional(),
      usia: z.number().int().optional(),
      jenis_kelamin: z.string().optional(),
    })
    .optional(),
  id_biro: z.string().optional(),
})

export type SubmitPsikotesInput = z.infer<typeof submitPsikotesSchema>

export const pesertaQuerySchema = z.object({
  search: z.string().optional(),
  jenis_akses: z.enum(['GRATIS', 'BERBAYAR', 'ALL']).optional(),
  id_paket: z.string().optional(),
  page: z.coerce.number().int().optional().default(1),
  limit: z.coerce.number().int().optional().default(50),
})

export type PesertaQueryInput = z.infer<typeof pesertaQuerySchema>

