import axios from "axios"

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
})

// Request interceptor: attach access token (baca dari localStorage atau cookie)
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    let token = localStorage.getItem("access_token")
    if (!token && typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]+)/)
      if (match && match[1]) {
        token = decodeURIComponent(match[1].trim())
      }
    }
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: global error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const currentToken = localStorage.getItem("access_token")
      // Hanya hapus token asli jika memang invalid dari backend, jangan hapus token prototype
      if (currentToken && !currentToken.startsWith("dummy-")) {
        localStorage.removeItem("access_token")
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient

