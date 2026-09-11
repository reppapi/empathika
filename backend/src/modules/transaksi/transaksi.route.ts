import type { FastifyInstance } from 'fastify'
import { TransaksiController } from './transaksi.controller'
import { TransaksiService } from './transaksi.service'
import { createTransaksiSchema } from './transaksi.schema'
import { authGuard } from '../../middlewares/auth-guard'

export default async function transaksiRoutes(fastify: FastifyInstance) {
  const controller = new TransaksiController(fastify)
  const service = new TransaksiService(fastify)

  // Client routes
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
