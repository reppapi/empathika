import type { FastifyRequest, FastifyReply } from 'fastify'
import { TransaksiService } from './transaksi.service'
import type { CreateTransaksiInput } from './transaksi.schema'

export class TransaksiController {
  private service: TransaksiService

  constructor(fastify: any) {
    this.service = new TransaksiService(fastify)
  }

  getMyTransaksi = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: string }
    const data = await this.service.getMyTransaksi(user.id)
    reply.send(data)
  }

  getById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const data = await this.service.getById(request.params.id)
    reply.send(data)
  }

  createPayment = async (request: FastifyRequest<{ Body: CreateTransaksiInput }>, reply: FastifyReply) => {
    const user = request.user as { id: string }
    const result = await this.service.createPayment(request.body, user.id)
    reply.code(201).send(result)
  }
}
