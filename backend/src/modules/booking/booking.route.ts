import type { FastifyInstance } from 'fastify'
import { BookingController } from './booking.controller'
import { adminGuard } from '../../middlewares/admin-guard'
import { authGuard } from '../../middlewares/auth-guard'
import { psikologGuard } from '../../middlewares/psikolog-guard'
import { createRateLimiter } from '../../middlewares/rate-limit'
import {
  getJadwalTersediaQuerySchema,
  createClientBookingSchema,
  createJadwalSlotSchema,
  createAdminSesiSchema,
  createAdminJadwalSlotSchema,
  updateBookingStatusSchema,
  getAdminJadwalQuerySchema,
} from './booking.schema'

export default async function bookingRoutes(fastify: FastifyInstance) {
  const controller = new BookingController(fastify)

  // ── 1. Rute Publik untuk Client (Tamu) ──────────────────────────────────────
  fastify.get('/jadwal-tersedia', {
    schema: {
      tags: ['Booking & Jadwal'],
      summary: 'Ambil slot jadwal ketersediaan untuk klien',
      querystring: getJadwalTersediaQuerySchema,
    },
    handler: controller.getJadwalTersedia,
  })

  // Klien membuat booking konsultasi baru (dengan proteksi IP Rate Limit)
  fastify.post('/', {
    preHandler: [
      createRateLimiter({
        windowMs: 60 * 1000,
        max: 8,
        message: 'Terlalu banyak permintaan pemesanan sesi dari perangkat Anda. Silakan tunggu 1 menit sebelum memesan kembali.',
      }),
    ],
    schema: {
      tags: ['Booking & Jadwal'],
      summary: 'Klien membuat booking konsultasi baru',
      body: createClientBookingSchema,
    },
    handler: controller.create,
  })

  // Riwayat booking milik akun klien / user yang sedang login
  fastify.get('/me', {
    preHandler: [authGuard],
    schema: {
      tags: ['Booking & Jadwal'],
      summary: 'Daftar riwayat booking milik pengguna login',
      security: [{ bearerAuth: [] }],
    },
    handler: controller.getMyBookings,
  })

  // Daftar semua booking (Admin)
  fastify.get('/', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Booking & Jadwal - Admin'],
      summary: 'Daftar semua booking klien',
      security: [{ bearerAuth: [] }],
    },
    handler: controller.getAll,
  })

  fastify.get('/:id', {
    schema: { tags: ['Booking & Jadwal'], summary: 'Detail booking berdasarkan ID' },
    handler: controller.getById,
  })

  // ── 2. Rute Jadwal Tenaga Ahli / Psikolog ─────────────────────────────────────
  fastify.get('/me/jadwal', {
    preHandler: [psikologGuard],
    schema: {
      tags: ['Booking & Jadwal - Psikolog'],
      summary: 'Jadwal dan sesi milik psikolog yang login',
      security: [{ bearerAuth: [] }],
    },
    handler: controller.getJadwalSaya,
  })

  fastify.post('/me/jadwal-slots', {
    preHandler: [psikologGuard],
    schema: {
      tags: ['Booking & Jadwal - Psikolog'],
      summary: 'Buka slot jam ketersediaan baru',
      security: [{ bearerAuth: [] }],
      body: createJadwalSlotSchema,
    },
    handler: controller.createJadwalSlot,
  })

  fastify.delete('/me/jadwal-slots/:id', {
    preHandler: [psikologGuard],
    schema: {
      tags: ['Booking & Jadwal - Psikolog'],
      summary: 'Hapus slot jam ketersediaan',
      security: [{ bearerAuth: [] }],
    },
    handler: controller.deleteJadwalSlot,
  })

  // ── 3. Rute Admin ────────────────────────────────────────────────────────────
  fastify.get('/admin/overview', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Booking & Jadwal - Admin'],
      summary: 'Overview jadwal dan sesi mingguan admin',
      security: [{ bearerAuth: [] }],
      querystring: getAdminJadwalQuerySchema,
    },
    handler: controller.getAdminOverview,
  })

  fastify.post('/admin/slots', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Booking & Jadwal - Admin'],
      summary: 'Admin membuka slot jadwal asesmen',
      security: [{ bearerAuth: [] }],
      body: createAdminJadwalSlotSchema,
    },
    handler: controller.createAdminSlot,
  })

  fastify.post('/admin/sesi', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Booking & Jadwal - Admin'],
      summary: 'Admin membuat sesi konsultasi langsung',
      security: [{ bearerAuth: [] }],
      body: createAdminSesiSchema,
    },
    handler: controller.createAdminSesi,
  })

  fastify.patch('/:id/status', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Booking & Jadwal - Admin'],
      summary: 'Update status booking konsultasi',
      security: [{ bearerAuth: [] }],
      body: updateBookingStatusSchema,
    },
    handler: controller.updateBookingStatus,
  })

  fastify.patch('/:id/cancel', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Booking & Jadwal - Admin'],
      summary: 'Batalkan sesi booking konsultasi',
      security: [{ bearerAuth: [] }],
    },
    handler: controller.cancelBooking,
  })

  fastify.post('/clean-expired', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Booking & Jadwal - Admin'],
      summary: 'Bersihkan sesi booking pending yang sudah kedaluwarsa dan kembalikan slot',
      security: [{ bearerAuth: [] }],
    },
    handler: controller.cleanExpired,
  })

  fastify.post('/:id/refund', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Booking & Jadwal - Admin'],
      summary: 'Admin memproses refund sesi booking konsultasi 100% (validasi maksimal H-1)',
      security: [{ bearerAuth: [] }],
    },
    handler: controller.processRefund,
  })
}
