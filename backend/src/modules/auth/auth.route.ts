import type { FastifyInstance } from "fastify"
import { AuthController } from "./auth.controller"
import { authGuard } from "../../middlewares/auth-guard"
import {
  loginSchema,
  loginResponseSchema,
  userProfileResponseSchema,
  setPasswordSchema,
  resendActivationSchema,
  checkActivationQuerySchema,
  googleLoginSchema,
} from "./auth.schema"

export default async function authRoutes(fastify: FastifyInstance) {
  const controller = new AuthController(fastify)

  // POST /auth/login - Endpoint login asli ke database
  fastify.post("/login", {
    schema: {
      tags: ["Auth"],
      summary: "Login pengguna (Admin, Psikolog, Biro)",
      body: loginSchema,
      response: {
        200: loginResponseSchema,
      },
    },
    handler: controller.login,
  })

  // POST /auth/google - Endpoint login dengan Google
  fastify.post("/google", {
    schema: {
      tags: ["Auth"],
      summary: "Login pengguna menggunakan akun Google",
      body: googleLoginSchema,
      response: {
        200: loginResponseSchema,
      },
    },
    handler: controller.loginGoogle,
  })

  // GET /auth/me - Cek status profil yang sedang login
  fastify.get("/me", {
    preHandler: [authGuard],
    schema: {
      tags: ["Auth"],
      summary: "Mengambil data profil pengguna yang sedang login",
      security: [{ bearerAuth: [] }],
      response: {
        200: userProfileResponseSchema,
      },
    },
    handler: controller.me,
  })

  // GET /auth/activation - Cek token tautan aktivasi (publik)
  fastify.get("/activation", {
    schema: {
      tags: ["Auth"],
      summary: "Memvalidasi token tautan aktivasi akun",
      querystring: checkActivationQuerySchema,
    },
    handler: controller.checkActivation,
  })

  // POST /auth/set-password - Aktivasi akun & buat password mandiri
  fastify.post("/set-password", {
    schema: {
      tags: ["Auth"],
      summary: "Membuat password baru dan mengaktifkan akun via token aktivasi",
      body: setPasswordSchema,
    },
    handler: controller.setPassword,
  })

  // POST /auth/resend-activation - Kirim ulang token aktivasi (alias di auth)
  fastify.post("/resend-activation", {
    schema: {
      tags: ["Auth"],
      summary: "Membuat ulang tautan aktivasi akun baru",
      body: resendActivationSchema,
    },
    handler: controller.resendActivation,
  })
}
