import type { FastifyInstance } from 'fastify'
import { BookingController } from './booking.controller'
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

  fastify.post('/', {
    schema: {
      tags: ['Booking & Jadwal'],
      summary: 'Klien membuat booking konsultasi baru',
      body: createClientBookingSchema,
    },
    handler: controller.create,
  })

  fastify.get('/', {
    schema: { tags: ['Booking & Jadwal'], summary: 'Daftar semua booking' },
    handler: controller.getAll,
  })

  fastify.get('/:id', {
    schema: { tags: ['Booking & Jadwal'], summary: 'Detail booking berdasarkan ID' },
    handler: controller.getById,
  })

  // ── 2. Rute Jadwal Psikolog ──────────────────────────────────────────────────
  fastify.get('/me/jadwal', {
    schema: {
      tags: ['Booking & Jadwal'],
      summary: 'Jadwal dan sesi milik psikolog',
    },
    handler: controller.getJadwalSaya,
  })

  fastify.post('/me/jadwal-slots', {
    schema: {
      tags: ['Booking & Jadwal'],
      summary: 'Buka slot jam ketersediaan baru',
      body: createJadwalSlotSchema,
    },
    handler: controller.createJadwalSlot,
  })

  fastify.delete('/me/jadwal-slots/:id', {
    schema: {
      tags: ['Booking & Jadwal'],
      summary: 'Hapus slot jam ketersediaan',
    },
    handler: controller.deleteJadwalSlot,
  })

  // ── 3. Rute Admin ────────────────────────────────────────────────────────────
  fastify.get('/admin/overview', {
    schema: {
      tags: ['Booking & Jadwal - Admin'],
      summary: 'Overview jadwal dan sesi mingguan admin',
      querystring: getAdminJadwalQuerySchema,
    },
    handler: controller.getAdminOverview,
  })

  fastify.post('/admin/slots', {
    schema: {
      tags: ['Booking & Jadwal - Admin'],
      summary: 'Admin membuka slot jadwal asesmen',
      body: createAdminJadwalSlotSchema,
    },
    handler: controller.createAdminSlot,
  })

  fastify.post('/admin/sesi', {
    schema: {
      tags: ['Booking & Jadwal - Admin'],
      summary: 'Admin membuat sesi konsultasi langsung',
      body: createAdminSesiSchema,
    },
    handler: controller.createAdminSesi,
  })

  fastify.patch('/:id/status', {
    schema: {
      tags: ['Booking & Jadwal - Admin'],
      summary: 'Update status booking konsultasi',
      body: updateBookingStatusSchema,
    },
    handler: controller.updateBookingStatus,
  })

  fastify.patch('/:id/cancel', {
    schema: {
      tags: ['Booking & Jadwal - Admin'],
      summary: 'Batalkan sesi booking konsultasi',
    },
    handler: controller.cancelBooking,
  })
}
