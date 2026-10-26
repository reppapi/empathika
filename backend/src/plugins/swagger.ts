import fp from "fastify-plugin"
import swagger from "@fastify/swagger"
import swaggerUi from "@fastify/swagger-ui"
import { jsonSchemaTransform } from "fastify-type-provider-zod"

export default fp(async (fastify) => {
  fastify.register(swagger, {
    openapi: {
      info: {
        title: "Empathika API",
        description: "REST API untuk platform psikologi Empathika",
        version: "1.0.0",
      },
      servers: [{ url: "http://localhost:3001", description: "Development" }],
      components: {
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        },
      },
    },
    transform: (opts: any) => {
      try {
        return jsonSchemaTransform(opts)
      } catch (err: any) {
        fastify.log.error(
          `[Swagger] Error parsing schema for route ${opts?.url || "unknown"}: ${err?.message}`
        )
        // Fallback schema to prevent whole Swagger UI from breaking with 500
        const rawSchema = { ...opts?.schema }
        return { schema: rawSchema, url: opts?.url }
      }
    },
  })

  fastify.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: { docExpansion: "list", deepLinking: false },
  })
})

