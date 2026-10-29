// File: backend/src/modules/psikolog/account-settings.schema.ts
import { z } from "zod"

export const emailChangeRequestSchema = z.object({
  newEmail: z
    .string({ required_error: "Email baru wajib diisi" })
    .email("Format email baru tidak valid")
    .max(100, "Email maksimal 100 karakter"),
  currentPassword: z
    .string({ required_error: "Password saat ini wajib diisi" })
    .min(1, "Password saat ini wajib diisi"),
})

export type EmailChangeRequestInput = z.infer<typeof emailChangeRequestSchema>

export const verifyEmailSchema = z.object({
  token: z
    .string({ required_error: "Token verifikasi wajib diisi" })
    .min(10, "Format token verifikasi tidak valid"),
})

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>

// Standar OWASP ASVS untuk Password
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ required_error: "Password lama wajib diisi" })
      .min(1, "Password lama wajib diisi"),
    newPassword: z
      .string({ required_error: "Password baru wajib diisi" })
      .min(8, "Password minimal 8 karakter")
      .max(72, "Password maksimal 72 karakter (batas keamanan bcrypt)")
      .regex(/[a-zA-Z]/, "Password harus mengandung huruf")
      .regex(/[0-9]/, "Password harus mengandung minimal 1 angka"),
    confirmNewPassword: z
      .string({ required_error: "Konfirmasi password baru wajib diisi" })
      .min(1, "Konfirmasi password baru wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Konfirmasi password baru tidak cocok",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Password baru tidak boleh sama dengan password saat ini",
    path: ["newPassword"],
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
