import type { FastifyInstance } from "fastify"
import { BiroController } from "./biro.controller"
import { authGuard } from "../../middlewares/auth-guard"
import {
  biroAccountIdParamsSchema,
  updateBiroAccountSchema,
  createBiroSchema,
  updateBiroProfileSchema,
  getPublicBiroParamsSchema,
  getPublicBiroPsikologQuerySchema,
  getPublicBiroPsikologDetailParamsSchema,
  getPublicBiroLayananQuerySchema,
  getPublicBiroJadwalQuerySchema,
  createPublicBiroBookingSchema,
  getPublicBiroBookingStatusParamsSchema,
  sendPublicBiroContactSchema,
} from "./biro.schema"

export default async function biroRoutes(fastify: FastifyInstance) {
  const controller = new BiroController(fastify)

  // ==========================================
  // 1. MANAJEMEN AKUN INTERNAL BIRO (PORTAL)
  // ==========================================

  // GET /biro/accounts - Mengambil semua daftar akun Biro (untuk cek akun & ID aktivasi)
  fastify.get("/accounts", {
    schema: {
      tags: ["Biro - Akun"],
      summary: "Mendapatkan seluruh daftar akun Biro (bisa cek ID & status aktivasi)",
    },
    handler: controller.getAll,
  })

  // POST /biro/admin/create - Admin membuat akun Biro baru + link aktivasi
  fastify.post("/admin/create", {
    schema: {
      tags: ["Biro - Admin"],
      summary: "Admin membuat akun Biro baru dengan link aktivasi",
      body: createBiroSchema,
    },
    handler: controller.createBiro,
  })

  // GET /biro/admin/:accountId - Admin mengambil detail akun Biro berdasarkan accountId
  fastify.get("/admin/:accountId", {
    schema: {
      tags: ["Biro - Admin"],
      summary: "Admin mendapatkan detail akun Biro berdasarkan accountId",
      params: biroAccountIdParamsSchema,
    },
    handler: controller.getBiroById,
  })

  // PUT /biro/admin/:accountId - Admin memperbarui profil Biro
  fastify.put("/admin/:accountId", {
    schema: {
      tags: ["Biro - Admin"],
      summary: "Admin memperbarui profil Biro (nama, slug, deskripsi, dsb.)",
      params: biroAccountIdParamsSchema,
      body: updateBiroProfileSchema,
    },
    handler: controller.updateBiroProfile,
  })

  // GET /biro/account - Mendapatkan detail akun Biro yang sedang login
  fastify.get("/account", {
    preHandler: [authGuard],
    schema: {
      tags: ["Biro - Akun"],
      summary: "Mendapatkan profil akun Biro yang sedang login",
      security: [{ bearerAuth: [] }],
    },
    handler: controller.getMyAccount,
  })

  // PUT /biro/account - Ganti email dan password akun Biro
  fastify.put("/account", {
    preHandler: [authGuard],
    schema: {
      tags: ["Biro - Akun"],
      summary: "Memperbarui email dan kata sandi akun Biro",
      security: [{ bearerAuth: [] }],
      body: updateBiroAccountSchema,
    },
    handler: controller.updateAccount,
  })



  // GET /biro/public/:slug - Profil utama website biro
  fastify.get("/public/:slug", {
    schema: {
      tags: ["Biro - Website Publik (Client)"],
      summary: "Mendapatkan profil publik biro berdasarkan slug untuk landing page website",
      params: getPublicBiroParamsSchema,
    },
    handler: controller.getPublicBiro,
  })

  // GET /biro/public/:slug/psikolog - Daftar tenaga ahli & psikolog di biro
  fastify.get("/public/:slug/psikolog", {
    schema: {
      tags: ["Biro - Website Publik (Client)"],
      summary: "Mendapatkan daftar psikolog dan konselor yang bertugas di biro ini",
      params: getPublicBiroParamsSchema,
      querystring: getPublicBiroPsikologQuerySchema,
    },
    handler: controller.getPublicBiroPsikolog,
  })

  // GET /biro/public/:slug/psikolog/:psikologId - Detail satu psikolog di biro
  fastify.get("/public/:slug/psikolog/:psikologId", {
    schema: {
      tags: ["Biro - Website Publik (Client)"],
      summary: "Mendapatkan profil lengkap satu psikolog di biro beserta ketersediaan jadwal terdekat",
      params: getPublicBiroPsikologDetailParamsSchema,
    },
    handler: controller.getPublicBiroPsikologDetail,
  })

  // GET /biro/public/:slug/layanan - Daftar layanan aktif yang tersedia di biro
  fastify.get("/public/:slug/layanan", {
    schema: {
      tags: ["Biro - Website Publik (Client)"],
      summary: "Mendapatkan daftar layanan konseling dan asesmen aktif yang tersedia di biro",
      params: getPublicBiroParamsSchema,
      querystring: getPublicBiroLayananQuerySchema,
    },
    handler: controller.getPublicBiroLayanan,
  })

  // GET /biro/public/:slug/jadwal-tersedia - Slot jadwal ketersediaan di biro
  fastify.get("/public/:slug/jadwal-tersedia", {
    schema: {
      tags: ["Biro - Website Publik (Client)"],
      summary: "Mendapatkan slot jadwal ketersediaan konsultasi untuk klien di website biro",
      params: getPublicBiroParamsSchema,
      querystring: getPublicBiroJadwalQuerySchema,
    },
    handler: controller.getPublicBiroJadwal,
  })

  // POST /biro/public/:slug/booking - Klien memesan sesi konsultasi di biro
  fastify.post("/public/:slug/booking", {
    schema: {
      tags: ["Biro - Website Publik (Client)"],
      summary: "Klien melakukan reservasi booking konsultasi mandiri melalui website biro",
      params: getPublicBiroParamsSchema,
      body: createPublicBiroBookingSchema,
    },
    handler: controller.createPublicBiroBooking,
  })

  // GET /biro/public/:slug/booking/:kode_pesanan - Cek status booking pesanan klien
  fastify.get("/public/:slug/booking/:kode_pesanan", {
    schema: {
      tags: ["Biro - Website Publik (Client)"],
      summary: "Klien mengecek status booking konsultasi berdasarkan nomor atau kode pesanan",
      params: getPublicBiroBookingStatusParamsSchema,
    },
    handler: controller.getPublicBiroBookingStatus,
  })

  // POST /biro/public/:slug/kontak - Form pesan kontak pengunjung untuk biro
  fastify.post("/public/:slug/kontak", {
    schema: {
      tags: ["Biro - Website Publik (Client)"],
      summary: "Pengunjung mengirimkan pesan atau pertanyaan kontak langsung ke pihak biro",
      params: getPublicBiroParamsSchema,
      body: sendPublicBiroContactSchema,
    },
    handler: controller.sendPublicBiroContact,
  })
}
