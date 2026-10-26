import { z } from "zod"

export const updateBiroAccountSchema = z.object({
  email: z.string().email("Format email tidak valid").optional(),
  passwordLama: z.string().min(1, "Password lama wajib diisi jika ingin mengganti password").optional(),
  passwordBaru: z.string().min(6, "Password baru minimal 6 karakter").optional(),
})

export type UpdateBiroAccountInput = z.infer<typeof updateBiroAccountSchema>

// ── 1. Parameter Identifikasi Biro Publik (by Slug) ──────────────────────────
export const getPublicBiroParamsSchema = z.object({
  slug: z.string().min(1, "Slug biro wajib disertakan"),
})

export type GetPublicBiroParams = z.infer<typeof getPublicBiroParamsSchema>

// ── 2. Filter & Parameter Psikolog Biro ──────────────────────────────────────
export const getPublicBiroPsikologQuerySchema = z.object({
  kategori: z.string().optional(),
  search: z.string().optional(),
  spesialisasi: z.string().optional(),
})

export type GetPublicBiroPsikologQuery = z.infer<typeof getPublicBiroPsikologQuerySchema>

export const getPublicBiroPsikologDetailParamsSchema = z.object({
  slug: z.string().min(1, "Slug biro wajib disertakan"),
  psikologId: z.string().uuid("ID psikolog harus berupa format UUID"),
})

export type GetPublicBiroPsikologDetailParams = z.infer<typeof getPublicBiroPsikologDetailParamsSchema>

// ── 3. Filter Layanan & Jadwal Tersedia Biro ─────────────────────────────────
export const getPublicBiroLayananQuerySchema = z.object({
  kategori: z.string().optional(),
})

export type GetPublicBiroLayananQuery = z.infer<typeof getPublicBiroLayananQuerySchema>

export const getPublicBiroJadwalQuerySchema = z.object({
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD").optional(),
  id_psikolog: z.string().optional(),
  tipe_jadwal: z.enum(["KONSULTASI", "ASESMEN"]).default("KONSULTASI"),
})

export type GetPublicBiroJadwalQuery = z.infer<typeof getPublicBiroJadwalQuerySchema>

// ── 4. Booking Konsultasi Klien pada Biro ────────────────────────────────────
export const createPublicBiroBookingSchema = z.object({
  id_jadwal: z.string().uuid("ID jadwal harus berupa UUID"),
  id_layanan: z.string().uuid("ID layanan harus berupa UUID"),
  metode: z.enum(["ONLINE", "OFFLINE"]).default("ONLINE"),
  deskripsi_trauma: z.string().optional(),
  klien: z.object({
    nama: z.string().min(1, "Nama klien wajib diisi"),
    no_telepon: z.string().min(8, "Nomor kontak WhatsApp minimal 8 digit"),
    email: z.string().email("Format email tidak valid").optional(),
    usia: z.number().int().positive("Usia harus berupa angka positif").optional(),
    jenis_kelamin: z.string().optional(),
  }),
})

export type CreatePublicBiroBookingInput = z.infer<typeof createPublicBiroBookingSchema>

// ── 5. Cek Status Booking Klien ──────────────────────────────────────────────
export const getPublicBiroBookingStatusParamsSchema = z.object({
  slug: z.string().min(1, "Slug biro wajib disertakan"),
  kode_pesanan: z.string().min(1, "Kode pesanan wajib disertakan"),
})

export type GetPublicBiroBookingStatusParams = z.infer<typeof getPublicBiroBookingStatusParamsSchema>

// ── 6. Form Kontak / Pertanyaan Klien pada Biro ──────────────────────────────
export const sendPublicBiroContactSchema = z.object({
  nama: z.string().min(2, "Nama minimal 2 karakter"),
  no_telepon: z.string().min(8, "Nomor telepon minimal 8 digit"),
  email: z.string().email("Format email tidak valid").optional(),
  subjek: z.string().optional(),
  pesan: z.string().min(5, "Pesan minimal 5 karakter"),
})

export type SendPublicBiroContactInput = z.infer<typeof sendPublicBiroContactSchema>
