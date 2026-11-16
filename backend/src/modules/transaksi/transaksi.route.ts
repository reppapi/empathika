import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { TransaksiController } from './transaksi.controller'
import { WebhookController } from './payment/webhook.controller'
import {
  createTransaksiSchema,
  createCheckoutTransaksiSchema,
  refundTransaksiSchema,
  adminTransaksiQuerySchema,
  webhookXenditSchema,
} from './transaksi.schema'
import { authGuard } from '../../middlewares/auth-guard'
import { adminGuard, adminOrBiroGuard } from '../../middlewares/admin-guard'

export default async function transaksiRoutes(fastify: FastifyInstance) {
  const controller = new TransaksiController(fastify)
  const webhookCtrl = new WebhookController(fastify)

  // ── Admin & Biro routes ──────────────────────────────────────────
  fastify.get('/admin', {
    preHandler: [adminOrBiroGuard],
    schema: {
      tags: ['Transaksi - Admin'],
      summary: 'Admin melihat semua riwayat transaksi dengan paginasi dan filter',
      security: [{ bearerAuth: [] }],
      querystring: adminTransaksiQuerySchema,
    },
    handler: controller.getAll,
  })

  fastify.post('/:id/refund', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Transaksi - Admin'],
      summary: 'Admin memproses refund transaksi 70% kembali ke klien, 15% psikolog, 15% empathika (validasi maksimal H-1 sesi)',
      security: [{ bearerAuth: [] }],
      body: refundTransaksiSchema,
    },
    handler: controller.processRefund,
  })

  // ── Publik / Client Checkout Terpusat (Konseling, Event, Psikotes) ─
  fastify.post('/checkout', {
    schema: {
      body: createCheckoutTransaksiSchema,
      tags: ['Transaksi'],
      summary: 'Universal Checkout Xendit untuk Pendaftaran Konseling, Event, dan Psikotes Premium',
    },
    handler: controller.checkout,
  })

  // ── Client routes ───────────────────────────────────────────────
  fastify.get('/me', {
    preHandler: [authGuard],
    schema: { tags: ['Transaksi'], security: [{ bearerAuth: [] }] },
    handler: controller.getMyTransaksi,
  })

  fastify.get('/:id', {
    schema: { tags: ['Transaksi'], summary: 'Ambil detail transaksi berdasarkan ID atau Kode Transaksi' },
    handler: controller.getById,
  })

  // Legacy inisiasi pembayaran booking
  fastify.post('/', {
    preHandler: [authGuard],
    schema: { body: createTransaksiSchema, tags: ['Transaksi'], security: [{ bearerAuth: [] }] },
    handler: controller.createPayment,
  })

  // ── Simulasi Konfirmasi Pembayaran (Frontend Mock / Testing) ───
  fastify.post('/:id/confirm-simulation', {
    schema: {
      tags: ['Transaksi'],
      summary: 'Konfirmasi pembayaran simulasi untuk development / testing tanpa webhook Xendit',
      params: z.object({ id: z.string() }),
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.any().optional(),
        }),
      },
    },
    handler: controller.confirmSimulation,
  })

  // ── Webhook Xendit Callback ─────────────────────────────────────
  fastify.post('/webhook', {
    schema: {
      tags: ['Transaksi - Webhook'],
      summary: 'Menerima webhook callback status pembayaran dari Xendit (x-callback-token). Untuk testing: kosongkan header x-callback-token jika XENDIT_WEBHOOK_TOKEN belum diset di .env.',
      body: webhookXenditSchema,
      response: {
        200: z.object({
          received: z.boolean(),
          message: z.string().optional(),
        }),
      },
    },
    handler: webhookCtrl.handle,
  })
}
