import { z } from 'zod'

export const createEventSchema = z.object({
  // TODO: Definisikan field schema sesuai domain
})

export const updateEventSchema = createEventSchema.partial()

export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
