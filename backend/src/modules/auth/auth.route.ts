import type { FastifyInstance } from "fastify"
import { AuthController } from "./auth.controller"
import { authGuard } from "../../middlewares/auth-guard"

export default async function authRoutes(fastify: FastifyInstance) {
  const controller = new AuthController(fastify)

  fastify.get("/me", {
    preHandler: [authGuard],
    schema: { tags: ["Auth"], security: [{ bearerAuth: [] }] },
    handler: controller.me,
  })
}

