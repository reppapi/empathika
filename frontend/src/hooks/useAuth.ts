import { useAuthStore } from "@/store/authStore"

export function useAuth() {
  const { user, isAuthenticated, logout } = useAuthStore()
  return { user, isAuthenticated, logout }
}

