import { z } from 'zod'

const parsePrice = (val: unknown): number => {
  if (typeof val === 'number') return val
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^0-9]/g, '')
    return cleaned ? parseFloat(cleaned) : 0
  }
  return 0
}

export const createLayananSchema = z.object({
  nama: z.string().optional(),
  layanan: z.string().optional(),
  kategori: z.string().optional(),
  kategoriId: z.string().optional(),
  metode: z.string().optional().default('Online/Offline'),
  deskripsi: z.string().optional().default(''),
  harga_weekday: z.preprocess(parsePrice, z.number().min(0)).optional().default(0),
  harga_weekend: z.preprocess(parsePrice, z.number().min(0)).optional().default(0),
  weekday: z.preprocess(parsePrice, z.number().min(0)).optional(),
  weekend: z.preprocess(parsePrice, z.number().min(0)).optional(),
  tarif_tenaga_ahli: z.record(z.any()).optional().nullable(),
  banner_url: z.string().nullable().optional(),
  bannerUrl: z.string().nullable().optional(),
  aktif: z.union([z.boolean(), z.string()]).optional().default(true),
  status: z.string().optional(),
})

export const updateLayananSchema = z.object({
  nama: z.string().optional(),
  layanan: z.string().optional(),
  kategori: z.string().optional(),
  kategoriId: z.string().optional(),
  metode: z.string().optional(),
  deskripsi: z.string().optional(),
  harga_weekday: z.preprocess(parsePrice, z.number().min(0)).optional(),
  harga_weekend: z.preprocess(parsePrice, z.number().min(0)).optional(),
  weekday: z.preprocess(parsePrice, z.number().min(0)).optional(),
  weekend: z.preprocess(parsePrice, z.number().min(0)).optional(),
  tarif_tenaga_ahli: z.record(z.any()).optional().nullable(),
  banner_url: z.string().nullable().optional(),
  bannerUrl: z.string().nullable().optional(),
  aktif: z.union([z.boolean(), z.string()]).optional(),
  status: z.string().optional(),
})

export type CreateLayananInput = z.infer<typeof createLayananSchema>
export type UpdateLayananInput = z.infer<typeof updateLayananSchema>
