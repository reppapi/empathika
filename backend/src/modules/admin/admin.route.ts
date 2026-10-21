import type { FastifyInstance } from 'fastify'
import { AdminController } from './admin.controller'
import { adminGuard } from '../../middlewares/admin-guard'
import {
  getAdminJadwalQuerySchema,
  createAdminJadwalSlotSchema,
  createAdminSesiSchema,
  updateBookingStatusSchema,
  updateAdminProfileSchema,
  resendActivationSchema,
} from './admin.schema'

export default async function adminRoutes(fastify: FastifyInstance) {
  const controller = new AdminController(fastify)

  // ── Modul Profil Admin Utama ────────────────────────────────────
  // 1. Publik: Tamu/klien mengambil kontak dan lokasi Admin Utama (Footer & Home)
  fastify.get('/profile/public', {
    schema: {
      tags: ['Admin - Profile'],
      summary: 'Mendapatkan data kontak dan lokasi Admin Utama untuk publik/tamu',
    },
    handler: controller.getPublicProfile,
  })

  // 2. Terproteksi: Admin Utama mengambil profil lengkap sendiri
  fastify.get('/profile', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Admin - Profile'],
      summary: 'Mendapatkan profil Admin Utama yang sedang login',
      security: [{ bearerAuth: [] }],
    },
    handler: controller.getProfile,
  })

  // 3. Terproteksi: Admin Utama memperbarui data profil (kontak, lokasi, bio, dll.)
  fastify.put('/profile', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Admin - Profile'],
      summary: 'Memperbarui profil Admin Utama (kontak, lokasi, bio, foto)',
      security: [{ bearerAuth: [] }],
      body: updateAdminProfileSchema,
    },
    handler: controller.updateProfile,
  })

  fastify.patch('/profile', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Admin - Profile'],
      summary: 'Memperbarui sebagian data profil Admin Utama',
      security: [{ bearerAuth: [] }],
      body: updateAdminProfileSchema,
    },
    handler: controller.updateProfile,
  })

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

  // ── Kirim Ulang Tautan Aktivasi Tenaga Ahli / Biro ──────────────
  fastify.post('/resend-activation', {
    schema: {
      tags: ['Admin'],
      summary: 'Kirim ulang / generate ulang token aktivasi akun tenaga ahli atau biro',
      body: resendActivationSchema,
    },
    handler: controller.resendActivation,
  })

  fastify.delete('/:id', {
    preHandler: [adminGuard],
    schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] },
    handler: controller.remove,
  })
}
