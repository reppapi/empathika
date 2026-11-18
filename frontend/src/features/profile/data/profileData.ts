import { AdminProfileData } from "../types"

export const DEFAULT_ADMIN: AdminProfileData = {
  nama: "",
  email: "",
  noTelepon: "",
  bio: "",
  foto: null,
  alamat: "",
  linkMaps: "",
  instagram: "",
  tiktok: "",
  youtube: "",
  linkedin: "",
}

export const DEFAULT_PSIKOLOG: AdminProfileData = {
  nama: "",
  email: "",
  noTelepon: "",
  bio: "",
  foto: null,
  kategoriProfesi: "psikolog",
  spesialisasi: "",
  noStr: "",
  noSipp: "",
  pendidikanText: "",
  quote: "",
  instagram: "",
  jenisKelamin: "",
  videoIntroUrl: "",
  videoThumbnail: "",
  videoDuration: "",
  keahlian: [],
  profilLengkap: [],
}
