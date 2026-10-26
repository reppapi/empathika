// =====================================================================
// invoice.schema.ts
// Zod schemas untuk validasi input endpoint invoice.
// =====================================================================

import { z } from 'zod'


// Body untuk menandai invoice sudah dikirim
export const markSentSchema = z.object({
  // Tidak ada body yang wajib — adminName diambil dari JWT token.
  // Bisa opsional untuk extend di masa depan.
})

export type MarkSentInput = z.infer<typeof markSentSchema>
