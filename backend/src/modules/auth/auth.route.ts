import type { FastifyInstance } from "fastify"
import { AuthController } from "./auth.controller"
import { loginSchema, registerSchema } from "./auth.schema"
import { authGuard } from "../../middlewares/auth-guard"

export default async function authRoutes(fastify: FastifyInstance) {
  const controller = new AuthController(fastify)

  fastify.post("/login", {
    schema: { body: loginSchema, tags: ["Auth"] },
    handler: controller.login,
  })

  fastify.post("/register", {
    schema: { body: registerSchema, tags: ["Auth"] },
    handler: controller.register,
  })

  fastify.get("/me", {
    preHandler: [authGuard],
    schema: { tags: ["Auth"], security: [{ bearerAuth: [] }] },
    handler: controller.me,
  })
}

