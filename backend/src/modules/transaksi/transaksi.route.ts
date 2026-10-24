import type { FastifyInstance } from 'fastify'
import { TransaksiController } from './transaksi.controller'
import { TransaksiService } from './transaksi.service'
import { createTransaksiSchema, refundTransaksiSchema } from './transaksi.schema'
import { authGuard } from '../../middlewares/auth-guard'
import { adminGuard } from '../../middlewares/admin-guard'

export default async function transaksiRoutes(fastify: FastifyInstance) {
  const controller = new TransaksiController(fastify)
  const service = new TransaksiService(fastify)

  // ── Admin routes ────────────────────────────────────────────────
  fastify.get('/admin', {
    preHandler: [adminGuard],
    schema: { tags: ['Transaksi - Admin'], summary: 'Admin melihat semua riwayat transaksi', security: [{ bearerAuth: [] }] },
    handler: controller.getAll,
  })

  fastify.post('/:id/refund', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Transaksi - Admin'],
      summary: 'Admin memproses refund transaksi 100% (validasi maksimal H-1 sesi)',
      security: [{ bearerAuth: [] }],
      body: refundTransaksiSchema,
    },
    handler: controller.processRefund,
  })

  // ── Client routes ───────────────────────────────────────────────
  fastify.get('/me', {
    preHandler: [authGuard],
    schema: { tags: ['Transaksi'], security: [{ bearerAuth: [] }] },
    handler: controller.getMyTransaksi,
  })

  fastify.get('/:id', {
    preHandler: [authGuard],
    schema: { tags: ['Transaksi'], security: [{ bearerAuth: [] }] },
    handler: controller.getById,
  })

  fastify.post('/', {
    preHandler: [authGuard],
    schema: { body: createTransaksiSchema, tags: ['Transaksi'], security: [{ bearerAuth: [] }] },
    handler: controller.createPayment,
  })

  // Webhook dari payment gateway - TANPA auth guard (pakai signature verification)
  fastify.post('/webhook', {
    schema: { tags: ['Transaksi'] },
    handler: async (request, reply) => {
      await service.handleWebhook(request.body as Record<string, unknown>)
      reply.send({ received: true })
    },
  })
}
