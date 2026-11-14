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
  private fastify: any

  constructor(fastify: any) {
    this.fastify = fastify
    this.service = new BookingService(fastify)
  }

  // ── Client & Umum ────────────────────────────────────────────────────────────

  checkSlotAvailability = async (
    request: FastifyRequest<{
      Querystring: {
        id?: string
        tanggal?: string
        waktu?: string
        tipe_jadwal?: string
        id_psikolog?: string
      }
    }>,
    reply: FastifyReply
  ) => {
    try {
      const data = await this.service.checkSlotAvailability(request.query)
      reply.send(data)
    } catch (err: any) {
      reply.code(400).send({ available: false, message: err.message })
    }
  }

  getAll = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.service.getAllBookings(request.query as Record<string, unknown>, (request as any).user)
    reply.send(data)
  }

  getById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const data = await this.service.getBookingById(request.params.id, (request as any).user)
      reply.send(data)
    } catch (err: any) {
      reply.code(err.statusCode || 400).send({ message: err.message })
    }
  }

  getMyBookings = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user
    const data = await this.service.getMyBookings(user)
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
      const statusCode = err.statusCode || (err.code === 'P2002' ? 409 : 400)
      const message =
        err.code === 'P2002'
          ? 'Slot jadwal ini sudah dibooking oleh klien lain. Silakan pilih jadwal lain.'
          : err.message
      reply.code(statusCode).send({ message })
    }
  }

  confirmPayment = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const data = await this.service.confirmPayment(request.params.id)
      reply.send(data)
    } catch (err: any) {
      reply.code(err.statusCode || 400).send({ message: err.message })
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
      const user = request.user as { id?: string; role?: string } | undefined
      await this.service.deleteJadwalSlot(request.params.id, user?.id, user?.role)
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
    const user = (request as any).user
    let query = { ...request.query }
    if (user?.role === 'BIRO') {
      const account = await (this.fastify as any).prisma.account.findUnique({
        where: { id: user.id },
        select: { id_biro: true, owned_biro: { select: { id: true } } },
      })
      const userBiroId = account?.owned_biro?.[0]?.id || account?.id_biro
      if (userBiroId) {
        query.id_biro = userBiroId
      }
    }
    const data = await this.service.getJadwalOverview(query)
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

  cancelBooking = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const data = await this.service.updateBookingStatus(request.params.id, 'CANCELLED')
      reply.send(data)
    } catch (err: any) {
      reply.code(400).send({ message: err.message })
    }
  }

  processRefund = async (
    request: FastifyRequest<{ Params: { id: string }; Body: { adminName?: string; alasan: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const data = await this.service.processRefund({
        bookingId: request.params.id,
        adminName: request.body.adminName || 'Admin',
        alasan: request.body.alasan,
      })
      reply.send(data)
    } catch (err: any) {
      reply.code(err.statusCode || 400).send({ message: err.message, details: err.details })
    }
  }

  cleanExpired = async (
    request: FastifyRequest<{ Querystring: { maxAgeMinutes?: number } }>,
    reply: FastifyReply
  ) => {
    try {
      const maxAge = request.query?.maxAgeMinutes ? Number(request.query.maxAgeMinutes) : 30
      const data = await this.service.cleanExpiredPendingBookings(maxAge)
      reply.send(data)
    } catch (err: any) {
      reply.code(400).send({ message: err.message })
    }
  }
}
