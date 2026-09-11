import { z } from 'zod'

export const createAdminSchema = z.object({
  // TODO: Definisikan field schema sesuai domain
})

export const updateAdminSchema = createAdminSchema.partial()

export type CreateAdminInput = z.infer<typeof createAdminSchema>
export type UpdateAdminInput = z.infer<typeof updateAdminSchema>
