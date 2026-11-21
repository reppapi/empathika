import type { FastifyRequest, FastifyReply } from 'fastify'
import { paymentService } from './payment.service'
import { TransaksiService } from '../transaksi.service'

export class WebhookController {
  private transaksiService: TransaksiService

  constructor(fastify: any) {
    this.transaksiService = new TransaksiService(fastify)
  }

  handle = async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.body as Record<string, any>

    // Guard: body wajib ada
    if (!payload || typeof payload !== 'object') {
      return reply.code(400).send({ error: 'Bad Request', message: 'Payload webhook tidak valid atau kosong' })
    }

    // Dukung Midtrans (order_id) atau Xendit (id/external_id) untuk backward-compatibility
    const isMidtrans = Boolean(payload.order_id && payload.transaction_status)
    const isXendit = Boolean(payload.id && payload.status)

    if (!isMidtrans && !isXendit) {
      return reply.code(400).send({ error: 'Bad Request', message: 'Format payload webhook tidak dikenali' })
    }

    // Verifikasi Keamanan Signature
    if (isMidtrans) {
      const isValid = paymentService.verifyWebhookSignature(payload)
      if (!isValid) {
        request.log.warn({ order_id: payload.order_id }, '[Midtrans Webhook] Signature hash tidak valid')
        return reply.code(401).send({ error: 'Unauthorized', message: 'Invalid Midtrans signature' })
      }
    } else if (isXendit) {
      const callbackToken = request.headers['x-callback-token'] as string | undefined
      // Jika masih ada sisa webhook xendit
      if (callbackToken && process.env.XENDIT_WEBHOOK_TOKEN && callbackToken !== process.env.XENDIT_WEBHOOK_TOKEN) {
        return reply.code(401).send({ error: 'Unauthorized', message: 'Invalid Xendit callback token' })
      }
    }

    try {
      await this.transaksiService.handleWebhook(payload)
      return reply.code(200).send({ received: true, message: 'Webhook pembayaran berhasil diproses' })
    } catch (err: any) {
      request.log.error(err, '[Payment Webhook] Error memproses webhook callback')
      return reply.code(500).send({ error: 'Internal Server Error', message: err.message })
    }
  }
}

// Handler object untuk backward compatibility
export const webhookController = {
  handle: async (request: FastifyRequest, reply: FastifyReply) => {
    const ctrl = new WebhookController((request as any).server)
    return ctrl.handle(request, reply)
  },
}
