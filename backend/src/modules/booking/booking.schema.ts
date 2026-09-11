import { z } from 'zod'

export const createBookingSchema = z.object({
  // TODO: Definisikan field schema sesuai domain
})

export const updateBookingSchema = createBookingSchema.partial()

export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>
