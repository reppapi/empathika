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

export interface AuthBiroData {
  id: string
  nama_biro: string
  slug: string
  warna_tema?: string | null
  logoURI?: string | null
}

export interface AuthUserData {
  id: string
  nama: string
  email: string
  role: "ADMIN" | "BIRO" | "PSIKOLOG" | string
  id_biro?: string | null
  biro?: AuthBiroData | null
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: AuthUserData
    accessToken: string
  }
}
