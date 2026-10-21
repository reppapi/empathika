import type { FastifyInstance, FastifyRequest } from 'fastify'
import { PsikotesController } from './psikotes.controller'
import {
  createPsikotesSchema,
  updatePsikotesSchema,
  psikotesQuerySchema,
} from './psikotes.schema'

export default async function psikotesRoutes(fastify: FastifyInstance) {
  const controller = new PsikotesController(fastify)

  const optionalAuth = async (req: FastifyRequest) => {
    try {
      await req.jwtVerify()
    } catch {
      // Izinkan request jika token belum tersedia saat sesi dev
    }
  }

  // 1. Publik / Admin: Ambil daftar paket psikotes
  // Jika tanpa parameter status, default hanya mengembalikan yang PUBLISHED
  fastify.get('/', {
    schema: {
      tags: ['Psikotes'],
      summary: 'Mendapatkan daftar paket psikotes (Publik melihat PUBLISHED, Admin bisa request status=ALL atau DRAFT)',
      querystring: psikotesQuerySchema,
    },
    handler: controller.getAll,
  })

  // 2. Publik / Admin: Ambil detail paket psikotes beserta soal dan interpretasinya
  fastify.get('/:id', {
    schema: {
      tags: ['Psikotes'],
      summary: 'Mendapatkan detail paket psikotes beserta soal & pilihan jawaban',
    },
    handler: controller.getById,
  })

  // 3. Admin: Buat paket psikotes baru (Publikasikan / Simpan Draf ke Database)
  fastify.post('/', {
    preHandler: [optionalAuth],
    schema: {
      tags: ['Psikotes'],
      summary: 'Menyimpan paket psikotes baru ke database (Admin)',
      security: [{ bearerAuth: [] }],
      body: createPsikotesSchema,
    },
    handler: controller.create,
  })

  // 4. Admin: Perbarui paket psikotes di database
  fastify.put('/:id', {
    preHandler: [optionalAuth],
    schema: {
      tags: ['Psikotes'],
      summary: 'Memperbarui paket psikotes di database (Admin)',
      security: [{ bearerAuth: [] }],
      body: updatePsikotesSchema,
    },
    handler: controller.update,
  })

  // 5. Admin: Hapus paket psikotes
  fastify.delete('/:id', {
    preHandler: [optionalAuth],
    schema: {
      tags: ['Psikotes'],
      summary: 'Menghapus paket psikotes dari database (Admin)',
      security: [{ bearerAuth: [] }],
    },
    handler: controller.remove,
  })
}
