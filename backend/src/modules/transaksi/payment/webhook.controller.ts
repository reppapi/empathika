import type { FastifyRequest, FastifyReply } from 'fastify'
import { paymentService } from './payment.service'

// Dipanggil secara internal dari transaksi.route.ts
export const webhookController = {
  handle: async (request: FastifyRequest, reply: FastifyReply) => {
    const signature = request.headers['x-callback-token'] as string
    const payload = request.body as Record<string, unknown>

    const isValid = paymentService.verifyWebhookSignature(payload, signature)
    if (!isValid) {
      return reply.code(400).send({ error: 'Invalid signature' })
    }

    // TODO: Update transaksi status
    reply.send({ received: true })
  },
}
