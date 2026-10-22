import type { FastifyRequest, FastifyReply } from 'fastify'
import { BookingService } from './booking.service'
import type {
  GetAdminJadwalQuery,
  CreateAdminJadwalSlotInput,
  CreateAdminSesiInput,
  UpdateBookingStatusInput,
  GetJadwalTersediaQuery,
  CreateJadwalSlotInput,
  CreateClientBookingInput,
} from './booking.schema'

export class BookingController {
  private service: BookingService

  constructor(fastify: any) {
    this.service = new BookingService(fastify)
  }

  // ── Client & Umum ────────────────────────────────────────────────────────────

  getAll = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.service.getAllBookings(request.query as Record<string, unknown>)
    reply.send(data)
  }

  getById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const data = await this.service.getBookingById(request.params.id)
    reply.send(data)
  }

  create = async (
    request: FastifyRequest<{ Body: CreateClientBookingInput }>,
    reply: FastifyReply
  ) => {
    try {
      const data = await this.service.createClientBooking(request.body)
      reply.code(201).send(data)
    } catch (err: any) {
      reply.code(400).send({ message: err.message })
    }
  }

  getJadwalTersedia = async (
    request: FastifyRequest<{ Querystring: GetJadwalTersediaQuery }>,
    reply: FastifyReply
  ) => {
    const data = await this.service.getJadwalTersedia(request.query)
    reply.send(data)
  }

  // ── Portal Psikolog ──────────────────────────────────────────────────────────

  getJadwalSaya = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user
    const data = await this.service.getJadwalSaya(user?.id, request.query as any)
    reply.send(data)
  }

  createJadwalSlot = async (
    request: FastifyRequest<{ Body: CreateJadwalSlotInput }>,
    reply: FastifyReply
  ) => {
    try {
      const user = (request as any).user
      const data = await this.service.createPsikologJadwalSlot(request.body, user?.id)
      reply.code(201).send(data)
    } catch (err: any) {
      reply.code(400).send({ message: err.message })
    }
  }

  deleteJadwalSlot = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    try {
      await this.service.deleteJadwalSlot(request.params.id)
      reply.code(204).send()
    } catch (err: any) {
      reply.code(400).send({ message: err.message })
    }
  }

  // ── Admin ────────────────────────────────────────────────────────────────────

  getAdminOverview = async (
    request: FastifyRequest<{ Querystring: GetAdminJadwalQuery }>,
    reply: FastifyReply
  ) => {
    const data = await this.service.getJadwalOverview(request.query)
    reply.send(data)
  }

  createAdminSlot = async (
    request: FastifyRequest<{ Body: CreateAdminJadwalSlotInput }>,
    reply: FastifyReply
  ) => {
    try {
      const data = await this.service.createAdminJadwalSlot(request.body)
      reply.code(201).send(data)
    } catch (err: any) {
      reply.code(400).send({ message: err.message })
    }
  }

  createAdminSesi = async (
    request: FastifyRequest<{ Body: CreateAdminSesiInput }>,
    reply: FastifyReply
  ) => {
    try {
      const data = await this.service.createAdminSesi(request.body)
      reply.code(201).send(data)
    } catch (err: any) {
      reply.code(400).send({ message: err.message })
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
      reply.code(400).send({ message: err.message })
    }
  }
}
