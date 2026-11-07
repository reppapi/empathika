// ==========================================
// CONSTANTS & ENUMS UNTUK FITUR EVENT
// ==========================================

export const EVENT_JENIS = {
  WORKSHOP: "Workshop",
  SEMINAR: "Seminar",
  WEBINAR: "Webinar",
} as const

export type EventJenis = (typeof EVENT_JENIS)[keyof typeof EVENT_JENIS]

export const EVENT_TIPE = {
  ONLINE: "Online",
  OFFLINE: "Offline",
} as const

export type EventTipe = (typeof EVENT_TIPE)[keyof typeof EVENT_TIPE]

export const EVENT_STATUS = {
  DIPUBLIKASI: "Dipublikasi",
  SELESAI: "Selesai",
  DRAFT: "Draft",
} as const

export type EventStatus = (typeof EVENT_STATUS)[keyof typeof EVENT_STATUS]

export const EVENT_LIMITS = {
  MAX_DOKUMENTASI_FOTO: 10,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  MAX_KUOTA: 10000,
  MIN_KUOTA: 1,
} as const

