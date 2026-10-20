import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z.string().min(1, { message: "Password wajib diisi" }),
})

export const loginResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    user: z.object({
      id: z.string(),
      nama: z.string(),
      email: z.string(),
      role: z.string(),
    }),
    accessToken: z.string(),
  }),
})

export const userProfileResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    user: z.object({
      id: z.string(),
      nama: z.string(),
      email: z.string(),
      role: z.string(),
    }),
  }),
})

export type LoginInput = z.infer<typeof loginSchema>
export type LoginResponse = z.infer<typeof loginResponseSchema>
export type UserProfileResponse = z.infer<typeof userProfileResponseSchema>
