import type { FastifyInstance } from 'fastify'
import { KerjaSamaController } from './kerja-sama.controller'
import {
  createPengajuanSchema,
  updatePengajuanStatusSchema,
  getPengajuanQuerySchema,
  createProgramSchema,
  updateProgramSchema,
  updateFormulirSchema,
} from './kerja-sama.schema'

export default async function kerjaSamaRoutes(fastify: FastifyInstance) {
  const controller = new KerjaSamaController(fastify)

  // ── 1. Pengajuan Kerja Sama (Leads) ─────────────────────────────────────────

  // Publik / Klien: Submit Pengajuan Kerja Sama
  fastify.post('/pengajuan', {
    schema: {
      tags: ['Kerja Sama - Leads'],
      summary: 'Kirim pengajuan formulir kemitraan kerja sama baru',
      body: createPengajuanSchema,
    },
    handler: controller.createPengajuan,
  })

  // Admin: Mengambil Daftar Semua Pengajuan Kerja Sama
  fastify.get('/pengajuan', {
    schema: {
      tags: ['Kerja Sama - Leads'],
      summary: 'Daftar seluruh pengajuan kerja sama (dengan filter & summary)',
      querystring: getPengajuanQuerySchema,
    },
    handler: controller.getPengajuanList,
  })

  // Admin: Mengambil Detail Satu Pengajuan Kerja Sama
  fastify.get('/pengajuan/:id', {
    schema: {
      tags: ['Kerja Sama - Leads'],
      summary: 'Detail pengajuan kerja sama berdasarkan ID',
    },
    handler: controller.getPengajuanById,
  })

  // Admin: Update Status Pengajuan (MENUNGGU / DIHUBUNGI / DISETUJUI / DITOLAK)
  fastify.patch('/pengajuan/:id/status', {
    schema: {
      tags: ['Kerja Sama - Leads'],
      summary: 'Update status tindak lanjut pengajuan kerja sama',
      body: updatePengajuanStatusSchema,
    },
    handler: controller.updatePengajuanStatus,
  })

  // Alias PUT untuk fleksibilitas klien
  fastify.put('/pengajuan/:id/status', {
    schema: {
      tags: ['Kerja Sama - Leads'],
      summary: 'Update status tindak lanjut pengajuan kerja sama (PUT)',
      body: updatePengajuanStatusSchema,
    },
    handler: controller.updatePengajuanStatus,
  })

  // Admin: Menghapus Pengajuan Kerja Sama
  fastify.delete('/pengajuan/:id', {
    schema: {
      tags: ['Kerja Sama - Leads'],
      summary: 'Hapus data pengajuan kerja sama',
    },
    handler: controller.deletePengajuan,
  })

  // ── 2. Program Kerja Sama ───────────────────────────────────────────────────

  // Publik & Admin: Mengambil Daftar Semua Program Kerja Sama
  fastify.get('/program', {
    schema: {
      tags: ['Kerja Sama - Program'],
      summary: 'Daftar semua program kerja sama kemitraan',
    },
    handler: controller.getAllPrograms,
  })

  // Publik & Admin: Detail Program Berdasarkan ID atau Slug
  fastify.get('/program/:idOrSlug', {
    schema: {
      tags: ['Kerja Sama - Program'],
      summary: 'Detail program kerja sama berdasarkan ID atau Slug',
    },
    handler: controller.getProgramByIdOrSlug,
  })

  // Admin: Tambah Program Kerja Sama Baru
  fastify.post('/program', {
    schema: {
      tags: ['Kerja Sama - Program'],
      summary: 'Tambah program kerja sama kemitraan baru',
      body: createProgramSchema,
    },
    handler: controller.createProgram,
  })

  // Admin: Update Program Kerja Sama
  fastify.put('/program/:id', {
    schema: {
      tags: ['Kerja Sama - Program'],
      summary: 'Update program kerja sama kemitraan',
      body: updateProgramSchema,
    },
    handler: controller.updateProgram,
  })

  // Admin: Hapus Program Kerja Sama
  fastify.delete('/program/:id', {
    schema: {
      tags: ['Kerja Sama - Program'],
      summary: 'Hapus program kerja sama kemitraan',
    },
    handler: controller.deleteProgram,
  })

  // ── 3. Formulir Kerja Sama ──────────────────────────────────────────────────

  // Publik & Admin: Ambil Seluruh Konfigurasi Formulir
  fastify.get('/formulir', {
    schema: {
      tags: ['Kerja Sama - Formulir'],
      summary: 'Daftar konfigurasi formulir kemitraan',
    },
    handler: controller.getAllFormulir,
  })

  // Publik & Admin: Ambil Konfigurasi Formulir Berdasarkan Slug
  fastify.get('/formulir/:slug', {
    schema: {
      tags: ['Kerja Sama - Formulir'],
      summary: 'Ambil konfigurasi formulir berdasarkan slug (asesmen, in-house-training, lainnya)',
    },
    handler: controller.getFormulirBySlug,
  })

  // Admin: Update Pertanyaan Khusus / Konfigurasi Formulir
  fastify.put('/formulir/:slug', {
    schema: {
      tags: ['Kerja Sama - Formulir'],
      summary: 'Update konfigurasi formulir kemitraan',
      body: updateFormulirSchema,
    },
    handler: controller.updateFormulir,
  })
}
