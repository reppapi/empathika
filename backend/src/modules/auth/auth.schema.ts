import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z.string().min(1, { message: "Password wajib diisi" }),
  rememberMe: z.boolean().optional(),
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

export const setPasswordSchema = z.object({
  token: z.string().min(1, { message: "Token aktivasi wajib diisi" }),
  password: z.string().min(8, { message: "Password minimal 8 karakter" }),
})

export type SetPasswordInput = z.infer<typeof setPasswordSchema>

export const resendActivationSchema = z.object({
  accountId: z.string().min(1, { message: "ID Akun wajib diisi" }),
})

export type ResendActivationInput = z.infer<typeof resendActivationSchema>

export const googleLoginSchema = z.object({
  credential: z.string().min(1, { message: "Credential token Google wajib diisi" }),
  rememberMe: z.boolean().optional(),
})

export type GoogleLoginInput = z.infer<typeof googleLoginSchema>

