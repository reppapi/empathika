import type { FastifyInstance } from 'fastify'
import { AdminController } from './admin.controller'
import { authGuard } from '../../middlewares/auth-guard'

export default async function adminRoutes(fastify: FastifyInstance) {
  const controller = new AdminController(fastify)

  fastify.get('/', {
    schema: { tags: ['Admin'] },
    handler: controller.getAll,
  })

  fastify.get('/:id', {
    schema: { tags: ['Admin'] },
    handler: controller.getById,
  })

  fastify.post('/', {
    preHandler: [authGuard],
    schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] },
    handler: controller.create,
  })

  fastify.put('/:id', {
    preHandler: [authGuard],
    schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] },
    handler: controller.update,
  })

  fastify.delete('/:id', {
    preHandler: [authGuard],
    schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] },
    handler: controller.remove,
  })
}
