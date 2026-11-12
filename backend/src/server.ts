import app from "./app"
import { env } from "./config/env"
import { isDevDummyAuthEnabled } from "./middlewares/dev-bypass"

const start = async () => {
  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" })
    app.log.info(`Server running at http://0.0.0.0:${env.PORT} (env: ${env.NODE_ENV})`)
    if (isDevDummyAuthEnabled()) {
      app.log.warn("[SECURITY] Bypass token dummy- aktif (NODE_ENV=development). Pastikan NODE_ENV=production diset saat deploy.")
    } else {
      app.log.info("[SECURITY] Mode ketat aktif: bypass token dummy- dinonaktifkan.")
    }
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()

