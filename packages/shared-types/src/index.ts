// =====================================================================
// Shared Types - dipakai oleh FE (frontend/) dan BE (backend/)
// Tulis kontrak data di sini agar FE dan BE selalu sinkron
// =====================================================================

// =====================================================================
// USER
// =====================================================================
export type UserRole = 'CLIENT' | 'PSIKOLOG' | 'ADMIN'

export interface UserDto {
  id: string
  name: string
  email: string
  role: UserRole
}

// =====================================================================
// PSIKOLOG
// =====================================================================
export interface PsikologDto {
  id: string
  name: string
  slug: string
  photo: string | null
  bio: string
  specializations: string[]
  priceOnline: number
  priceOffline: number
  rating: number
  isActive: boolean
}

export interface JadwalDto {
  id: string
  psikologId: string
  tanggal: string // ISO date
  waktuMulai: string // HH:MM
  waktuSelesai: string // HH:MM
  isBooked: boolean
}

// =====================================================================
// LAYANAN
// =====================================================================
export type LayananTipe = 'INDIVIDU' | 'PASANGAN' | 'KORPORAT' | 'WORKSHOP' | 'SEMINAR' | 'SCHOOL'

export interface LayananDto {
  id: string
  slug: string
  nama: string
  deskripsi: string
  tipe: LayananTipe
  harga: number | null
  isActive: boolean
}

// =====================================================================
// BOOKING
// =====================================================================
export type MetodeBooking = 'ONLINE' | 'OFFLINE'
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'

export interface BookingDto {
  id: string
  userId: string
  psikologId: string
  jadwalId: string
  metode: MetodeBooking
  catatan: string | null
  status: BookingStatus
  createdAt: string
  psikolog?: PsikologDto
  jadwal?: JadwalDto
}

export interface CreateBookingPayload {
  psikologId: string
  jadwalId: string
  metode: MetodeBooking
  catatan?: string
}

// =====================================================================
// TRANSAKSI
// =====================================================================
export type TransaksiStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
export type PaymentMethod = 'va_bca' | 'va_bni' | 'va_mandiri' | 'gopay' | 'ovo' | 'dana' | 'qris'

export interface TransaksiDto {
  id: string
  bookingId: string
  userId: string
  amount: number
  paymentMethod: PaymentMethod
  status: TransaksiStatus
  expiresAt: string | null
  paidAt: string | null
  createdAt: string
  booking?: BookingDto
}

// =====================================================================
// PSIKOTES
// =====================================================================
export interface PsikotesDto {
  id: string
  nama: string
  deskripsi: string
  durasi: number
  isActive: boolean
}

export interface SoalDto {
  id: string
  teks: string
  urutan: number
  pilihan: { value: string; label: string }[]
}

export interface HasilTesDto {
  id: string
  psikotesId: string
  skor: number
  kategori: string
  createdAt: string
}

// =====================================================================
// API RESPONSE
// =====================================================================
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  error: string
  message: string
  details?: Record<string, string[]>
}

export * from './constants'
