import type { FastifyInstance } from 'fastify'
import { PsikologController } from './psikolog.controller'
import { authGuard } from '../../middlewares/auth-guard'

export default async function psikologRoutes(fastify: FastifyInstance) {
  const controller = new PsikologController(fastify)

  fastify.get('/', {
    schema: { tags: ['Psikolog'] },
    handler: controller.getAll,
  })

  fastify.get('/:id', {
    schema: { tags: ['Psikolog'] },
    handler: controller.getById,
  })

  fastify.post('/', {
    preHandler: [authGuard],
    schema: { tags: ['Psikolog'], security: [{ bearerAuth: [] }] },
    handler: controller.create,
  })

  fastify.put('/:id', {
    preHandler: [authGuard],
    schema: { tags: ['Psikolog'], security: [{ bearerAuth: [] }] },
    handler: controller.update,
  })

  fastify.delete('/:id', {
    preHandler: [authGuard],
    schema: { tags: ['Psikolog'], security: [{ bearerAuth: [] }] },
    handler: controller.remove,
  })
}
