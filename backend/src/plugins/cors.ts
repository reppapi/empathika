import fp from "fastify-plugin"
import cors from "@fastify/cors"
import { env } from "../config/env"

export default fp(async (fastify) => {
  const explicitAllowed = env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())

  fastify.register(cors, {
    origin: (origin, cb) => {
      // Izinkan request tanpa origin (misal: curl, mobile apps, server-to-server)
      if (!origin) {
        return cb(null, true)
      }

      // 1. Cek origin yang eksplisit di env
      if (explicitAllowed.includes(origin)) {
        return cb(null, true)
      }

      // 2. Izinkan localhost, 127.0.0.1, dan seluruh subdomain localhost dengan sembarang port
      // Contoh: http://localhost:3000, http://127.0.0.1:3000, http://ugm.localhost:3000
      const localhostRegex = /^https?:\/\/(([a-z0-9-]+\.)*localhost|127\.0\.0\.1)(:[0-9]+)?$/i
      if (localhostRegex.test(origin)) {
        return cb(null, true)
      }

      // 3. Izinkan domain utama dan seluruh subdomain empathika di production / staging
      // Contoh: https://empathika.com, https://ugm.empathika.com, https://abc.empathika.com
      const empathikaRegex = /^https?:\/\/([a-z0-9-]+\.)*empathika\.com$/i
      if (empathikaRegex.test(origin)) {
        return cb(null, true)
      }

      // Origin tidak diizinkan
      return cb(null, false)
    },
    credentials: true,
  })
})

