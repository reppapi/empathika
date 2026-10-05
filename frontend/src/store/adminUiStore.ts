import { create } from "zustand"

interface AdminUiStore {
  isSidebarOpen: boolean
  toggleSidebar: () => void
  activeModal: string | null
  openModal: (modal: string) => void
  closeModal: () => void
}

export const useAdminUiStore = create<AdminUiStore>()((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  activeModal: null,
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
}))

