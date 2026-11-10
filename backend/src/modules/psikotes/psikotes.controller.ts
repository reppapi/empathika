import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'
import { PsikotesService } from './psikotes.service'
import type {
  CreatePsikotesInput,
  UpdatePsikotesInput,
  PsikotesQueryInput,
  SubmitPsikotesInput,
  PesertaQueryInput,
  CreateBookingPsikotesInput,
  VerifyTicketInput,
} from './psikotes.schema'

export class PsikotesController {
  private service: PsikotesService

  constructor(fastify: FastifyInstance) {
    this.service = new PsikotesService(fastify)
  }

  getAll = async (
    request: FastifyRequest<{ Querystring: PsikotesQueryInput }>,
    reply: FastifyReply
  ) => {
    const data = await this.service.getAll(request.query)
    return reply.code(200).send({
      success: true,
      message: 'Berhasil mengambil daftar paket psikotes',
      data,
    })
  }

  getById = async (
    request: FastifyRequest<{ Params: { id: string }; Querystring: { allowDraft?: string | boolean } }>,
    reply: FastifyReply
  ) => {
    const allowDraft = request.query?.allowDraft === 'true' || request.query?.allowDraft === true
    const data = await this.service.getById(request.params.id, allowDraft)
    return reply.code(200).send({
      success: true,
      message: 'Berhasil mengambil detail paket psikotes',
      data,
    })
  }

  create = async (
    request: FastifyRequest<{ Body: CreatePsikotesInput }>,
    reply: FastifyReply
  ) => {
    const data = await this.service.create(request.body)
    return reply.code(201).send({
      success: true,
      message: 'Berhasil menyimpan paket psikotes ke database',
      data,
    })
  }

  update = async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdatePsikotesInput }>,
    reply: FastifyReply
  ) => {
    const data = await this.service.update(request.params.id, request.body)
    return reply.code(200).send({
      success: true,
      message: 'Berhasil memperbarui paket psikotes',
      data,
    })
  }

  remove = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    await this.service.delete(request.params.id)
    return reply.code(200).send({
      success: true,
      message: 'Berhasil menghapus paket psikotes',
    })
  }

  submit = async (
    request: FastifyRequest<{ Params: { id: string }; Body: SubmitPsikotesInput }>,
    reply: FastifyReply
  ) => {
    const data = await this.service.submit(request.params.id, request.body)
    return reply.code(201).send({
      success: true,
      message: 'Berhasil mengirimkan jawaban psikotes dan menghitung hasil asesmen',
      data,
    })
  }

  getPeserta = async (
    request: FastifyRequest<{ Querystring: PesertaQueryInput }>,
    reply: FastifyReply
  ) => {
    const data = await this.service.getPeserta(request.query)
    return reply.code(200).send({
      success: true,
      message: 'Berhasil mengambil daftar peserta psikotes',
      data,
    })
  }

  createBooking = async (
    request: FastifyRequest<{ Body: CreateBookingPsikotesInput }>,
    reply: FastifyReply
  ) => {
    try {
      const data = await this.service.createBooking(request.body)
      return reply.code(201).send({
        success: true,
        message: 'Berhasil mencatat transaksi dan booking paket psikotes berbayar',
        data,
      })
    } catch (err: any) {
      const statusCode = err.statusCode || (err.code === 'P2002' ? 409 : 400)
      return reply.code(statusCode).send({
        success: false,
        message: err.message || 'Gagal memproses booking paket psikotes',
      })
    }
  }

  verifyTicket = async (
    request: FastifyRequest<{ Body: VerifyTicketInput }>,
    reply: FastifyReply
  ) => {
    try {
      const data = await this.service.verifyTicket(request.body)
      return reply.code(200).send({
        success: true,
        message: 'Kode akses berhasil diverifikasi',
        data,
      })
    } catch (err: any) {
      const statusCode = err.statusCode || 400
      return reply.code(statusCode).send({
        success: false,
        message: err.message || 'Gagal memverifikasi kode tiket',
      })
    }
  }

  getHasilByBooking = async (
    request: FastifyRequest<{ Params: { bookingId: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const data = await this.service.getHasilByBooking(request.params.bookingId)
      return reply.code(200).send({
        success: true,
        message: 'Berhasil mengambil data laporan hasil asesmen resmi',
        data,
      })
    } catch (err: any) {
      const statusCode = err.statusCode || 404
      return reply.code(statusCode).send({
        success: false,
        message: err.message || 'Data hasil tes tidak ditemukan',
      })
    }
  }

  cleanupAnonymousGuests = async (
    request: FastifyRequest<{ Querystring: { days?: string | number } }>,
    reply: FastifyReply
  ) => {
    const days = request.query?.days ? Number(request.query.days) : 60
    const result = await this.service.cleanupOldAnonymousGuests(days)
    return reply.code(200).send({
      success: true,
      message: result.message,
      data: result,
    })
  }
}


