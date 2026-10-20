import fp from 'fastify-plugin'
import fastifyStatic from '@fastify/static'
import { join } from 'node:path'

export default fp(async (fastify) => {
  fastify.register(fastifyStatic, {
    root: join(process.cwd(), 'public'),
    prefix: '/',
    // decorateReply: true adalah default, tidak perlu diset manual
    // Ini memungkinkan fastify serve file statis dari folder public/
  })
})
