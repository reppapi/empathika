// =====================================================================
// invoice.route.ts
// Route Fastify untuk modul invoice.
// Semua endpoint dijaga oleh adminGuard (hanya ADMIN).
// Prefix: /invoice (didaftarkan di app.ts)
// =====================================================================

import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { InvoiceController } from './invoice.controller'
import { adminGuard } from '../../middlewares/admin-guard'

const invoiceTransaksiParamSchema = z.object({
  transaksiId: z.string(),
})

export default async function invoiceRoutes(fastify: FastifyInstance) {
  const controller = new InvoiceController(fastify)

  // ── GET /invoice/transaksi/:transaksiId ────────────────────────────
  // Ambil (atau terbitkan) invoice untuk transaksi yang sudah PAID.
  // Juga mengembalikan teks pesan WA dan info validasi nomor WA.
  fastify.get('/transaksi/:transaksiId', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Invoice'],
      summary: 'Ambil/terbitkan invoice untuk transaksi (lazy generate, idempotent)',
      security: [{ bearerAuth: [] }],
      params: invoiceTransaksiParamSchema,
    },
    handler: controller.getOrCreate,
  })

  // ── GET /invoice/transaksi/:transaksiId/wa-url ─────────────────────
  // Bangun URL wa.me dengan teks invoice ter-encode.
  // Dipakai FE untuk membuka tab baru ke WhatsApp.
  fastify.get('/transaksi/:transaksiId/wa-url', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Invoice'],
      summary: 'Dapatkan URL wa.me dengan teks invoice ter-URL-encode',
      security: [{ bearerAuth: [] }],
      params: invoiceTransaksiParamSchema,
    },
    handler: controller.getWaUrl,
  })

  // ── POST /invoice/transaksi/:transaksiId/mark-sent ─────────────────
  // Tandai invoice sudah dikirim via WA (dipakai setelah admin buka link wa.me).
  // Pengiriman ulang diperbolehkan dan memperbarui sent_at.
  fastify.post('/transaksi/:transaksiId/mark-sent', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Invoice'],
      summary: 'Tandai invoice sudah dikirim ke WhatsApp klien',
      security: [{ bearerAuth: [] }],
      params: invoiceTransaksiParamSchema,
    },
    handler: controller.markSent,
  })
}
