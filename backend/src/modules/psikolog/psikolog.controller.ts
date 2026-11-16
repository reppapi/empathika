import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'
import { PsikologService } from './psikolog.service'
import type {
  GetJadwalTersediaQuery,
  GetJadwalPsikologMeQuery,
  CreateJadwalSlotInput,
  CreatePsikologInput,
  UpdatePsikologInput,
  UpdatePsikologProfileInput,
  RegisterPsikologBaruInput,
} from './psikolog.schema'

export class PsikologController {
  private service: PsikologService

  constructor(fastify: FastifyInstance) {
    this.service = new PsikologService(fastify)
  }

  /**
   * Endpoint Publik untuk Client (Tamu) melihat slot jam yang TERSEDIA
   */
  getJadwalTersedia = async (
    request: FastifyRequest<{ Querystring: GetJadwalTersediaQuery }>,
    reply: FastifyReply
  ) => {
    try {
      const data = await this.service.getJadwalTersedia(request.query)
      reply.send(data)
    } catch (err: any) {
      reply.code(400).send({ error: 'Bad Request', message: err.message })
    }
  }

  /**
   * Endpoint Psikolog: Melihat jadwal dan agenda sesi mingguan
   */
  getJadwalSaya = async (
    request: FastifyRequest<{ Querystring: GetJadwalPsikologMeQuery }>,
    reply: FastifyReply
  ) => {
    try {
      const user = request.user as { id: string } | undefined
      const data = await this.service.getJadwalSaya(user?.id, request.query)
      reply.send(data)
    } catch (err: any) {
      reply.code(400).send({ error: 'Bad Request', message: err.message })
    }
  }

  /**
   * Endpoint Psikolog: Membuka slot jam ketersediaan baru
   */
  createJadwalSlot = async (
    request: FastifyRequest<{ Body: CreateJadwalSlotInput }>,
    reply: FastifyReply
  ) => {
    try {
      const user = request.user as { id: string; role: string } | undefined
      const data = await this.service.createJadwalSlot(
        request.body,
        user?.role === 'PSIKOLOG' ? user.id : undefined
      )
      reply.code(201).send(data)
    } catch (err: any) {
      reply.code(400).send({ error: 'Bad Request', message: err.message })
    }
  }

  /**
   * Endpoint Psikolog: Menghapus slot jam ketersediaan
   */
  deleteJadwalSlot = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const user = request.user as { id: string; role: string } | undefined
      const data = await this.service.deleteJadwalSlot(
        request.params.id,
        user?.role === 'PSIKOLOG' ? user.id : undefined
      )
      reply.send(data)
    } catch (err: any) {
      reply.code(400).send({ error: 'Bad Request', message: err.message })
    }
  }

  /**
   * Endpoint Psikolog: Melihat profil sendiri
   */
  getMyProfile = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      const user = request.user as { id: string } | undefined
      const data = await this.service.getMyProfile(user?.id)
      reply.send(data)
    } catch (err: any) {
      reply.code(404).send({ error: 'Not Found', message: err.message })
    }
  }

  /**
   * Endpoint Psikolog: Mengubah profil sendiri
   */
  updateMyProfile = async (
    request: FastifyRequest<{ Body: UpdatePsikologProfileInput }>,
    reply: FastifyReply
  ) => {
    try {
      const user = request.user as { id: string } | undefined
      const data = await this.service.updateMyProfile(user?.id, request.body)
      reply.send(data)
    } catch (err: any) {
      reply.code(400).send({ error: 'Bad Request', message: err.message })
    }
  }

  getAll = async (
    request: FastifyRequest<{ Querystring: { kategori?: string; search?: string; status?: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const data = await this.service.getAll(request.query)
      reply.send(data)
    } catch (err: any) {
      reply.code(500).send({ error: 'Internal Server Error', message: err.message })
    }
  }

  getById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const data = await this.service.getById(request.params.id)
      reply.send(data)
    } catch (err: any) {
      reply.code(404).send({ error: 'Not Found', message: err.message })
    }
  }

  create = async (
    request: FastifyRequest<{ Body: CreatePsikologInput }>,
    reply: FastifyReply
  ) => {
    try {
      const data = await this.service.create(request.body)
      reply.code(201).send(data)
    } catch (err: any) {
      reply.code(400).send({ error: 'Bad Request', message: err.message })
    }
  }

  update = async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdatePsikologInput }>,
    reply: FastifyReply
  ) => {
    try {
      const data = await this.service.update(request.params.id, request.body)
      reply.send(data)
    } catch (err: any) {
      reply.code(400).send({ error: 'Bad Request', message: err.message })
    }
  }

  remove = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      await this.service.delete(request.params.id)
      reply.code(204).send()
    } catch (err: any) {
      reply.code(400).send({ error: 'Bad Request', message: err.message })
    }
  }

  registerPsikologBaru = async (
    request: FastifyRequest<{ Body: RegisterPsikologBaruInput }>,
    reply: FastifyReply
  ) => {
    try {
      const data = await this.service.registerPsikologBaru(request.body)
      reply.code(201).send(data)
    } catch (err: any) {
      reply.code(400).send({ error: 'Bad Request', message: err.message })
    }
  }
}
