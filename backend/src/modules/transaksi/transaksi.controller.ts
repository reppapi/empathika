import type { FastifyRequest, FastifyReply } from 'fastify'
import { TransaksiService } from './transaksi.service'
import type { CreateTransaksiInput } from './transaksi.schema'

export class TransaksiController {
  private service: TransaksiService

  constructor(fastify: any) {
    this.service = new TransaksiService(fastify)
  }

  getAll = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = await this.service.getAll()
      reply.send({ success: true, data })
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

  createPayment = async (request: FastifyRequest<{ Body: CreateTransaksiInput }>, reply: FastifyReply) => {
    const user = request.user as { id: string }
    const result = await this.service.createPayment(request.body, user.id)
    reply.code(201).send(result)
  }
}
