import type { FastifyInstance } from 'fastify'
import { BlogController } from './blog.controller'
import { authGuard } from '../../middlewares/auth-guard'

export default async function blogRoutes(fastify: FastifyInstance) {
  const controller = new BlogController(fastify)

  fastify.get('/', {
    schema: { tags: ['Blog'] },
    handler: controller.getAll,
  })

  fastify.get('/:id', {
    schema: { tags: ['Blog'] },
    handler: controller.getById,
  })

  fastify.post('/', {
    preHandler: [authGuard],
    schema: { tags: ['Blog'], security: [{ bearerAuth: [] }] },
    handler: controller.create,
  })

  fastify.put('/:id', {
    preHandler: [authGuard],
    schema: { tags: ['Blog'], security: [{ bearerAuth: [] }] },
    handler: controller.update,
  })

  fastify.delete('/:id', {
    preHandler: [authGuard],
    schema: { tags: ['Blog'], security: [{ bearerAuth: [] }] },
    handler: controller.remove,
  })
}
