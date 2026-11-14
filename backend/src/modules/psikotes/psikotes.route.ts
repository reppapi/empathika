/** Definisi routing HTTP Fastify untuk endpoint publik dan admin modul psikotes. */
import type { FastifyInstance } from 'fastify'
import { PsikotesController } from './psikotes.controller'
import { adminGuard, adminOrBiroGuard } from '../../middlewares/admin-guard'
import { createRateLimiter } from '../../middlewares/rate-limit'
import {
  createPsikotesSchema,
  updatePsikotesSchema,
  psikotesQuerySchema,
  submitPsikotesSchema,
  pesertaQuerySchema,
  createBookingPsikotesSchema,
  verifyTicketSchema,
} from './psikotes.schema'

export default async function psikotesRoutes(fastify: FastifyInstance) {
  const controller = new PsikotesController(fastify)

  // Rate limiter untuk proteksi submit jawaban dari serangan brute-force / bot spam (maks 10 submit / menit per IP)
  const submitLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 10,
    message: 'Terlalu banyak pengiriman jawaban tes dalam waktu singkat. Silakan tunggu 1 menit sebelum mencoba kembali.',
  })

  // Rate limiter untuk mencegah brute-force kode tiket & nomor WA (maks 10 percobaan / 5 menit per IP)
  const verifyTicketLimiter = createRateLimiter({
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: 'Terlalu banyak percobaan verifikasi kode tiket. Silakan tunggu 5 menit sebelum mencoba kembali.',
  })

  // Rate limiter untuk mencegah spam pembuatan transaksi/booking psikotes (maks 10 / menit per IP)
  const bookingLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 10,
    message: 'Terlalu banyak permintaan pemesanan dalam waktu singkat. Silakan tunggu 1 menit.',
  })

  // Rate limiter untuk mencegah enumerasi endpoint laporan hasil booking (maks 30 / menit per IP)
  const hasilLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 30,
    message: 'Terlalu banyak permintaan akses laporan hasil. Silakan tunggu 1 menit.',
  })

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

  // 1b. Admin & Biro: Ambil daftar peserta psikotes & statistik summary
  fastify.get('/peserta', {
    preHandler: [adminOrBiroGuard],
    schema: {
      tags: ['Psikotes'],
      summary: 'Mendapatkan daftar peserta psikotes dan summary statistik pengerjaan',
      security: [{ bearerAuth: [] }],
      querystring: pesertaQuerySchema,
    },
    handler: controller.getPeserta,
  })

  // 1c. Admin: Pembersihan data pengerjaan tamu anonim lama (Retention Maintenance)
  fastify.delete('/cleanup-anonim', {
    preHandler: [adminGuard],
    schema: {
      tags: ['Psikotes'],
      summary: 'Membersihkan data pengerjaan psikotes tamu anonim yang lebih dari N hari (Admin)',
      security: [{ bearerAuth: [] }],
    },
    handler: controller.cleanupAnonymousGuests,
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
    preHandler: [adminGuard],
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
    preHandler: [adminGuard],
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
    preHandler: [adminGuard],
    schema: {
      tags: ['Psikotes'],
      summary: 'Menghapus paket psikotes dari database (Admin)',
      security: [{ bearerAuth: [] }],
    },
    handler: controller.remove,
  })

  // 5b. Publik: Booking & Pembayaran Paket Psikotes Berbayar (dengan Rate Limiting)
  fastify.post('/booking', {
    preHandler: [bookingLimiter],
    schema: {
      tags: ['Psikotes'],
      summary: 'Mencatat pembelian paket psikotes berbayar ke tabel booking_psikotes dan transaksis',
      body: createBookingPsikotesSchema,
    },
    handler: controller.createBooking,
  })

  // 5c. Publik: Verifikasi Tiket / Kode Akses Pengerjaan Psikotes Berbayar (dengan Rate Limiting)
  fastify.post('/verify-ticket', {
    preHandler: [verifyTicketLimiter],
    schema: {
      tags: ['Psikotes'],
      summary: 'Verifikasi kode akses tiket pengerjaan psikotes berbayar',
      body: verifyTicketSchema,
    },
    handler: controller.verifyTicket,
  })

  // 5d. Publik: Ambil Laporan Hasil Asesmen Resmi Berdasarkan Booking ID (Anti-Tampering + Token untuk Berbayar)
  fastify.get('/booking/:bookingId/hasil', {
    preHandler: [hasilLimiter],
    schema: {
      tags: ['Psikotes'],
      summary: 'Mendapatkan laporan hasil asesmen resmi terverifikasi murni dari database berdasarkan booking ID',
    },
    handler: controller.getHasilByBooking,
  })

  // 6. Publik: Submit jawaban psikotes (dengan Rate Limiting)
  fastify.post('/:id/submit', {
    preHandler: [submitLimiter],
    schema: {
      tags: ['Psikotes'],
      summary: 'Kirimkan jawaban psikotes untuk disimpan ke database dan hitung hasil interpretasi',
      body: submitPsikotesSchema,
    },
    handler: controller.submit,
  })
}

