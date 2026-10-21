import type { FastifyInstance } from "fastify"
import { BiroController } from "./biro.controller"
import { authGuard } from "../../middlewares/auth-guard"
import { updateBiroAccountSchema } from "./biro.schema"

export default async function biroRoutes(fastify: FastifyInstance) {
  const controller = new BiroController(fastify)

  // GET /biro/accounts - Mengambil semua daftar akun Biro (untuk cek akun & ID aktivasi)
  fastify.get("/accounts", {
    schema: {
      tags: ["Biro - Akun"],
      summary: "Mendapatkan seluruh daftar akun Biro (bisa cek ID & status aktivasi)",
    },
    handler: controller.getAll,
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
}
