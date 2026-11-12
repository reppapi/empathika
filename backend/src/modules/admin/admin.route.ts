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

  // ── Modul Dashboard & Ringkasan Operasional Admin ────────────────
  fastify.get('/dashboard/chart', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Admin - Dashboard'],
      summary: 'Mendapatkan data grafik reservasi sesi konsultasi & asesmen terkonfirmasi',
      security: [{ bearerAuth: [] }],
    },
    handler: controller.getDashboardChart,
  })

  fastify.get('/dashboard/metrics', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Admin - Dashboard'],
      summary: 'Mendapatkan 5 kartu ringkasan operasional admin (pendapatan, klien, sesi selesai, pendaftar workshop, pending bayar)',
      security: [{ bearerAuth: [] }],
    },
    handler: controller.getDashboardMetrics,
  })

  fastify.get('/dashboard/today-sessions', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Admin - Dashboard'],
      summary: 'Mendapatkan daftar sesi konseling hari ini untuk widget dashboard (default top 5)',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'string' },
        },
      },
    },
    handler: controller.getDashboardTodaySessions,
  })

  fastify.get('/dashboard/recent-transactions', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Admin - Dashboard'],
      summary: 'Mendapatkan daftar transaksi pembayaran terbaru untuk widget dashboard (default top 5)',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'string' },
        },
      },
    },
    handler: controller.getDashboardRecentTransactions,
  })

  fastify.get('/dashboard/agenda', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Admin - Dashboard'],
      summary: 'Mendapatkan daftar agenda dan peringatan operasional mendatang langsung dari Database (default top 6)',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'string' },
        },
      },
    },
    handler: controller.getDashboardAgenda,
  })

  // ── Modul Jadwal & Sesi Admin ────────────────────────────────────
  fastify.get('/jadwal', {
    preHandler: [
      async (req) => {
        try {
          await req.jwtVerify()
        } catch {
          // Tetap lanjut agar data monitoring sesi & kalender database dapat dimuat saat prototyping/dev
        }
      },
    ],
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
      summary: 'Admin membukakan slot ketersediaan jadwal asesmen klinik',
      security: [{ bearerAuth: [] }],
      body: createAdminJadwalSlotSchema,
    },
    handler: controller.createJadwalSlot,
  })

  fastify.delete('/jadwal-slots/:id', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Admin - Jadwal'],
      summary: 'Admin menghapus slot ketersediaan jadwal asesmen klinik yang belum dibooking',
      security: [{ bearerAuth: [] }],
    },
    handler: controller.deleteJadwalSlot,
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

  // ── Kirim Ulang Tautan Aktivasi Tenaga Ahli / Biro ──────────────
  // Didaftarkan sebelum /:id agar tidak tertangkap rute dinamis
  fastify.post('/resend-activation', {
    schema: {
      tags: ['Admin'],
      summary: 'Kirim ulang / generate ulang token aktivasi akun tenaga ahli atau biro',
      body: resendActivationSchema,
    },
    handler: controller.resendActivation,
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
