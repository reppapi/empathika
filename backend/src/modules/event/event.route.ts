import type { FastifyInstance } from 'fastify'
import { EventController } from './event.controller'
import { authGuard } from '../../middlewares/auth-guard'
import {
  eventIdParamSchema,
  eventQuerySchema,
  createEventSchema,
  updateEventSchema,
  eventListResponseSchema,
  eventDetailResponseSchema,
  eventMutationResponseSchema,
  eventDeleteResponseSchema,
} from './event.schema'

export default async function eventRoutes(fastify: FastifyInstance) {
  const controller = new EventController(fastify)

  // ─────────────────────────────────────────────────────────────────
  // 1. PUBLIC: Ambil semua event (dengan search, filter, pagination)
  // GET /api/v1/event
  // ─────────────────────────────────────────────────────────────────
  fastify.get('/', {
    schema: {
      tags: ['Event'],
      summary: 'Mendapatkan daftar event (Publik) - support search, filter jenis/status, pagination',
      querystring: eventQuerySchema,
      response: {
        200: eventListResponseSchema,
      },
    },
    handler: controller.getAll,
  })

  // ─────────────────────────────────────────────────────────────────
  // 2. PUBLIC: Ambil detail event berdasarkan ID
  // GET /api/v1/event/:id
  // ─────────────────────────────────────────────────────────────────
  fastify.get('/:id', {
    schema: {
      tags: ['Event'],
      summary: 'Mendapatkan detail event berdasarkan ID (Publik)',
      params: eventIdParamSchema,
      response: {
        200: eventDetailResponseSchema,
      },
    },
    handler: controller.getById,
  })

  // ─────────────────────────────────────────────────────────────────
  // 3. PROTECTED (Admin/Biro/Psikolog wajib login): Buat event baru
  // POST /api/v1/event
  // ─────────────────────────────────────────────────────────────────
  fastify.post('/', {
    preHandler: [authGuard],
    schema: {
      tags: ['Event'],
      summary: 'Membuat event baru (Wajib Login - Admin/Biro/Psikolog)',
      security: [{ bearerAuth: [] }],
      body: createEventSchema,
      response: {
        201: eventMutationResponseSchema,
      },
    },
    handler: controller.create,
  })

  // ─────────────────────────────────────────────────────────────────
  // 4. PROTECTED (Admin/Biro/Psikolog wajib login): Update event
  // PUT /api/v1/event/:id
  // ─────────────────────────────────────────────────────────────────
  fastify.put('/:id', {
    preHandler: [authGuard],
    schema: {
      tags: ['Event'],
      summary: 'Memperbarui data event (Wajib Login - Admin/Biro/Psikolog)',
      security: [{ bearerAuth: [] }],
      params: eventIdParamSchema,
      body: updateEventSchema,
      response: {
        200: eventMutationResponseSchema,
      },
    },
    handler: controller.update,
  })

  // ─────────────────────────────────────────────────────────────────
  // 5. PROTECTED (Admin/Biro/Psikolog wajib login): Hapus event
  // DELETE /api/v1/event/:id
  // ─────────────────────────────────────────────────────────────────
  fastify.delete('/:id', {
    preHandler: [authGuard],
    schema: {
      tags: ['Event'],
      summary: 'Menghapus event (Wajib Login - Admin/Biro/Psikolog) - gagal jika ada booking aktif',
      security: [{ bearerAuth: [] }],
      params: eventIdParamSchema,
      response: {
        200: eventDeleteResponseSchema,
      },
    },
    handler: controller.remove,
  })
}
