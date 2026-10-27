import type { FastifyRequest, FastifyReply } from 'fastify'
import { KerjaSamaService } from './kerja-sama.service'
import type {
  CreatePengajuanInput,
  GetPengajuanQuery,
  UpdatePengajuanStatusInput,
  CreateProgramInput,
  UpdateProgramInput,
  UpdateFormulirInput,
} from './kerja-sama.schema'

export class KerjaSamaController {
  private service: KerjaSamaService

  constructor(fastify: any) {
    this.service = new KerjaSamaService(fastify)
  }

  // ── 1. Pengajuan Kerja Sama (Leads) ─────────────────────────────────────────

  createPengajuan = async (
    request: FastifyRequest<{ Body: CreatePengajuanInput }>,
    reply: FastifyReply
  ) => {
    try {
      const result = await this.service.createPengajuan(request.body)
      reply.code(201).send(result)
    } catch (err: any) {
      reply.code(err.statusCode || 400).send({ success: false, message: err.message })
    }
  }

  getPengajuanList = async (
    request: FastifyRequest<{ Querystring: GetPengajuanQuery }>,
    reply: FastifyReply
  ) => {
    try {
      const result = await this.service.getPengajuanList(request.query)
      reply.send(result)
    } catch (err: any) {
      reply.code(err.statusCode || 500).send({ success: false, message: err.message })
    }
  }

  getPengajuanById = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const result = await this.service.getPengajuanById(request.params.id)
      reply.send(result)
    } catch (err: any) {
      reply.code(err.statusCode || 404).send({ success: false, message: err.message })
    }
  }

  updatePengajuanStatus = async (
    request: FastifyRequest<{
      Params: { id: string }
      Body: UpdatePengajuanStatusInput
    }>,
    reply: FastifyReply
  ) => {
    try {
      const result = await this.service.updatePengajuanStatus(request.params.id, request.body)
      reply.send(result)
    } catch (err: any) {
      reply.code(err.statusCode || 400).send({ success: false, message: err.message })
    }
  }

  deletePengajuan = async (
    request: FastifyRequest<{
      Params: { id: string }
      Querystring: { hard?: boolean | string }
    }>,
    reply: FastifyReply
  ) => {
    try {
      const isHard = String(request.query?.hard) === 'true' || request.query?.hard === true
      const result = await this.service.deletePengajuan(request.params.id, isHard)
      reply.send(result)
    } catch (err: any) {
      reply.code(err.statusCode || 400).send({ success: false, message: err.message })
    }
  }

  restorePengajuan = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const result = await this.service.restorePengajuan(request.params.id)
      reply.send(result)
    } catch (err: any) {
      reply.code(err.statusCode || 400).send({ success: false, message: err.message })
    }
  }

  // ── 2. Program Kerja Sama ───────────────────────────────────────────────────

  getAllPrograms = async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await this.service.getAllPrograms()
      reply.send(result)
    } catch (err: any) {
      reply.code(err.statusCode || 500).send({ success: false, message: err.message })
    }
  }

  getProgramByIdOrSlug = async (
    request: FastifyRequest<{ Params: { idOrSlug: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const result = await this.service.getProgramByIdOrSlug(request.params.idOrSlug)
      reply.send(result)
    } catch (err: any) {
      reply.code(err.statusCode || 404).send({ success: false, message: err.message })
    }
  }

  createProgram = async (
    request: FastifyRequest<{ Body: CreateProgramInput }>,
    reply: FastifyReply
  ) => {
    try {
      const result = await this.service.createProgram(request.body)
      reply.code(201).send(result)
    } catch (err: any) {
      reply.code(err.statusCode || 400).send({ success: false, message: err.message })
    }
  }

  updateProgram = async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateProgramInput }>,
    reply: FastifyReply
  ) => {
    try {
      const result = await this.service.updateProgram(request.params.id, request.body)
      reply.send(result)
    } catch (err: any) {
      reply.code(err.statusCode || 400).send({ success: false, message: err.message })
    }
  }

  deleteProgram = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const result = await this.service.deleteProgram(request.params.id)
      reply.send(result)
    } catch (err: any) {
      reply.code(err.statusCode || 400).send({ success: false, message: err.message })
    }
  }

  // ── 3. Formulir Kerja Sama ──────────────────────────────────────────────────

  getAllFormulir = async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await this.service.getAllFormulir()
      reply.send(result)
    } catch (err: any) {
      reply.code(err.statusCode || 500).send({ success: false, message: err.message })
    }
  }

  getFormulirBySlug = async (
    request: FastifyRequest<{ Params: { slug: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const result = await this.service.getFormulirBySlug(request.params.slug)
      reply.send(result)
    } catch (err: any) {
      reply.code(err.statusCode || 404).send({ success: false, message: err.message })
    }
  }

  updateFormulir = async (
    request: FastifyRequest<{ Params: { slug: string }; Body: UpdateFormulirInput }>,
    reply: FastifyReply
  ) => {
    try {
      const result = await this.service.updateFormulir(request.params.slug, request.body)
      reply.send(result)
    } catch (err: any) {
      reply.code(err.statusCode || 400).send({ success: false, message: err.message })
    }
  }
}
