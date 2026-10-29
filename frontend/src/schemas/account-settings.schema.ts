// File: frontend/src/schemas/account-settings.schema.ts
import { z } from "zod"

export const emailChangeFormSchema = z.object({
  newEmail: z
    .string()
    .min(1, "Email baru wajib diisi")
    .email("Format alamat email tidak valid"),
  currentPassword: z
    .string()
    .min(1, "Password saat ini wajib diisi untuk konfirmasi"),
})

export type EmailChangeFormValues = z.infer<typeof emailChangeFormSchema>

export const passwordChangeFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Password lama wajib diisi"),
    newPassword: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(/[a-zA-Z]/, "Password harus mengandung huruf")
      .regex(/[0-9]/, "Password harus mengandung minimal 1 angka"),
    confirmNewPassword: z.string().min(1, "Konfirmasi password baru wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Konfirmasi password baru tidak cocok",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Password baru tidak boleh sama dengan password saat ini",
    path: ["newPassword"],
  })

export type PasswordChangeFormValues = z.infer<typeof passwordChangeFormSchema>
