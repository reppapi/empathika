import type { FastifyInstance } from 'fastify'
import { AdminController } from './admin.controller'
import { adminGuard, adminOrBiroGuard } from '../../middlewares/admin-guard'
import { adminBiroOrPsikologGuard } from '../../middlewares/account-guard'
import {
  getAdminJadwalQuerySchema,
  createAdminJadwalSlotSchema,
  createAdminSesiSchema,
  updateBookingStatusSchema,
  rescheduleBookingSchema,
  updateAdminProfileSchema,
  resendActivationSchema,
  dashboardLimitQuerySchema,
  dashboardChartQuerySchema,
  dashboardMetricsQuerySchema,
  updateTentangKamiSchema,
  createInternshipPositionSchema,
  updateInternshipPositionSchema,
  updateInternshipPositionsSchema,
  internshipIdParamsSchema,
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

  // ── Modul Manajemen Konten Tentang Kami ─────────────────────────
  // 1. Publik: Tamu/klien mengambil konten halaman Tentang Kami
  fastify.get('/tentang-kami/public', {
    schema: {
      tags: ['Admin - Tentang Kami'],
      summary: 'Mendapatkan data konten publik halaman Tentang Kami',
    },
    handler: controller.getTentangKamiPublic,
  })

  // 2. Terproteksi: Admin mengambil data konfigurasi Tentang Kami untuk dashboard
  fastify.get('/tentang-kami', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Admin - Tentang Kami'],
      summary: 'Mendapatkan konfigurasi konten Tentang Kami untuk formulir admin',
      security: [{ bearerAuth: [] }],
    },
    handler: controller.getTentangKami,
  })

  // 3. Terproteksi: Admin memperbarui data konfigurasi Tentang Kami
  fastify.put('/tentang-kami', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Admin - Tentang Kami'],
      summary: 'Memperbarui seluruh konten dan galeri halaman Tentang Kami',
      security: [{ bearerAuth: [] }],
      body: updateTentangKamiSchema,
    },
    handler: controller.updateTentangKami,
  })

  // ── Modul Manajemen Internship (Database Murni) ──────────────────
  // 1. Publik: Klien mengambil posisi internship yang sedang aktif/dibuka dari database
  fastify.get('/internship/public', {
    schema: {
      tags: ['Admin - Internship'],
      summary: 'Mendapatkan daftar posisi internship yang terbuka untuk publik dari database',
    },
    handler: controller.getInternshipPublic,
  })

  // 2. Terproteksi: Admin mengambil seluruh daftar posisi internship dari database
  fastify.get('/internship', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Admin - Internship'],
      summary: 'Mendapatkan seluruh data posisi internship untuk dashboard admin dari database',
      security: [{ bearerAuth: [] }],
    },
    handler: controller.getInternship,
  })

  // 2b. Terproteksi: Admin mengambil detail satu posisi internship berdasarkan ID
  fastify.get('/internship/:id', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Admin - Internship'],
      summary: 'Mendapatkan detail satu posisi internship dari database',
      security: [{ bearerAuth: [] }],
      params: internshipIdParamsSchema,
    },
    handler: controller.getInternshipById,
  })

  // 3. Terproteksi: Admin membuat posisi internship baru di database
  fastify.post('/internship', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Admin - Internship'],
      summary: 'Menambahkan lowongan posisi internship baru ke database',
      security: [{ bearerAuth: [] }],
      body: createInternshipPositionSchema,
    },
    handler: controller.createInternship,
  })

  // 4. Terproteksi: Admin memperbarui rincian posisi internship di database
  fastify.put('/internship/:id', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Admin - Internship'],
      summary: 'Memperbarui data lowongan posisi internship di database',
      security: [{ bearerAuth: [] }],
      params: internshipIdParamsSchema,
      body: updateInternshipPositionSchema,
    },
    handler: controller.updateInternshipItem,
  })

  // 5. Terproteksi: Admin toggle status buka/tutup lowongan posisi di database
  fastify.patch('/internship/:id/toggle', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Admin - Internship'],
      summary: 'Mengubah status visibilitas lowongan posisi (buka/tutup) di database',
      security: [{ bearerAuth: [] }],
      params: internshipIdParamsSchema,
    },
    handler: controller.toggleInternshipStatus,
  })

  // 6. Terproteksi: Admin menghapus lowongan posisi dari database
  fastify.delete('/internship/:id', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Admin - Internship'],
      summary: 'Menghapus posisi internship dari database',
      security: [{ bearerAuth: [] }],
      params: internshipIdParamsSchema,
    },
    handler: controller.deleteInternship,
  })

  // 7. Terproteksi: Admin sinkronisasi seluruh daftar posisi internship ke database
  fastify.put('/internship', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Admin - Internship'],
      summary: 'Sinkronisasi seluruh daftar posisi internship ke database',
      security: [{ bearerAuth: [] }],
      body: updateInternshipPositionsSchema,
    },
    handler: controller.updateInternship,
  })

  // ── Modul Dashboard & Ringkasan Operasional Admin & Biro ───────────
  fastify.get('/dashboard/chart', {
    preHandler: [adminOrBiroGuard],
    schema: {
      tags: ['Admin - Dashboard'],
      summary: 'Mendapatkan data grafik reservasi sesi konsultasi & asesmen terkonfirmasi',
      security: [{ bearerAuth: [] }],
      querystring: dashboardChartQuerySchema,
    },
    handler: controller.getDashboardChart,
  })

  fastify.get('/dashboard/metrics', {
    preHandler: [adminOrBiroGuard],
    schema: {
      tags: ['Admin - Dashboard'],
      summary: 'Mendapatkan 5 kartu ringkasan operasional admin (pendapatan, klien, sesi selesai, pendaftar workshop, pending bayar)',
      security: [{ bearerAuth: [] }],
      querystring: dashboardMetricsQuerySchema,
    },
    handler: controller.getDashboardMetrics,
  })

  fastify.get('/dashboard/today-sessions', {
    preHandler: [adminOrBiroGuard],
    schema: {
      tags: ['Admin - Dashboard'],
      summary: 'Mendapatkan daftar sesi konseling hari ini untuk widget dashboard (default top 5)',
      security: [{ bearerAuth: [] }],
      querystring: dashboardLimitQuerySchema,
    },
    handler: controller.getDashboardTodaySessions,
  })

  fastify.get('/dashboard/recent-transactions', {
    preHandler: [adminOrBiroGuard],
    schema: {
      tags: ['Admin - Dashboard'],
      summary: 'Mendapatkan daftar transaksi pembayaran terbaru untuk widget dashboard (default top 5)',
      security: [{ bearerAuth: [] }],
      querystring: dashboardLimitQuerySchema,
    },
    handler: controller.getDashboardRecentTransactions,
  })

  fastify.get('/dashboard/agenda', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Admin - Dashboard'],
      summary: 'Mendapatkan daftar agenda dan peringatan operasional mendatang langsung dari Database (default top 6)',
      security: [{ bearerAuth: [] }],
      querystring: dashboardLimitQuerySchema,
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
    preHandler: [adminOrBiroGuard],
    schema: {
      tags: ['Admin - Jadwal'],
      summary: 'Admin membukakan slot ketersediaan jadwal klinik',
      security: [{ bearerAuth: [] }],
      body: createAdminJadwalSlotSchema,
    },
    handler: controller.createJadwalSlot,
  })

  fastify.delete('/jadwal-slots/:id', {
    preHandler: [adminOrBiroGuard],
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
    preHandler: [adminBiroOrPsikologGuard],
    schema: {
      tags: ['Admin - Jadwal'],
      summary: 'Admin memperbarui status sesi booking konsultasi',
      security: [{ bearerAuth: [] }],
      body: updateBookingStatusSchema,
    },
    handler: controller.updateBookingStatus,
  })

  fastify.post('/booking/:id/reschedule', {
    preHandler: [adminBiroOrPsikologGuard],
    schema: {
      tags: ['Admin - Jadwal'],
      summary: 'Admin menjadwalkan ulang (reschedule) sesi booking konsultasi',
      security: [{ bearerAuth: [] }],
      body: rescheduleBookingSchema,
    },
    handler: controller.rescheduleBooking,
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
