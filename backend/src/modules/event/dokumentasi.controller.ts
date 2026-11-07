import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { DokumentasiService } from './dokumentasi.service'
import type {
  CreateDokumentasiInput,
  UpdateDokumentasiInput,
  DokumentasiQueryInput,
} from './dokumentasi.schema'

export class DokumentasiController {
  private service: DokumentasiService

  constructor(fastify: FastifyInstance) {
    this.service = new DokumentasiService(fastify)
  }

  getAll = async (
    request: FastifyRequest<{ Querystring: DokumentasiQueryInput }>,
    reply: FastifyReply
  ) => {
    const result = await this.service.getAll(request.query)
    return reply.code(200).send({
      success: true,
      ...result,
    })
  }

  getById = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    const data = await this.service.getById(request.params.id)
    return reply.code(200).send({
      success: true,
      data,
    })
  }

  create = async (
    request: FastifyRequest<{ Body: CreateDokumentasiInput }>,
    reply: FastifyReply
  ) => {
    const data = await this.service.create(request.body)
    return reply.code(201).send({
      success: true,
      message: 'Dokumentasi event berhasil dibuat',
      data,
    })
  }

  update = async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateDokumentasiInput }>,
    reply: FastifyReply
  ) => {
    const data = await this.service.update(request.params.id, request.body)
    return reply.code(200).send({
      success: true,
      message: 'Dokumentasi event berhasil diperbarui',
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
      message: 'Dokumentasi event berhasil dihapus',
    })
  }
}

