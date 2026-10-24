// Auth types
export interface LoginPayload {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface AuthUserData {
  id: string
  nama: string
  email: string
  role: "ADMIN" | "BIRO" | "PSIKOLOG" | string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: AuthUserData
    accessToken: string
  }
}
