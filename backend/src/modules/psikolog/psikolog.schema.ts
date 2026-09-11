import { z } from 'zod'

export const createPsikologSchema = z.object({
  // TODO: Definisikan field schema sesuai domain
})

export const updatePsikologSchema = createPsikologSchema.partial()

export type CreatePsikologInput = z.infer<typeof createPsikologSchema>
export type UpdatePsikologInput = z.infer<typeof updatePsikologSchema>
