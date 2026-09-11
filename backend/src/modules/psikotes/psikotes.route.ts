import type { FastifyInstance } from 'fastify'
import { PsikotesController } from './psikotes.controller'
import { authGuard } from '../../middlewares/auth-guard'

export default async function psikotesRoutes(fastify: FastifyInstance) {
  const controller = new PsikotesController(fastify)

  fastify.get('/', {
    schema: { tags: ['Psikotes'] },
    handler: controller.getAll,
  })

  fastify.get('/:id', {
    schema: { tags: ['Psikotes'] },
    handler: controller.getById,
  })

  fastify.post('/', {
    preHandler: [authGuard],
    schema: { tags: ['Psikotes'], security: [{ bearerAuth: [] }] },
    handler: controller.create,
  })

  fastify.put('/:id', {
    preHandler: [authGuard],
    schema: { tags: ['Psikotes'], security: [{ bearerAuth: [] }] },
    handler: controller.update,
  })

  fastify.delete('/:id', {
    preHandler: [authGuard],
    schema: { tags: ['Psikotes'], security: [{ bearerAuth: [] }] },
    handler: controller.remove,
  })
}
