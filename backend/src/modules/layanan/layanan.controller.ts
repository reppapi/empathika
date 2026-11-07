import type { FastifyRequest, FastifyReply } from 'fastify'
import { LayananService } from './layanan.service'
import { createLayananSchema, updateLayananSchema } from './layanan.schema'

export class LayananController {
  private service: LayananService

  constructor(fastify: any) {
    this.service = new LayananService(fastify)
  }

  getAll = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = await this.service.getAll(request.query as Record<string, unknown>)
      reply.send({
        success: true,
        data,
      })
    } catch (err: any) {
      reply.status(err.statusCode || 500).send({
        success: false,
        message: err.message || 'Gagal mengambil data layanan',
      })
    }
  }

  getById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const data = await this.service.getById(request.params.id)
      reply.send({
        success: true,
        data,
      })
    } catch (err: any) {
      reply.status(err.statusCode || 404).send({
        success: false,
        message: err.message || 'Layanan tidak ditemukan',
      })
    }
  }

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const validated = createLayananSchema.parse(request.body)
      const data = await this.service.create(validated)
      reply.code(201).send({
        success: true,
        message: 'Layanan berhasil dibuat',
        data,
      })
    } catch (err: any) {
      reply.status(err.statusCode || 400).send({
        success: false,
        message: err.message || 'Gagal menambahkan layanan',
      })
    }
  }

  update = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const validated = updateLayananSchema.parse(request.body)
      const data = await this.service.update(request.params.id, validated)
      reply.send({
        success: true,
        message: 'Layanan berhasil diperbarui',
        data,
      })
    } catch (err: any) {
      reply.status(err.statusCode || 400).send({
        success: false,
        message: err.message || 'Gagal memperbarui layanan',
      })
    }
  }

  remove = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      await this.service.delete(request.params.id)
      reply.send({
        success: true,
        message: 'Layanan berhasil dihapus',
      })
    } catch (err: any) {
      reply.status(err.statusCode || 400).send({
        success: false,
        message: err.message || 'Gagal menghapus layanan',
      })
    }
  }
}
