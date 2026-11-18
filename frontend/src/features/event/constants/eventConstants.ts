// ==========================================
// CONSTANTS & ENUMS UNTUK FITUR EVENT
// ==========================================

export const EVENT_JENIS = {
  WORKSHOP: "Workshop",
  SEMINAR: "Seminar",
  KOLABORASI: "Kolaborasi",
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

export const ARSIP_KATEGORI_TABS = [
  { id: "SEMINAR", label: "Seminar" },
  { id: "WORKSHOP", label: "Workshop" },
  { id: "KOLABORASI", label: "Kolaborasi" },
] as const

export type ArsipKategoriTab = (typeof ARSIP_KATEGORI_TABS)[number]["id"]

export const DOKUMENTASI_WORKSHOP_PILLS = [
  "Semua",
  "SEFT",
  "Mind Record",
  "Empty Chair",
  "Financial Well Being",
  "Self Compassion",
  "Mindfulness",
  "Clinical Hypnotherapy",
  "Positive Psychotherapy",
  "Public Speaking Kesehatan Mental",
  "Peer Helper",
] as const

export type DokumentasiWorkshopPill = (typeof DOKUMENTASI_WORKSHOP_PILLS)[number]



