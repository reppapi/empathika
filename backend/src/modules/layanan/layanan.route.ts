import type { FastifyInstance } from 'fastify'
import { LayananController } from './layanan.controller'
import { authGuard } from '../../middlewares/auth-guard'
import { createLayananSchema, updateLayananSchema } from './layanan.schema'

export default async function layananRoutes(fastify: FastifyInstance) {
  const controller = new LayananController(fastify)

  fastify.get('/', {
    schema: { tags: ['Layanan'], summary: 'Daftar semua layanan aktif' },
    handler: controller.getAll,
  })

  fastify.get('/:id', {
    schema: { tags: ['Layanan'], summary: 'Detail layanan berdasarkan ID' },
    handler: controller.getById,
  })

  fastify.post('/', {
    preHandler: [authGuard],
    schema: { tags: ['Layanan'], summary: 'Tambah layanan baru (Admin)', body: createLayananSchema, security: [{ bearerAuth: [] }] },
    handler: controller.create,
  })

  fastify.put('/:id', {
    preHandler: [authGuard],
    schema: { tags: ['Layanan'], summary: 'Perbarui layanan (Admin)', body: updateLayananSchema, security: [{ bearerAuth: [] }] },
    handler: controller.update,
  })

  fastify.delete('/:id', {
    preHandler: [authGuard],
    schema: { tags: ['Layanan'], summary: 'Hapus layanan (Admin)', security: [{ bearerAuth: [] }] },
    handler: controller.remove,
  })
}
