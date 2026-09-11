import { z } from 'zod'

export const createPsikotesSchema = z.object({
  // TODO: Definisikan field schema sesuai domain
})

export const updatePsikotesSchema = createPsikotesSchema.partial()

export type CreatePsikotesInput = z.infer<typeof createPsikotesSchema>
export type UpdatePsikotesInput = z.infer<typeof updatePsikotesSchema>
