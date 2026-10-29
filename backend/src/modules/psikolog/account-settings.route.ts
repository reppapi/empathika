// File: backend/src/modules/psikolog/account-settings.route.ts
import type { FastifyInstance } from "fastify"
import { AccountSettingsController } from "./account-settings.controller"
import { psikologGuard } from "../../middlewares/psikolog-guard"
import {
  sensitiveAccountRateLimit,
  verifyEmailRateLimit,
} from "../../middlewares/account-security-rate-limit"
import {
  emailChangeRequestSchema,
  verifyEmailSchema,
  changePasswordSchema,
} from "./account-settings.schema"

export default async function accountSettingsRoutes(fastify: FastifyInstance) {
  const controller = new AccountSettingsController(fastify)

  // 1. GET /api/psikolog/account/email/change-request - Cek status pending
  fastify.get("/psikolog/account/email/change-request", {
    preHandler: [psikologGuard],
    schema: {
      tags: ["Psikolog - Akun"],
      summary: "Mengambil status permintaan pergantian email yang aktif",
      security: [{ bearerAuth: [] }],
    },
    handler: controller.getPendingEmailChange,
  })

  // 2. POST /api/psikolog/account/email/change-request - Request ganti email
  fastify.post("/psikolog/account/email/change-request", {
    preHandler: [psikologGuard, sensitiveAccountRateLimit],
    schema: {
      tags: ["Psikolog - Akun"],
      summary: "Meminta link verifikasi untuk pergantian email",
      security: [{ bearerAuth: [] }],
      body: emailChangeRequestSchema,
    },
    handler: controller.requestEmailChange,
  })

  // 3. DELETE /api/psikolog/account/email/change-request - Batalkan request ganti email
  fastify.delete("/psikolog/account/email/change-request", {
    preHandler: [psikologGuard],
    schema: {
      tags: ["Psikolog - Akun"],
      summary: "Membatalkan permintaan pergantian email yang masih pending",
      security: [{ bearerAuth: [] }],
    },
    handler: controller.cancelEmailChange,
  })

  // 4. POST /api/account/email/verify - Verifikasi email publik via token
  fastify.post("/account/email/verify", {
    preHandler: [verifyEmailRateLimit],
    schema: {
      tags: ["Akun - Publik"],
      summary: "Memverifikasi token ganti email",
      body: verifyEmailSchema,
    },
    handler: controller.verifyEmailChange,
  })

  // 5. PATCH /api/psikolog/account/password - Ganti password
  fastify.patch("/psikolog/account/password", {
    preHandler: [psikologGuard, sensitiveAccountRateLimit],
    schema: {
      tags: ["Psikolog - Akun"],
      summary: "Mengganti password akun psikolog",
      security: [{ bearerAuth: [] }],
      body: changePasswordSchema,
    },
    handler: controller.changePassword,
  })
}
