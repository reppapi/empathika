/** Skema validasi Zod untuk input query, body, paket, submit jawaban, booking, dan tiket psikotes. */
import { z } from 'zod'

export const pilihanJawabanSchema = z.object({
  id: z.string().optional(),
  label: z.string().optional().default(''),
  teks_jawaban: z.string().optional().default(''),
  bobot: z.number().int().optional().default(0),
})

export const soalPsikotesSchema = z.object({
  id: z.string().optional(),
  urutan: z.number().int().optional().default(1),
  pertanyaan: z.string().optional().default(''),
  pilihan_jawaban: z.array(pilihanJawabanSchema).optional().default([]),
})

export const interpretasiPsikotesSchema = z.object({
  id: z.string().optional(),
  min_skor: z.number().int().optional().default(0),
  max_skor: z.number().int().optional().default(0),
  grade: z.string().optional().default(''),
  judul: z.string().optional().default(''),
  deskripsi: z.string().optional().default(''),
})

export const createPsikotesSchema = z.object({
  judul: z.string().min(1, 'Judul psikotes wajib diisi'),
  tentang_tes: z.string().optional().nullable(),
  banner_url: z.string().optional().nullable(),
  jenis_akses: z.enum(['GRATIS', 'BERBAYAR']).default('GRATIS'),
  harga: z.number().optional().default(0),
  status: z.enum(['PUBLISHED', 'DRAFT']).default('PUBLISHED'),
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
  teks_jawaban: z.string().optional().nullable(),
})

export const pesertaPsikotesInputSchema = z.object({
  nama_lengkap: z.string().optional(),
  no_telepon: z.string().optional().nullable(),
  jenis_kelamin: z.string().optional(),
  tempat_lahir: z.string().optional().nullable(),
  tanggal_lahir: z.string().or(z.date()).optional().nullable(),
  usia: z.number().int().optional().nullable(),
  kategori_peserta: z.string().optional().nullable(),
  nama_orang_tua: z.string().optional().nullable(),
  no_telepon_orang_tua: z.string().optional().nullable(),
  pendidikan: z.string().optional().nullable(),
  pekerjaan: z.string().optional().nullable(),
  status_pernikahan: z.string().optional().nullable(),
  persetujuan_wali: z.boolean().optional().nullable(),
})

export const submitPsikotesSchema = z.object({
  jawaban: z.union([
    z.array(submitJawabanItemSchema).min(1, 'Minimal 1 jawaban wajib dikirimkan'),
    z.record(z.string(), z.string()).refine((obj) => Object.keys(obj).length > 0, {
      message: 'Minimal 1 jawaban wajib dikirimkan',
    }),
  ]),
  nama: z.string().optional(),
  no_telepon: z.string().optional(),
  email: z.string().optional(),
  id_booking: z.string().optional(),
  bookingId: z.string().optional(),
  orderId: z.string().optional(),
  kode_akses: z.string().optional(),
  peserta: pesertaPsikotesInputSchema.optional(),
  klien: z
    .object({
      nama: z.string().optional(),
      no_telepon: z.string().optional(),
      email: z.string().optional(),
      usia: z.number().int().optional(),
      jenis_kelamin: z.string().optional(),
    })
    .optional(),
  id_biro: z.string().optional(),
  dampak_aktivitas: z.number().int().min(0).max(3).optional().nullable(),
  peristiwa_lainnya: z.string().optional().nullable(),
  peristiwaLainnya: z.string().optional().nullable(),
  peristiwa_paling_mengganggu: z.string().optional().nullable(),
  peristiwaPalingMengganggu: z.string().optional().nullable(),
  choci_isian: z.record(z.string(), z.string()).optional().nullable(),
})

export type SubmitPsikotesInput = z.infer<typeof submitPsikotesSchema>

export const pesertaQuerySchema = z.object({
  search: z.string().optional(),
  jenis_akses: z.enum(['GRATIS', 'BERBAYAR', 'ALL']).optional(),
  id_paket: z.string().optional(),
  id_biro: z.string().optional(),
  page: z.coerce.number().int().optional().default(1),
  limit: z.coerce.number().int().optional().default(50),
})

export type PesertaQueryInput = z.infer<typeof pesertaQuerySchema>

