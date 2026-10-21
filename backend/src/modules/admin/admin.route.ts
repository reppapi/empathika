import type { FastifyInstance } from 'fastify'
import { AdminController } from './admin.controller'
import { adminGuard } from '../../middlewares/admin-guard'
import {
  getAdminJadwalQuerySchema,
  createAdminJadwalSlotSchema,
  createAdminSesiSchema,
  updateBookingStatusSchema,
} from './admin.schema'

export default async function adminRoutes(fastify: FastifyInstance) {
  const controller = new AdminController(fastify)

  // ── Modul Jadwal & Sesi Admin ────────────────────────────────────
  fastify.get('/jadwal', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Admin - Jadwal'],
      summary: 'Monitoring sesi hari ini dan kalender mingguan',
      security: [{ bearerAuth: [] }],
      querystring: getAdminJadwalQuerySchema,
    },
    handler: controller.getJadwal,
  })

  fastify.post('/jadwal-slots', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Admin - Jadwal'],
      summary: 'Admin membukakan slot ketersediaan untuk psikolog',
      security: [{ bearerAuth: [] }],
      body: createAdminJadwalSlotSchema,
    },
    handler: controller.createJadwalSlot,
  })

  fastify.post('/sesi-baru', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Admin - Jadwal'],
      summary: 'Admin membuat sesi baru / walk-in langsung terkonfirmasi',
      security: [{ bearerAuth: [] }],
      body: createAdminSesiSchema,
    },
    handler: controller.createSesi,
  })

  fastify.patch('/booking/:id/status', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Admin - Jadwal'],
      summary: 'Admin memperbarui status sesi booking konsultasi',
      security: [{ bearerAuth: [] }],
      body: updateBookingStatusSchema,
    },
    handler: controller.updateBookingStatus,
  })

  // ── Standar CRUD Admin ──────────────────────────────────────────
  fastify.get('/', {
    preHandler: [adminGuard],
    schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] },
    handler: controller.getAll,
  })

  fastify.get('/:id', {
    preHandler: [adminGuard],
    schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] },
    handler: controller.getById,
  })

  fastify.post('/', {
    preHandler: [adminGuard],
    schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] },
    handler: controller.create,
  })

  fastify.put('/:id', {
    preHandler: [adminGuard],
    schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] },
    handler: controller.update,
  })

  fastify.delete('/:id', {
    preHandler: [adminGuard],
    schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] },
    handler: controller.remove,
  })
}
