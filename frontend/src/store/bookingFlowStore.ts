import { create } from "zustand"

type BookingStep = "pilih-psikolog" | "pilih-jadwal" | "pilih-metode" | "konfirmasi"

interface BookingFlowState {
  step: BookingStep
  psikologId: string | null
  jadwalId: string | null
  metode: "online" | "offline" | null
  catatan: string
  setStep: (step: BookingStep) => void
  setPsikolog: (id: string) => void
  setJadwal: (id: string) => void
  setMetode: (metode: "online" | "offline") => void
  setCatatan: (catatan: string) => void
  reset: () => void
}

export const useBookingFlowStore = create<BookingFlowState>()((set) => ({
  step: "pilih-psikolog",
  psikologId: null,
  jadwalId: null,
  metode: null,
  catatan: "",
  setStep: (step) => set({ step }),
  setPsikolog: (id) => set({ psikologId: id, step: "pilih-jadwal" }),
  setJadwal: (id) => set({ jadwalId: id, step: "pilih-metode" }),
  setMetode: (metode) => set({ metode, step: "konfirmasi" }),
  setCatatan: (catatan) => set({ catatan }),
  reset: () => set({ step: "pilih-psikolog", psikologId: null, jadwalId: null, metode: null, catatan: "" }),
}))

