import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'
import { PsikotesService } from './psikotes.service'
import type { CreatePsikotesInput, UpdatePsikotesInput, PsikotesQueryInput } from './psikotes.schema'

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
}
