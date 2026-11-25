import type { FastifyRequest, FastifyReply } from 'fastify'
import { createWriteStream, mkdirSync, existsSync } from 'node:fs'
import { join, extname } from 'node:path'
import { env } from '../../config/env'
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

  uploadProposal = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = await request.file()
      if (!data) {
        return reply.code(400).send({
          success: false,
          message: 'Tidak ada file yang diunggah',
        })
      }

      const ALLOWED_MIME = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'image/webp',
      ]

      if (!ALLOWED_MIME.includes(data.mimetype)) {
        return reply.code(400).send({
          success: false,
          message: 'Format file tidak didukung. Harap unggah file PDF, Word (DOC/DOCX), atau Gambar.',
        })
      }

      const MAX_SIZE = 15 * 1024 * 1024 // 15MB
      let totalBytes = 0
      const chunks: Buffer[] = []

      for await (const chunk of data.file) {
        totalBytes += chunk.length
        if (totalBytes > MAX_SIZE) {
          return reply.code(413).send({
            success: false,
            message: 'Ukuran file terlalu besar. Maksimal 15MB.',
          })
        }
        chunks.push(chunk)
      }

      const dir = join(process.cwd(), 'public', 'uploads', 'proposals')
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }

      const originalName = data.filename || 'proposal.pdf'
      const ext = extname(originalName) || '.pdf'
      const cleanBaseName = originalName
        .replace(ext, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .slice(0, 40)
      const filename = `${Date.now()}_${cleanBaseName}${ext}`
      const filepath = join(dir, filename)

      const writeStream = createWriteStream(filepath)
      writeStream.write(Buffer.concat(chunks))
      writeStream.end()
      await new Promise<void>((resolve, reject) => {
        writeStream.on('finish', () => resolve())
        writeStream.on('error', (err) => reject(err))
      })

      const baseUrl = env.BASE_URL ?? `http://localhost:${env.PORT ?? 5000}`
      const url = `${baseUrl}/uploads/proposals/${filename}`

      return reply.code(200).send({
        success: true,
        message: 'Proposal berhasil diunggah',
        data: {
          url,
          filename,
          originalName,
          size: totalBytes,
        },
      })
    } catch (err: any) {
      request.log.error(err)
      return reply.code(500).send({
        success: false,
        message: 'Terjadi kesalahan saat mengunggah file proposal',
      })
    }
  }
}
