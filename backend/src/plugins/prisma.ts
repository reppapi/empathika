import fp from "fastify-plugin"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
})

export default fp(async (fastify) => {
  await prisma.$connect()

  fastify.decorate("prisma", prisma)

  fastify.addHook("onClose", async (server) => {
    await server.prisma.$disconnect()
  })
})

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

