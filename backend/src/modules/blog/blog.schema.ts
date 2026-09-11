import { z } from 'zod'

export const createBlogSchema = z.object({
  // TODO: Definisikan field schema sesuai domain
})

export const updateBlogSchema = createBlogSchema.partial()

export type CreateBlogInput = z.infer<typeof createBlogSchema>
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>
