import type { FastifyInstance } from 'fastify'
import { BookingController } from './booking.controller'
import { authGuard } from '../../middlewares/auth-guard'

export default async function bookingRoutes(fastify: FastifyInstance) {
  const controller = new BookingController(fastify)

  fastify.get('/', {
    schema: { tags: ['Booking'] },
    handler: controller.getAll,
  })

  fastify.get('/:id', {
    schema: { tags: ['Booking'] },
    handler: controller.getById,
  })

  fastify.post('/', {
    preHandler: [authGuard],
    schema: { tags: ['Booking'], security: [{ bearerAuth: [] }] },
    handler: controller.create,
  })

  fastify.put('/:id', {
    preHandler: [authGuard],
    schema: { tags: ['Booking'], security: [{ bearerAuth: [] }] },
    handler: controller.update,
  })

  fastify.delete('/:id', {
    preHandler: [authGuard],
    schema: { tags: ['Booking'], security: [{ bearerAuth: [] }] },
    handler: controller.remove,
  })
}