// ── 7. Booking & Pembayaran Paket Psikotes Berbayar ──
export const createBookingPsikotesSchema = z
  .object({
    id_paket: z.string().optional(),
    testId: z.string().optional(),
    metode_pembayaran: z.string().optional().default('QRIS'),
    channel_pembayaran: z.string().optional().nullable(),
    status_pembayaran: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional().default('PAID'),
    kode_transaksi: z.string().optional(),
    harga: z.number().optional(),
    nama: z.string().optional(),
    no_telepon: z.string().optional(),
    email: z.string().optional(),
    peserta: pesertaPsikotesInputSchema.optional(),
    klien: z
      .object({
        nama: z.string().optional(),
        no_telepon: z.string().optional(),
        email: z.string().optional(),
        usia: z.number().int().optional().nullable(),
        jenis_kelamin: z.string().optional().nullable(),
      })
      .optional(),
    id_biro: z.string().optional().nullable(),
  })
  .refine(
    (data) => Boolean(data.id_paket || data.testId),
    { message: 'ID paket psikotes (id_paket atau testId) wajib diisi', path: ['id_paket'] }
  )
  .refine(
    (data) => {
      const nama = data.peserta?.nama_lengkap || data.klien?.nama || data.nama
      return Boolean(nama && nama.trim().length > 0)
    },
    { message: 'Nama lengkap peserta wajib diisi', path: ['nama'] }
  )

export type CreateBookingPsikotesInput = z.infer<typeof createBookingPsikotesSchema>

// ── 8. Verifikasi Tiket Akses Psikotes ──
export const verifyTicketSchema = z.object({
  kode_akses: z.string().min(3, 'Kode akses atau nomor transaksi wajib diisi'),
  no_telepon: z.string().min(6, 'Nomor WhatsApp pembeli wajib diisi'),
  id_paket: z.string().optional(),
})

export type VerifyTicketInput = z.infer<typeof verifyTicketSchema>

// ── 9. Review Psikolog untuk Asesmen Klinis ──
export const reviewPsikotesQuerySchema = z.object({
  status: z
    .preprocess((val) => {
      if (!val || typeof val !== 'string' || val.trim() === '') return 'ALL'
      const upper = val.toUpperCase().trim()
      if (['ALL', 'MENUNGGU_REVIEW', 'KOLAM_BERSAMA', 'SEDANG_DITELAAH', 'SELESAI'].includes(upper)) {
        return upper
      }
      return 'ALL'
    }, z.enum(['ALL', 'MENUNGGU_REVIEW', 'KOLAM_BERSAMA', 'SEDANG_DITELAAH', 'SELESAI']))
    .optional()
    .default('ALL'),
  search: z.preprocess((val) => {
    if (!val || typeof val !== 'string') return undefined
    return val.trim() || undefined
  }, z.string().optional()),
  page: z.coerce.number().int().optional().default(1),
  limit: z.coerce.number().int().optional().default(50),
})

export type ReviewPsikotesQueryInput = z.infer<typeof reviewPsikotesQuerySchema>

export const assignPsikologSchema = z.object({
  id_psikolog: z.string().min(1, 'Psikolog pemeriksa wajib dipilih'),
})

export type AssignPsikologInput = z.infer<typeof assignPsikologSchema>

export const submitReviewPsikotesSchema = z
  .object({
    catatan_psikolog: z.string().optional().nullable(),
    rekomendasi_psikolog: z.string().optional().nullable(),
    file_laporan_url: z.string().optional().nullable(),
    id_psikolog: z.string().optional().nullable(),
    is_draft: z.boolean().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.is_draft) return true
      const hasPdf = Boolean(data.file_laporan_url && data.file_laporan_url.trim().length > 0)
      const hasCatatan = (data.catatan_psikolog || '').trim().length >= 5
      return hasPdf || hasCatatan
    },
    {
      message: 'Harap unggah file PDF hasil laporan atau isi catatan telaah psikolog minimal 5 karakter sebelum menerbitkan hasil.',
      path: ['file_laporan_url'],
    }
  )

export type SubmitReviewPsikotesInput = z.infer<typeof submitReviewPsikotesSchema>

