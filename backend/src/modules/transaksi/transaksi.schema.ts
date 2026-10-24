import { z } from 'zod'

export const createTransaksiSchema = z.object({
  bookingId: z.string().uuid(),
  paymentMethod: z.enum(['va_bca', 'va_bni', 'va_mandiri', 'gopay', 'ovo', 'dana', 'qris']),
})

export const updateTransaksiSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']),
})

export const refundTransaksiSchema = z.object({
  alasan: z.string().min(3, 'Alasan refund wajib diisi (minimal 3 karakter)'),
})

export type CreateTransaksiInput = z.infer<typeof createTransaksiSchema>
export type UpdateTransaksiInput = z.infer<typeof updateTransaksiSchema>
export type RefundTransaksiInput = z.infer<typeof refundTransaksiSchema>
