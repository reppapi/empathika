// Auth types
export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  user: {
    id: string
    name: string
    email: string
    role: "CLIENT" | "PSIKOLOG" | "ADMIN"
  }
  accessToken: string
}

