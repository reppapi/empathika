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

// ── Webhook Xendit Callback ──────────────────────────────────────────────────
export const webhookXenditSchema = z.object({
  id: z.string().describe('ID Invoice dari Xendit (contoh: inv_123456789)'),
  external_id: z.string().describe('Kode transaksi yang dikirim saat checkout (kode_transaksi)'),
  status: z.enum(['PAID', 'EXPIRED', 'FAILED', 'SETTLED']).describe('Status pembayaran dari Xendit'),
  amount: z.number().describe('Nominal tagihan (contoh: 150000)'),
  paid_amount: z.number().optional().describe('Nominal yang dibayar'),
  payment_method: z.string().optional().describe('Metode pembayaran (QRIS, BANK_TRANSFER, dll)'),
  payment_channel: z.string().optional().describe('Channel pembayaran (BCA, GOPAY, QRIS, dll)'),
  payer_email: z.string().optional(),
  paid_at: z.string().optional(),
})

export type CreateCheckoutTransaksiInput = z.infer<typeof createCheckoutTransaksiSchema>
export type CreateTransaksiInput = z.infer<typeof createTransaksiSchema>
export type UpdateTransaksiInput = z.infer<typeof updateTransaksiSchema>
export type RefundTransaksiInput = z.infer<typeof refundTransaksiSchema>
export type WebhookXenditInput = z.infer<typeof webhookXenditSchema>
