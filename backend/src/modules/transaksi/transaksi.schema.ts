import { z } from 'zod'

export const createCheckoutTransaksiSchema = z.object({
  tipe: z.enum(['KONSELING', 'EVENT', 'PSIKOTES'], {
    required_error: 'Tipe transaksi wajib diisi: KONSELING, EVENT, atau PSIKOTES',
  }),
  // Referensi item
  id_item: z.string().describe('ID Jadwal/Booking untuk Konseling, ID Event untuk Event, atau ID Paket untuk Psikotes'),
  // Data Peserta / Klien
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  no_telepon: z.string().min(8, 'Nomor telepon minimal 8 digit'),
  usia: z.number().int().positive().optional(),
  jenis_kelamin: z.string().optional(),
  // Opsi Tambahan
  metode_layanan: z.enum(['ONLINE', 'OFFLINE']).optional(), // Khusus Konseling
  catatan: z.string().optional(), // Deskripsi keluhan untuk konseling
  metode_pembayaran: z.enum(['TRANSFER_BANK', 'E_WALLET', 'QRIS']).optional(),
  channel_pembayaran: z.string().optional(), // BCA, BNI, GOPAY, DANA, dll
  kuota_bundling: z.number().int().min(1).optional(), // Jumlah tiket dalam paket bundling (default 1 untuk satuan)
  nama_bundling: z.string().optional(),
  nama_peserta_tambahan: z.array(z.object({
    nama: z.string(),
    whatsapp: z.string().optional().or(z.literal('')),
  })).optional(),
  id_biro: z.string().optional().describe('ID Biro jika transaksi berasal dari website tenant biro'),
  success_redirect_url: z.string().url().optional(),
  failure_redirect_url: z.string().url().optional(),
})

export const createTransaksiSchema = z.object({
  bookingId: z.string().uuid(),
  paymentMethod: z.string(),
})

export const updateTransaksiSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']),
})

export const refundTransaksiSchema = z.object({
  alasan: z.string().min(3, 'Alasan refund wajib diisi (minimal 3 karakter)'),
})

// ── Admin Query Transaksi Schema (Pagination & Filter) ──────────────────────
export const adminTransaksiQuerySchema = z.object({
  page: z.coerce.number().int().min(1, 'Halaman minimal 1').optional().default(1),
  limit: z.coerce.number().int().min(1).max(100, 'Maksimal 100 data per halaman').optional().default(20),
  search: z.string().trim().optional(),
  status: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  clientId: z.string().optional(),
  biroId: z.string().optional(),
  all: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
})

// ── Webhook Midtrans Callback ────────────────────────────────────────────────
export const webhookMidtransSchema = z.object({
  order_id: z.string().describe('Kode transaksi unik Empathika'),
  transaction_id: z.string().optional().describe('ID Transaksi dari Midtrans'),
  transaction_status: z.string().describe('Status transaksi Midtrans (settlement, pending, cancel, dll)'),
  gross_amount: z.string().describe('Nominal pembayaran'),
  signature_key: z.string().describe('Signature SHA512 untuk validasi keamanan'),
  payment_type: z.string().optional().describe('Metode pembayaran (qris, bank_transfer, gopay, dll)'),
})

export type CreateCheckoutTransaksiInput = z.infer<typeof createCheckoutTransaksiSchema>
export type CreateTransaksiInput = z.infer<typeof createTransaksiSchema>
export type UpdateTransaksiInput = z.infer<typeof updateTransaksiSchema>
export type RefundTransaksiInput = z.infer<typeof refundTransaksiSchema>
export type AdminTransaksiQueryInput = z.input<typeof adminTransaksiQuerySchema>
export type AdminTransaksiQueryOutput = z.infer<typeof adminTransaksiQuerySchema>
export type WebhookMidtransInput = z.infer<typeof webhookMidtransSchema>
