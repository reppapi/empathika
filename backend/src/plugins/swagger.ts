import fp from "fastify-plugin"
import swagger from "@fastify/swagger"
import swaggerUi from "@fastify/swagger-ui"

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
  })

  fastify.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: { docExpansion: "list", deepLinking: false },
  })
})

