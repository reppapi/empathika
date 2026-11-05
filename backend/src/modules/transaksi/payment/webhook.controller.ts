import type { FastifyRequest, FastifyReply } from 'fastify'
import { paymentService } from './payment.service'
import { TransaksiService } from '../transaksi.service'

export class WebhookController {
  private transaksiService: TransaksiService

  constructor(fastify: any) {
    this.transaksiService = new TransaksiService(fastify)
  }

  handle = async (request: FastifyRequest, reply: FastifyReply) => {
    // Header callback token dari Xendit: 'x-callback-token'
    const callbackToken = request.headers['x-callback-token'] as string | undefined
    const payload = request.body as Record<string, unknown>

    // Guard: body harus berisi id (payload Xendit wajib)
    if (!payload || !payload['id']) {
      return reply.code(400).send({ error: 'Bad Request', message: 'Payload webhook tidak valid atau kosong' })
    }

    const isValid = paymentService.verifyWebhookSignature(callbackToken)
    if (!isValid) {
      request.log.warn('[Xendit Webhook] Token callback tidak valid')
      return reply.code(401).send({ error: 'Unauthorized', message: 'Invalid callback token' })
    }

    try {
      await this.transaksiService.handleWebhook(payload)
      return reply.code(200).send({ received: true, message: 'Webhook berhasil diproses' })
    } catch (err: any) {
      request.log.error(err, '[Xendit Webhook] Error memproses webhook callback')
      return reply.code(500).send({ error: 'Internal Server Error', message: err.message })
    }
  }
}

// Handler object untuk backward compatibility
export const webhookController = {
  handle: async (request: FastifyRequest, reply: FastifyReply) => {
    const signature = request.headers['x-callback-token'] as string | undefined
    const isValid = paymentService.verifyWebhookSignature(signature)
    if (!isValid) {
      return reply.code(401).send({ error: 'Invalid signature' })
    }

    const payload = request.body as Record<string, unknown>
    const service = new TransaksiService((request as any).server)
    await service.handleWebhook(payload)
    reply.send({ received: true })
  },
}
