import fp from "fastify-plugin"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
})

export default fp(async (fastify) => {
  fastify.decorate("prisma", prisma)

  fastify.addHook("onClose", async (server) => {
    await server.prisma.$disconnect()
  })

  // Lakukan warm-up koneksi di background agar tidak memicu FST_ERR_PLUGIN_TIMEOUT (10s)
  // saat DNS pooler Supabase lambat merespons. Prisma tetap otomatis connect saat query pertama.
  void (async () => {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await prisma.$connect()
        fastify.log.info(`[Prisma] Terhubung ke database (percobaan ke-${attempt})`)
        return
      } catch (err: any) {
        fastify.log.warn(`[Prisma] Gagal koneksi (percobaan ke-${attempt}/3): ${err?.message || err}`)
        if (attempt < 3) {
          await new Promise((r) => setTimeout(r, 2000))
        }
      }
    }
    fastify.log.error("[Prisma] Tidak dapat terhubung ke database setelah 3 percobaan.")
  })()
})

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}
