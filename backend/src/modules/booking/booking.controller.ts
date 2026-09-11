import type { FastifyRequest, FastifyReply } from 'fastify'
import { BookingService } from './booking.service'

export class BookingController {
  private service: BookingService

  constructor(fastify: any) {
    this.service = new BookingService(fastify)
  }

  getAll = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.service.getAll(request.query as Record<string, unknown>)
    reply.send(data)
  }

  getById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const data = await this.service.getById(request.params.id)
    reply.send(data)
  }

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.service.create(request.body)
    reply.code(201).send(data)
  }

  update = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const data = await this.service.update(request.params.id, request.body)
    reply.send(data)
  }

  remove = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    await this.service.delete(request.params.id)
    reply.code(204).send()
  }
}
