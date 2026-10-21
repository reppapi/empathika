import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'
import { AdminService } from './admin.service'
import type {
  GetAdminJadwalQuery,
  CreateAdminJadwalSlotInput,
  CreateAdminSesiInput,
  UpdateBookingStatusInput,
  UpdateAdminProfileInput,
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

  // ── Profil Admin Utama ──────────────────────────────────────────
  getProfile = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as { id: string; role: string }
      const data = await this.service.getProfile(user?.id)
      reply.send({ success: true, data })
    } catch (err: any) {
      reply.code(err.statusCode || 400).send({ error: err.name || 'Error', message: err.message })
    }
  }

  updateProfile = async (
    request: FastifyRequest<{ Body: UpdateAdminProfileInput }>,
    reply: FastifyReply
  ) => {
    try {
      const user = request.user as { id: string; role: string }
      if (user?.role !== 'ADMIN') {
        return reply.code(403).send({ error: 'Forbidden', message: 'Hanya Admin Utama yang berwenang mengubah profil' })
      }
      const data = await this.service.updateProfile(user.id, request.body)
      reply.send({ success: true, message: 'Profil Admin Utama berhasil diperbarui', data })
    } catch (err: any) {
      reply.code(err.statusCode || 400).send({ error: err.name || 'Error', message: err.message })
    }
  }

  getPublicProfile = async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = await this.service.getPublicProfile()
      reply.send({ success: true, data })
    } catch (err: any) {
      reply.code(err.statusCode || 400).send({ error: err.name || 'Error', message: err.message })
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

