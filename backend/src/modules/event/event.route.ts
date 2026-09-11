import type { FastifyInstance } from 'fastify'
import { EventController } from './event.controller'
import { authGuard } from '../../middlewares/auth-guard'

export default async function eventRoutes(fastify: FastifyInstance) {
  const controller = new EventController(fastify)

  fastify.get('/', {
    schema: { tags: ['Event'] },
    handler: controller.getAll,
  })

  fastify.get('/:id', {
    schema: { tags: ['Event'] },
    handler: controller.getById,
  })

  fastify.post('/', {
    preHandler: [authGuard],
    schema: { tags: ['Event'], security: [{ bearerAuth: [] }] },
    handler: controller.create,
  })

  fastify.put('/:id', {
    preHandler: [authGuard],
    schema: { tags: ['Event'], security: [{ bearerAuth: [] }] },
    handler: controller.update,
  })

  fastify.delete('/:id', {
    preHandler: [authGuard],
    schema: { tags: ['Event'], security: [{ bearerAuth: [] }] },
    handler: controller.remove,
  })
}
