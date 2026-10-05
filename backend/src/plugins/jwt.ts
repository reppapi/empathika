import fp from "fastify-plugin"
import jwt from "@fastify/jwt"
import { env } from "../config/env"

export default fp(async (fastify) => {
  fastify.register(jwt, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: env.JWT_EXPIRES_IN },
  })

  fastify.decorate("authenticate", async function (request: any, reply: any) {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.code(401).send({ error: "Unauthorized", message: "Token tidak valid atau expired" })
    }
  })
})

