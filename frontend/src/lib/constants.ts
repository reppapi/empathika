export const APP_NAME = "Empathika"
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

export const BOOKING_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
} as const

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const

export const USER_ROLES = {
  CLIENT: "CLIENT",
  PSIKOLOG: "PSIKOLOG",
  ADMIN: "ADMIN",
} as const

