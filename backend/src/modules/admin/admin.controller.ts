import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'
import { AdminService } from './admin.service'
import type {
  GetAdminJadwalQuery,
  CreateAdminJadwalSlotInput,
  CreateAdminSesiInput,
  UpdateBookingStatusInput,
} from './admin.schema'

export class AdminController {
  private service: AdminService

  constructor(fastify: FastifyInstance) {
    this.service = new AdminService(fastify)
  }

  getJadwal = async (
    request: FastifyRequest<{ Querystring: GetAdminJadwalQuery }>,
    reply: FastifyReply
  ) => {
    try {
      const data = await this.service.getJadwalOverview(request.query)
      reply.send(data)
    } catch (err: any) {
      reply.code(400).send({ error: 'Bad Request', message: err.message })
    }
  }

  createJadwalSlot = async (
    request: FastifyRequest<{ Body: CreateAdminJadwalSlotInput }>,
    reply: FastifyReply
  ) => {
    try {
      const data = await this.service.createJadwalSlot(request.body)
      reply.code(201).send(data)
    } catch (err: any) {
      reply.code(400).send({ error: 'Bad Request', message: err.message })
    }
  }

  createSesi = async (
    request: FastifyRequest<{ Body: CreateAdminSesiInput }>,
    reply: FastifyReply
  ) => {
    try {
      const data = await this.service.createAdminSesi(request.body)
      reply.code(201).send(data)
    } catch (err: any) {
      reply.code(400).send({ error: 'Bad Request', message: err.message })
    }
  }

  updateBookingStatus = async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateBookingStatusInput }>,
    reply: FastifyReply
  ) => {
    try {
      const data = await this.service.updateBookingStatus(request.params.id, request.body.status)
      reply.send(data)
    } catch (err: any) {
      reply.code(400).send({ error: 'Bad Request', message: err.message })
    }
  }

  getAll = async (_request: FastifyRequest, reply: FastifyReply) => {
    reply.send([])
  }

  getById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    reply.send({ id: request.params.id })
  }

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    reply.code(201).send(request.body)
  }

  update = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    reply.send({ id: request.params.id })
  }

  remove = async (_request: FastifyRequest, reply: FastifyReply) => {
    reply.code(204).send()
  }
}
