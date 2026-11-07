import type { FastifyInstance } from 'fastify'
import { EventController } from './event.controller'
import { DokumentasiController } from './dokumentasi.controller'
import { adminGuard } from '../../middlewares/admin-guard'
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
import {
  dokumentasiIdParamSchema,
  dokumentasiQuerySchema,
  createDokumentasiSchema,
  updateDokumentasiSchema,
  dokumentasiListResponseSchema,
  dokumentasiDetailResponseSchema,
  dokumentasiMutationResponseSchema,
  dokumentasiDeleteResponseSchema,
} from './dokumentasi.schema'

export default async function eventRoutes(fastify: FastifyInstance) {
  const controller = new EventController(fastify)
  const dokController = new DokumentasiController(fastify)

  // ─────────────────────────────────────────────────────────────────
  // DOKUMENTASI EVENT SELESAI ROUTES (/event/dokumentasi)
  // ─────────────────────────────────────────────────────────────────

  // 1. PUBLIC: Daftar dokumentasi event selesai
  // GET /event/dokumentasi
  fastify.get('/dokumentasi', {
    schema: {
      tags: ['Event - Dokumentasi Selesai'],
      summary: 'Mendapatkan daftar dokumentasi event selesai',
      querystring: dokumentasiQuerySchema,
      response: {
        200: dokumentasiListResponseSchema,
      },
    },
    handler: dokController.getAll,
  })

  // 2. PUBLIC: Detail dokumentasi event selesai
  // GET /event/dokumentasi/:id
  fastify.get('/dokumentasi/:id', {
    schema: {
      tags: ['Event - Dokumentasi Selesai'],
      summary: 'Mendapatkan detail dokumentasi event selesai berdasarkan ID',
      params: dokumentasiIdParamSchema,
      response: {
        200: dokumentasiDetailResponseSchema,
      },
    },
    handler: dokController.getById,
  })

  // 3. ADMIN ONLY: Buat dokumentasi event baru
  // POST /event/dokumentasi
  fastify.post('/dokumentasi', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Event - Dokumentasi Selesai'],
      summary: 'Membuat dokumentasi event selesai baru (Admin Only)',
      security: [{ bearerAuth: [] }],
      body: createDokumentasiSchema,
      response: {
        201: dokumentasiMutationResponseSchema,
      },
    },
    handler: dokController.create,
  })

  // 4. ADMIN ONLY: Update dokumentasi event
  // PUT /event/dokumentasi/:id
  fastify.put('/dokumentasi/:id', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Event - Dokumentasi Selesai'],
      summary: 'Memperbarui dokumentasi event selesai (Admin Only)',
      security: [{ bearerAuth: [] }],
      params: dokumentasiIdParamSchema,
      body: updateDokumentasiSchema,
      response: {
        200: dokumentasiMutationResponseSchema,
      },
    },
    handler: dokController.update,
  })

  // 5. ADMIN ONLY: Hapus dokumentasi event
  // DELETE /event/dokumentasi/:id
  fastify.delete('/dokumentasi/:id', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Event - Dokumentasi Selesai'],
      summary: 'Menghapus dokumentasi event selesai beserta foto fisiknya (Admin Only)',
      security: [{ bearerAuth: [] }],
      params: dokumentasiIdParamSchema,
      response: {
        200: dokumentasiDeleteResponseSchema,
      },
    },
    handler: dokController.remove,
  })

  // ─────────────────────────────────────────────────────────────────
  // REGULAR EVENT ROUTES (/event)
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
    preHandler: [adminGuard],
    schema: {
      tags: ['Event'],
      summary: 'Membuat event baru (Admin Only)',
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
    preHandler: [adminGuard],
    schema: {
      tags: ['Event'],
      summary: 'Memperbarui data event (Admin Only)',
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
    preHandler: [adminGuard],
    schema: {
      tags: ['Event'],
      summary: 'Menghapus event (Admin Only) - gagal jika ada booking aktif',
      security: [{ bearerAuth: [] }],
      params: eventIdParamSchema,
      response: {
        200: eventDeleteResponseSchema,
      },
    },
    handler: controller.remove,
  })
}
