import { z } from "zod"

export const createBookingSchema = z.object({
  psikologId: z.string().uuid(),
  jadwalId: z.string().uuid(),
  metode: z.enum(["online", "offline"]),
  catatan: z.string().optional(),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>

