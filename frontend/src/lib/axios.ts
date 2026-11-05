import axios from "axios"
import { getAuthCookie, removeAuthCookie } from "./cookie"

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true,
})

// Request interceptor: attach access token (baca dari localStorage, sessionStorage, atau cookie)
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const isRemembered = localStorage.getItem("remember_me") === "true"
    let token = isRemembered
      ? localStorage.getItem("access_token")
      : sessionStorage.getItem("access_token")

    if (!token) {
      token = getAuthCookie("access_token")
    }

    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: global error handling & auto-redirect saat sesi habis (401)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const currentToken =
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token")

      // Bersihkan auth state jika token invalid atau sudah kedaluwarsa
      if (currentToken && !currentToken.startsWith("dummy-")) {
        localStorage.removeItem("access_token")
        localStorage.removeItem("remember_me")
        localStorage.removeItem("empathika-auth")
        localStorage.removeItem("active_psikolog_id")
        localStorage.removeItem("active_psikolog_name")
        sessionStorage.removeItem("access_token")
        sessionStorage.removeItem("user_role")
        sessionStorage.removeItem("active_psikolog_id")
        sessionStorage.removeItem("active_psikolog_name")
        removeAuthCookie("access_token")
        removeAuthCookie("remember_me")
      }

      // Hindari loop redirect jika error 401 terjadi di halaman login itu sendiri
      const pathname = window.location.pathname
      const isAuthPage =
        pathname === "/login" ||
        pathname === "/register" ||
        pathname.startsWith("/login")

      if (!isAuthPage) {
        window.location.href = "/login?status=expired"
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
