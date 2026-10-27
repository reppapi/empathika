export type StatusAktivasiBiro = "Menunggu Aktivasi" | "Aktif" | "Nonaktif"

export interface BiroKomunitas {
  id: string
  nama: string
  slug: string
  logo?: string
  deskripsi: string
  warnaIdentitas: string
  emailAdmin: string
  tanggalDibuat: string // YYYY-MM-DD
  statusAktivasi: StatusAktivasiBiro
  telepon?: string
  alamat?: string
  websiteUrl?: string
  dashboardUrl?: string
  aktivasiToken?: string
  tanggalAktivasi?: string
  tokenExpiredAt?: string
  /** accountId dari tabel Account (untuk tombol generate link aktivasi) */
  accountId?: string
  /** Flag apakah akun sudah aktif (password sudah di-set) */
  accountAktif?: boolean
}

export interface BiroFormData {
  nama: string
  slug?: string
  logo?: string
  deskripsi: string
  warnaIdentitas: string
  emailAdmin: string
  telepon?: string
  alamat?: string
  statusAktivasi?: StatusAktivasiBiro
  aktivasiToken?: string
  tokenExpiredAt?: string
}
