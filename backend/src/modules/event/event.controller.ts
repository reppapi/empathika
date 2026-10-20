import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'
import { EventService } from './event.service'
import type {
  CreateEventInput,
  UpdateEventInput,
  EventQueryInput,
  EventIdParamInput,
} from './event.schema'

export class EventController {
  private service: EventService

  constructor(fastify: FastifyInstance) {
    this.service = new EventService(fastify)
  }

  getAll = async (
    request: FastifyRequest<{ Querystring: EventQueryInput }>,
    reply: FastifyReply
  ) => {
    const result = await this.service.getAll(request.query)
    return reply.code(200).send({
      success: true,
      message: 'Berhasil mengambil daftar event',
      data: result.items,
      meta: result.meta,
    })
  }

  getById = async (
    request: FastifyRequest<{ Params: EventIdParamInput }>,
    reply: FastifyReply
  ) => {
    const data = await this.service.getById(request.params.id)
    return reply.code(200).send({
      success: true,
      message: 'Berhasil mengambil detail event',
      data,
    })
  }

  create = async (
    request: FastifyRequest<{ Body: CreateEventInput }>,
    reply: FastifyReply
  ) => {
    const data = await this.service.create(request.body)
    return reply.code(201).send({
      success: true,
      message: 'Berhasil membuat event baru',
      data,
    })
  }

  update = async (
    request: FastifyRequest<{ Params: EventIdParamInput; Body: UpdateEventInput }>,
    reply: FastifyReply
  ) => {
    const data = await this.service.update(request.params.id, request.body)
    return reply.code(200).send({
      success: true,
      message: 'Berhasil memperbarui event',
      data,
    })
  }

  remove = async (
    request: FastifyRequest<{ Params: EventIdParamInput }>,
    reply: FastifyReply
  ) => {
    await this.service.delete(request.params.id)
    return reply.code(200).send({
      success: true,
      message: 'Berhasil menghapus event',
      data: null,
    })
  }
}
