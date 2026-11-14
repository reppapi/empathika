import type { FastifyRequest, FastifyReply } from 'fastify'
import { TransaksiService } from './transaksi.service'
import type {
  CreateTransaksiInput,
  CreateCheckoutTransaksiInput,
  AdminTransaksiQueryInput,
} from './transaksi.schema'

export class TransaksiController {
  private service: TransaksiService

  constructor(fastify: any) {
    this.service = new TransaksiService(fastify)
  }

  getAll = async (
    request: FastifyRequest<{ Querystring: AdminTransaksiQueryInput }>,
    reply: FastifyReply
  ) => {
    try {
      const result = await this.service.getAll(request.query)
      reply.send({
        success: true,
        data: result.data,
        pagination: result.pagination,
      })
    } catch (err: any) {
      reply.code(500).send({ error: 'Internal Server Error', message: err.message })
    }
  }

  getMyTransaksi = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: string }
    const data = await this.service.getMyTransaksi(user.id)
    reply.send(data)
  }

  getById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const data = await this.service.getById(request.params.id)
      reply.send({ success: true, data })
    } catch (err: any) {
      reply.code(err.statusCode || 400).send({ error: err.name || 'Error', message: err.message })
    }
  }

  processRefund = async (
    request: FastifyRequest<{ Params: { id: string }; Body: { alasan: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const user = request.user as { id?: string; name?: string; role?: string; email?: string }
      const adminName = user?.name || user?.email || 'Admin Empathika'
      const { alasan } = request.body

      const result = await this.service.processRefund({
        transaksiId: request.params.id,
        adminName,
        alasan,
      })
      reply.send(result)
    } catch (err: any) {
      const statusCode = err.statusCode || 400
      reply.code(statusCode).send({
        error: statusCode === 409 ? 'Conflict' : statusCode === 422 ? 'Unprocessable Entity' : statusCode === 404 ? 'Not Found' : 'Bad Request',
        message: err.message,
        details: err.details,
      })
    }
  }

  /**
   * Endpoint Universal Checkout (Konseling, Event, Psikotes) -> Generate Xendit Invoice
   */
  checkout = async (
    request: FastifyRequest<{ Body: CreateCheckoutTransaksiInput }>,
    reply: FastifyReply
  ) => {
    try {
      const user = request.user as { id?: string } | undefined
      const result = await this.service.createUniversalCheckout(request.body, user?.id)
      reply.code(201).send({
        success: true,
        message: 'Berhasil membuat pesanan transaksi dan tautan pembayaran Xendit',
        data: result,
      })
    } catch (err: any) {
      reply.code(err.statusCode || 400).send({
        error: err.name || 'Bad Request',
        message: err.message || 'Gagal memproses transaksi checkout',
        details: err.details,
      })
    }
  }

  confirmSimulation = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const result = await this.service.confirmSimulation(request.params.id)
      reply.send({
        success: true,
        message: 'Pembayaran simulasi berhasil diverifikasi dan status transaksi diperbarui',
        data: result,
      })
    } catch (err: any) {
      reply.code(err.statusCode || 400).send({
        error: err.name || 'Bad Request',
        message: err.message || 'Gagal memverifikasi simulasi pembayaran',
      })
    }
  }

  createPayment = async (request: FastifyRequest<{ Body: CreateTransaksiInput }>, reply: FastifyReply) => {
    try {
      const user = request.user as { id: string }
      const result = await this.service.createPayment(request.body, user.id)
      reply.code(201).send(result)
    } catch (err: any) {
      reply.code(err.statusCode || 400).send({
        error: err.name || 'Bad Request',
        message: err.message || 'Gagal inisiasi pembayaran',
      })
    }
  }
}
