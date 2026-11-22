import fp from "fastify-plugin"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
})

export default fp(async (fastify) => {
  // Retry connect logic for cloud DB with high latency / pooler delays
  let connected = false
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await prisma.$connect()
      connected = true
      fastify.log.info(`[Prisma] Terhubung ke database (percobaan ke-${attempt})`)
      break
    } catch (err: any) {
      fastify.log.warn(`[Prisma] Gagal koneksi (percobaan ke-${attempt}/3): ${err?.message || err}`)
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, 2000))
      }
    }
  }

  if (!connected) {
    fastify.log.error("[Prisma] Tidak dapat terhubung ke database setelah 3 percobaan.")
  }

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
