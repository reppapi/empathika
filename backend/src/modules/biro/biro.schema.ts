import { z } from "zod"

export const updateBiroAccountSchema = z.object({
  email: z.string().email("Format email tidak valid").optional(),
  passwordLama: z.string().min(1, "Password lama wajib diisi jika ingin mengganti password").optional(),
  passwordBaru: z.string().min(6, "Password baru minimal 6 karakter").optional(),
})

export type UpdateBiroAccountInput = z.infer<typeof updateBiroAccountSchema>
