import type { FastifyInstance } from 'fastify'
import { BlogController } from './blog.controller'
import { authGuard } from '../../middlewares/auth-guard'
import {
  blogIdParamSchema,
  blogQuerySchema,
  createBlogSchema,
  updateBlogSchema,
  blogListResponseSchema,
  blogDetailResponseSchema,
  blogMutationResponseSchema,
} from './blog.schema'

export default async function blogRoutes(fastify: FastifyInstance) {
  const controller = new BlogController(fastify)

  // 1. Public: Ambil semua artikel blog (Search & Pagination)
  fastify.get('/', {
    schema: {
      tags: ['Blog'],
      summary: 'Mendapatkan daftar artikel blog (Publik)',
      querystring: blogQuerySchema,
      response: {
        200: blogListResponseSchema,
      },
    },
    handler: controller.getAll,
  })

  // 2. Public: Ambil detail artikel blog berdasarkan ID
  fastify.get('/:id', {
    schema: {
      tags: ['Blog'],
      summary: 'Mendapatkan detail artikel blog berdasarkan ID (Publik)',
      params: blogIdParamSchema,
      response: {
        200: blogDetailResponseSchema,
      },
    },
    handler: controller.getById,
  })

  // 3. Protected (Wajib Login Admin/Biro/Psikolog): Tambah artikel baru
  fastify.post('/', {
    preHandler: [authGuard],
    schema: {
      tags: ['Blog'],
      summary: 'Membuat artikel blog baru (Wajib Login)',
      security: [{ bearerAuth: [] }],
      body: createBlogSchema,
      response: {
        201: blogMutationResponseSchema,
      },
    },
    handler: controller.create,
  })

  // 4. Protected (Wajib Login Admin/Biro/Psikolog): Update artikel
  fastify.put('/:id', {
    preHandler: [authGuard],
    schema: {
      tags: ['Blog'],
      summary: 'Memperbarui artikel blog (Wajib Login)',
      security: [{ bearerAuth: [] }],
      params: blogIdParamSchema,
      body: updateBlogSchema,
      response: {
        200: blogMutationResponseSchema,
      },
    },
    handler: controller.update,
  })

  // 5. Protected (Wajib Login Admin/Biro/Psikolog): Hapus artikel
  fastify.delete('/:id', {
    preHandler: [authGuard],
    schema: {
      tags: ['Blog'],
      summary: 'Menghapus artikel blog (Wajib Login)',
      security: [{ bearerAuth: [] }],
      params: blogIdParamSchema,
    },
    handler: controller.remove,
  })
}
