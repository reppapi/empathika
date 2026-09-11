import { z } from 'zod'

export const createLayananSchema = z.object({
  // TODO: Definisikan field schema sesuai domain
})

export const updateLayananSchema = createLayananSchema.partial()

export type CreateLayananInput = z.infer<typeof createLayananSchema>
export type UpdateLayananInput = z.infer<typeof updateLayananSchema>
