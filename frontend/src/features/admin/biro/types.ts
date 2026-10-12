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
}
