import Fastify from "fastify"
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod"

// Plugins
import corsPlugin from "./plugins/cors"
import jwtPlugin from "./plugins/jwt"
import prismaPlugin from "./plugins/prisma"
import swaggerPlugin from "./plugins/swagger"
import multipartPlugin from "./plugins/multipart"
import staticPlugin from "./plugins/static"

// Middlewares
import { errorHandler } from "./middlewares/error-handler"

// Routes
import authRoutes from "./modules/auth/auth.route"
import psikologRoutes from "./modules/psikolog/psikolog.route"
import layananRoutes from "./modules/layanan/layanan.route"
import bookingRoutes from "./modules/booking/booking.route"
import eventRoutes from "./modules/event/event.route"
import transaksiRoutes from "./modules/transaksi/transaksi.route"
import blogRoutes from "./modules/blog/blog.route"
import psikotesRoutes from "./modules/psikotes/psikotes.route"
import adminRoutes from "./modules/admin/admin.route"
import biroRoutes from "./modules/biro/biro.route"
import uploadRoutes from "./modules/upload/upload.route"
import invoiceRoutes from "./modules/invoice/invoice.route"

const app = Fastify({ logger: true })

// Setup Zod type provider
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// Register plugins
app.register(corsPlugin)
app.register(jwtPlugin)
app.register(prismaPlugin)
app.register(swaggerPlugin)
app.register(multipartPlugin)
app.register(staticPlugin)

// Global error handler
app.setErrorHandler(errorHandler)

// Register routes
app.register(authRoutes, { prefix: "/auth" })
app.register(psikologRoutes, { prefix: "/psikolog" })
app.register(layananRoutes, { prefix: "/layanan" })
app.register(bookingRoutes, { prefix: "/booking" })
app.register(eventRoutes, { prefix: "/event" })
app.register(transaksiRoutes, { prefix: "/transaksi" })
app.register(blogRoutes, { prefix: "/blog" })
app.register(psikotesRoutes, { prefix: "/psikotes" })
app.register(adminRoutes, { prefix: "/admin" })
app.register(biroRoutes, { prefix: "/biro" })
app.register(uploadRoutes, { prefix: "/upload" })
app.register(invoiceRoutes, { prefix: "/invoice" })

export default app
