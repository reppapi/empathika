import type { FastifyInstance } from 'fastify'
import { PsikologController } from './psikolog.controller'
import { adminGuard } from '../../middlewares/admin-guard'
import {
  getJadwalTersediaQuerySchema,
  getJadwalPsikologMeQuerySchema,
  createJadwalSlotSchema,
  registerPsikologBaruSchema,
} from './psikolog.schema'

export default async function psikologRoutes(fastify: FastifyInstance) {
  const controller = new PsikologController(fastify)

  // ── 1. Rute Publik untuk Klien (Tamu) ───────────────────────────
  // Mengambil slot jadwal yang TERSEDIA berdasarkan tanggal
  fastify.get('/jadwal-tersedia', {
    schema: {
      tags: ['Psikolog & Jadwal'],
      summary: 'Ambil slot jadwal ketersediaan untuk klien',
      querystring: getJadwalTersediaQuerySchema,
    },
    handler: controller.getJadwalTersedia,
  })

  // Daftar psikolog aktif
  fastify.get('/', {
    schema: { tags: ['Psikolog'], summary: 'Daftar semua psikolog aktif' },
    handler: controller.getAll,
  })

  // Detail profil psikolog
  fastify.get('/:id', {
    schema: { tags: ['Psikolog'], summary: 'Detail psikolog berdasarkan ID' },
    handler: controller.getById,
  })

  // ── 2. Rute Portal Psikolog (Login Wajib) ─────────────────────────
  // Psikolog melihat jadwal mingguan & sesi yang sudah dibooking
  fastify.get('/me/jadwal', {
    preHandler: [
      async (req) => {
        try {
          await req.jwtVerify()
        } catch {
          // Tetap lanjut saat prototype testing tanpa token
        }
      },
    ],
    schema: {
      tags: ['Psikolog - Portal'],
      summary: 'Jadwal mingguan & agenda sesi milik psikolog yang login',
      security: [{ bearerAuth: [] }],
      querystring: getJadwalPsikologMeQuerySchema,
    },
    handler: controller.getJadwalSaya,
  })

  // Psikolog membuka slot jam ketersediaan baru
  fastify.post('/me/jadwal-slots', {
    preHandler: [
      async (req) => {
        try {
          await req.jwtVerify()
        } catch {
          // Tetap lanjut saat testing prototype tanpa token
        }
      },
    ],
    schema: {
      tags: ['Psikolog - Portal'],
      summary: 'Buka slot jam ketersediaan baru',
      body: createJadwalSlotSchema,
    },
    handler: controller.createJadwalSlot,
  })

  // Psikolog menghapus slot jam yang belum dibooking
  fastify.delete('/me/jadwal-slots/:id', {
    preHandler: [
      async (req) => {
        try {
          await req.jwtVerify()
        } catch {
          // Tetap lanjut saat prototype testing tanpa token
        }
      },
    ],
    schema: {
      tags: ['Psikolog - Portal'],
      summary: 'Hapus slot jam ketersediaan yang belum dibooking',
      security: [{ bearerAuth: [] }],
    },
    handler: controller.deleteJadwalSlot,
  })

  // ── 3. Rute Pengelolaan Psikolog oleh Admin ───────────────────────
  fastify.post('/tambah', {
    preHandler: [
      async (req) => {
        try {
          await req.jwtVerify()
        } catch {
          // Tetap lanjut saat prototype testing
        }
      },
    ],
    schema: {
      tags: ['Psikolog - Admin'],
      summary: 'Tambah tenaga ahli baru oleh admin (buat Akun & Profil Psikolog di DB)',
      body: registerPsikologBaruSchema,
    },
    handler: controller.registerPsikologBaru,
  })

  fastify.post('/', {
    preHandler: [adminGuard],
    schema: { tags: ['Psikolog - Admin'], security: [{ bearerAuth: [] }] },
    handler: controller.create,
  })

  fastify.put('/:id', {
    preHandler: [
      async (req) => {
        try {
          await req.jwtVerify()
        } catch (_err) {
          // Token opsional / abaikan jika belum login JWT
        }
      },
    ],
    schema: { tags: ['Psikolog - Admin'], security: [{ bearerAuth: [] }] },
    handler: controller.update,
  })

  fastify.delete('/:id', {
    preHandler: [
      async (req) => {
        try {
          await req.jwtVerify()
        } catch (_err) {
          // Token opsional / abaikan jika belum login JWT
        }
      },
    ],
    schema: { tags: ['Psikolog - Admin'], security: [{ bearerAuth: [] }] },
    handler: controller.remove,
  })
}
