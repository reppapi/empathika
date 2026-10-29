// File: frontend/src/services/account-settings.service.ts
import apiClient from "@/lib/axios"
import type { EmailChangeFormValues, PasswordChangeFormValues } from "@/schemas/account-settings.schema"

export interface PendingEmailResponse {
  currentEmail: string
  pendingRequest: {
    id: string
    newEmail: string
    expiresAt: string
    createdAt: string
  } | null
}

export const accountSettingsService = {
  getPendingEmailChange: () =>
    apiClient
      .get<PendingEmailResponse>("/api/psikolog/account/email/change-request")
      .then((res) => res.data),

  requestEmailChange: (data: EmailChangeFormValues) =>
    apiClient
      .post<{ success: boolean; message: string; pendingEmail: string }>(
        "/api/psikolog/account/email/change-request",
        data
      )
      .then((res) => res.data),

  cancelEmailChange: () =>
    apiClient
      .delete<{ success: boolean; message: string }>("/api/psikolog/account/email/change-request")
      .then((res) => res.data),

  verifyEmail: (token: string) =>
    apiClient
      .post<{ success: boolean; message: string }>("/api/account/email/verify", { token })
      .then((res) => res.data),

  changePassword: (data: PasswordChangeFormValues) =>
    apiClient
      .patch<{ success: boolean; message: string }>("/api/psikolog/account/password", data)
      .then((res) => res.data),
}
