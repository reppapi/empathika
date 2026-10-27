import apiClient from "@/lib/axios"
import type { LoginPayload, RegisterPayload, AuthResponse } from "@/types/auth.types"

export const authService = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthResponse>("/auth/login", payload).then((r) => r.data),

  loginGoogle: (credential: string, rememberMe?: boolean) =>
    apiClient.post<AuthResponse>("/auth/google", { credential, rememberMe }).then((r) => r.data),

  register: (payload: RegisterPayload) =>
    apiClient.post<AuthResponse>("/auth/register", payload).then((r) => r.data),

  logout: () =>
    apiClient.post("/auth/logout").then((r) => r.data),

  refreshToken: () =>
    apiClient.post<{ accessToken: string }>("/auth/refresh").then((r) => r.data),

  setPassword: (payload: { token: string; password: string }) =>
    apiClient
      .post<{ success: boolean; message: string; user: any }>("/auth/set-password", payload)
      .then((r) => r.data),

  checkActivation: (token: string) =>
    apiClient
      .get("/auth/activation", {
        params: { token },
        validateStatus: (status) => status < 500,
      })
      .then((r) => r.data),
}

