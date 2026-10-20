import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'
import { BlogService } from './blog.service'
import type {
  CreateBlogInput,
  UpdateBlogInput,
  BlogQueryInput,
  BlogIdParamInput,
} from './blog.schema'

export class BlogController {
  private service: BlogService

  constructor(fastify: FastifyInstance) {
    this.service = new BlogService(fastify)
  }

  getAll = async (
    request: FastifyRequest<{ Querystring: BlogQueryInput }>,
    reply: FastifyReply
  ) => {
    const result = await this.service.getAll(request.query)
    return reply.code(200).send({
      success: true,
      message: 'Berhasil mengambil daftar artikel blog',
      data: result.items,
      meta: result.meta,
    })
  }

  getById = async (
    request: FastifyRequest<{ Params: BlogIdParamInput }>,
    reply: FastifyReply
  ) => {
    const data = await this.service.getById(request.params.id)
    return reply.code(200).send({
      success: true,
      message: 'Berhasil mengambil detail artikel blog',
      data,
    })
  }

  create = async (
    request: FastifyRequest<{ Body: CreateBlogInput }>,
    reply: FastifyReply
  ) => {
    const data = await this.service.create(request.body)
    return reply.code(201).send({
      success: true,
      message: 'Berhasil membuat artikel blog baru',
      data,
    })
  }

  update = async (
    request: FastifyRequest<{ Params: BlogIdParamInput; Body: UpdateBlogInput }>,
    reply: FastifyReply
  ) => {
    const data = await this.service.update(request.params.id, request.body)
    return reply.code(200).send({
      success: true,
      message: 'Berhasil memperbarui artikel blog',
      data,
    })
  }

  remove = async (
    request: FastifyRequest<{ Params: BlogIdParamInput }>,
    reply: FastifyReply
  ) => {
    await this.service.delete(request.params.id)
    return reply.code(200).send({
      success: true,
      message: 'Berhasil menghapus artikel blog',
      data: null,
    })
  }
}
