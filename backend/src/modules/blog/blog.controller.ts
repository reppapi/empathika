import type { FastifyRequest, FastifyReply } from 'fastify'
import { BlogService } from './blog.service'
import type { CreateBlogInput, UpdateBlogInput, BlogQueryInput } from './blog.schema'

export class BlogController {
  private service: BlogService

  constructor(fastify: any) {
    this.service = new BlogService(fastify)
  }

  getAll = async (
    request: FastifyRequest<{ Querystring: BlogQueryInput }>,
    reply: FastifyReply
  ) => {
    const data = await this.service.getAll(request.query)
    reply.send(data)
  }

  getById = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    const data = await this.service.getByIdOrSlug(request.params.id)
    reply.send(data)
  }

  create = async (
    request: FastifyRequest<{ Body: CreateBlogInput }>,
    reply: FastifyReply
  ) => {
    const data = await this.service.create(request.body)
    reply.code(201).send(data)
  }

  update = async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateBlogInput }>,
    reply: FastifyReply
  ) => {
    const data = await this.service.update(request.params.id, request.body)
    reply.send(data)
  }

  remove = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    await this.service.delete(request.params.id)
    reply.code(204).send()
  }
}
