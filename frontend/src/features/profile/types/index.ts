export type RoleType = "admin" | "psikolog"

export interface AdminProfileData {
  nama: string
  email: string
  noTelepon: string
  bio: string
  foto: string | null
  // Bidang khusus psikolog (sesuai POV klien / DetailPsikologUI)
  kategoriProfesi?: "psikolog" | "konselor" | "peer-konselor"
  spesialisasi?: string
  noStr?: string
  noSipp?: string
  pendidikanText?: string
  quote?: string
  instagram?: string
  jenisKelamin?: "Laki-laki" | "Perempuan" | ""
  keahlian?: string[]
  profilLengkap?: string[]
  videoIntroUrl?: string
  videoThumbnail?: string
  videoDuration?: string
}
