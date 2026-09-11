import type { FastifyInstance } from 'fastify'
import { LayananController } from './layanan.controller'
import { authGuard } from '../../middlewares/auth-guard'

export default async function layananRoutes(fastify: FastifyInstance) {
  const controller = new LayananController(fastify)

  fastify.get('/', {
    schema: { tags: ['Layanan'] },
    handler: controller.getAll,
  })

  fastify.get('/:id', {
    schema: { tags: ['Layanan'] },
    handler: controller.getById,
  })

  fastify.post('/', {
    preHandler: [authGuard],
    schema: { tags: ['Layanan'], security: [{ bearerAuth: [] }] },
    handler: controller.create,
  })

  fastify.put('/:id', {
    preHandler: [authGuard],
    schema: { tags: ['Layanan'], security: [{ bearerAuth: [] }] },
    handler: controller.update,
  })

  fastify.delete('/:id', {
    preHandler: [authGuard],
    schema: { tags: ['Layanan'], security: [{ bearerAuth: [] }] },
    handler: controller.remove,
  })
}
