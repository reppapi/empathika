import fp from "fastify-plugin"
import multipart from "@fastify/multipart"

export default fp(async (fastify) => {
  fastify.register(multipart, {
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE ?? "5242880"), // 5MB default
    },
  })
})

