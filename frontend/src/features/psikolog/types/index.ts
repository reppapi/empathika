// frontend/src/features/admin/psikolog/types.ts

export type KategoriTenaga = "psikolog" | "konselor" | "peer-konselor"

export type StatusAkses = "AKTIF" | "NONAKTIF"

export interface TenagaAhli {
  id: string
  nama: string
  email: string
  password?: string // Akun login yang diset admin utama / diganti oleh psikolog
  noTelepon: string
  kategori: KategoriTenaga
  statusAkses: StatusAkses // "AKTIF" (Beri Akses) atau "NONAKTIF" (Hapus Akses)
  spesialisasi: string
  noStr?: string
  noSipp?: string
  pendidikanText?: string
  jumlahSesi: number
  bio: string
  quote?: string
  instagram?: string
  foto: string | null
  keahlian: string[]
  tanggalBergabung: string
  tokenAktivasi?: string
  tokenExpiredAt?: string
}
