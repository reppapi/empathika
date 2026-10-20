import type { FastifyInstance } from "fastify"
import { AuthController } from "./auth.controller"
import { authGuard } from "../../middlewares/auth-guard"
import { loginSchema, loginResponseSchema, userProfileResponseSchema } from "./auth.schema"

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
}
